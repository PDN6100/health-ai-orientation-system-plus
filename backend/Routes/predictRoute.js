const express = require("express");
const router = express.Router();
const PredictController = require("../controllers/PredictController")
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PredictModel = require('../Models/PredictModeldb');

// Original endpoints (save to DB)
router.post("/",PredictController.getSymptomes);
router.get("/",PredictController.getHistory);
router.delete('/:id', PredictController.deleteHistory);
router.get('/export', PredictController.exportHistory);

// Lightweight test endpoint: forward symptoms to ML service and return the result without DB persistence
router.post('/test', async (req, res) => {
	try {
		const symptomes = req.body.symptomes || [];
		const response = await axios.post('http://127.0.0.1:5000/predict', { symptoms: symptomes }, { headers: { 'Content-Type': 'application/json' } });
		return res.json(response.data);
	} catch (err) {
		console.error('Error in /api/predict/test forwarding:', err && err.toString ? err.toString() : err);
		return res.status(500).json({ error: err && err.toString ? err.toString() : 'Unknown error' });
	}
});

// Robust forward endpoint: try ML service with retries, fallback to local mock using backend data
router.post('/forward', async (req, res) => {
	const symptomes = req.body.symptomes || [];
	const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000/predict';
	const retries = 2;
	const timeout = 3000; // ms

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const response = await axios.post(mlUrl, { symptoms: symptomes }, { headers: { 'Content-Type': 'application/json' }, timeout });
			if (response && response.data) {
				return res.json(response.data);
			}
		} catch (err) {
			console.warn(`Attempt ${attempt + 1} to call ML service failed:`, err && err.toString ? err.toString() : err);
			// small delay between retries
			if (attempt < retries) await new Promise(r => setTimeout(r, 300));
		}
	}

	// Fallback: read backend diseaseAdvice.json and return a deterministic mock
	try {
		const jsonPath = path.join(__dirname, '..', 'data', 'diseaseAdvice.json');
		const raw = fs.readFileSync(jsonPath, 'utf8');
		const data = JSON.parse(raw);
		const keys = Object.keys(data);
		if (keys.length === 0) {
			return res.status(502).json({ error: 'ML service unavailable and no local disease data to mock.' });
		}
		const index = symptomes.reduce((acc, s) => acc + (s ? s.length : 0), 0) % keys.length;
		const disease = keys[index];
		const info = data[disease] || {};
		const confidence = Math.min(0.95, 0.6 + Math.min(symptomes.length, 4) * 0.1);
		const description = info.fullDescription || info.overview || '';
		const precautions = info.practicalTips || info.prevention || [];
		return res.json({ disease, confidence, description, precautions, _mock: true });
	} catch (err) {
		console.error('Fallback mock failed:', err);
		return res.status(502).json({ error: 'ML service unavailable and fallback failed.' });
	}
});

// Save a prediction document directly (used by frontend when forward was used)
router.post('/save', async (req, res) => {
	try {
		const { disease, description, precautions, symptomes, confidence, userId } = req.body;
		if (!userId) return res.status(400).json({ error: 'userId is required to save history' });

		// Normalize confidence to 0-100 stored value
		let storedConfidence = typeof confidence === 'number' ? confidence : parseFloat(confidence);
		if (isNaN(storedConfidence)) storedConfidence = 0;
		if (storedConfidence <= 1) storedConfidence = Math.round(storedConfidence * 100 * 100) / 100; // preserve two decimals
		// If already in 0-100 range, keep as-is

		const doc = new PredictModel({
			disease: disease || 'Unknown',
			description: description || '',
			precautions: Array.isArray(precautions) ? precautions : (precautions ? [precautions] : []),
			Symptomes: Array.isArray(symptomes) ? symptomes : (symptomes ? symptomes : []),
			Confidence: storedConfidence,
			Userid: userId,
		});

		await doc.save();
		return res.json(doc);
	} catch (err) {
		console.error('Error saving prediction via /api/predict/save:', err);
		// If DB save fails, return a best-effort object so frontend can still update UI
		const fallback = {
			disease: req.body?.disease || 'Unknown',
			description: req.body?.description || '',
			precautions: Array.isArray(req.body?.precautions) ? req.body.precautions : (req.body?.precautions ? [req.body.precautions] : []),
			Symptomes: Array.isArray(req.body?.symptomes) ? req.body.symptomes : (req.body?.symptomes ? req.body.symptomes : []),
			Confidence: (function(){
				let c = parseFloat(req.body?.confidence);
				if (isNaN(c)) return 0;
				if (c <= 1) return Math.round(c * 100 * 100) / 100;
				return c;
			})(),
			Userid: req.body?.userId || null,
			_saved: false,
		};
		return res.status(200).json(fallback);
	}
});

module.exports=router;

