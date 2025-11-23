const predict = require("../Models/PredictModeldb");
const axios =require("axios")
let getSymptomes = async(req,res)=>{
    try{
        let Symptomes = req.body.symptomes; 
        let userId = req.body.userId;
        axios.post('http://127.0.0.1:5000/predict', {
            // Données à envoyer dans le corps de la requête
            symptoms: Symptomes,
        }, {
            // Options de configuration (facultatif)
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            console.log('Réponse:', response.data);
            let predictions=new predict({
                disease:response.data.disease,
                description:response.data.description,
                precautions:response.data.precautions,
                Symptomes:Symptomes,
                Confidence:response.data.confidence,
                Userid:userId
            });
            predictions.save().then(()=>{
                console.log("Sauvegarde réussie");
                res.json(predictions);
            }).catch((err)=>{
                console.error("Erreur lors de la sauvegarde",err);
                res.status(500).send("Internal Server Error")
            });
            
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
        
        
    }catch(err){
        for (let e in err.errors){
            console.log(err.errors[e].message);
            res.status(400).send("Bad Request")
        }
    }
}      
let getHistory = async (req,res)=>{
    try{
        let userId = req.query.userId;
        predict.find({Userid:userId}).then((predictions)=>{
            res.json(predictions);
        }).catch((err)=>{
            console.error("Erreur lors de la récupération",err);
            res.status(500).send("Internal Server Error")
        });
        
    }catch(err){
        console.error("Erreur lors de la récupération",err);
        res.status(500).send("Internal Server Error");
    }
}    

let deleteHistory = async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await predict.findById(id);
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        await predict.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        console.error('Erreur deleteHistory', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

let exportHistory = async (req, res) => {
    try {
        const userId = req.query.userId;
        const rows = await predict.find({ Userid: userId }).lean();
        // Build CSV header
        const header = ['_id','disease','description','Symptomes','Confidence','Userid','createdAt'];
        const csv = [header.join(',')];
        rows.forEach(r => {
            const line = [
                `"${r._id}"`,
                `"${(r.disease || '').toString().replace(/"/g,'""')}"`,
                `"${(r.description || '').toString().replace(/"/g,'""')}"`,
                `"${(Array.isArray(r.Symptomes) ? r.Symptomes.join(';') : (r.Symptomes||'')).toString().replace(/"/g,'""')}"`,
                `"${r.Confidence || ''}"`,
                `"${r.Userid || ''}"`,
                `"${r.createdAt || ''}"`,
            ];
            csv.push(line.join(','));
        });

        const csvContent = csv.join('\n');
        res.setHeader('Content-disposition', `attachment; filename=history_${userId || 'export'}.csv`);
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csvContent);
    } catch (err) {
        console.error('Erreur exportHistory', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
module.exports={getSymptomes, getHistory, deleteHistory, exportHistory};