const express = require("express");
const router = express.Router();
const PredictController = require("../controllers/PredictController")

router.post("/",PredictController.getSymptomes);
router.get("/",PredictController.getHistory);
router.delete('/:id', PredictController.deleteHistory);
router.get('/export', PredictController.exportHistory);
module.exports=router;