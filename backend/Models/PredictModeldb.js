const mongoose = require("mongoose"); 

// Function to format date as DD/MM/YYYY
const formatDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const PredictSchema = new mongoose.Schema({
    disease: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    precautions: {
        type: [String],
        default: []
    },
    Symptomes: {
        type: [String],
        default: []
    },
    Confidence: {
        type: Number,
        min: 0, 
        max: 100
    },
    Userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    createdAt: {
        type: String,
        default: formatDate // Automatically sets the date in DD/MM/YYYY format
    }
});

const Predict = mongoose.model("Prediction", PredictSchema);

module.exports = Predict;
