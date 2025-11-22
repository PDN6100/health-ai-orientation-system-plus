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
module.exports={getSymptomes, getHistory};