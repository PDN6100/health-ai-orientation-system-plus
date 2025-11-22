# 🚀 API Predict App Backend

## 📌 Description
This is the backend for the API Predict App, built using **Node.js** and **Express.js** following the **MVC architecture**. It includes authentication, middleware, and various routes for handling user predictions.

## 🌟 Features
- 🔑 User authentication (JWT-based)
- 🔐 Google OAuth authentication
- ✅ Data validation with Joi
- 🔒 Secure password handling with bcrypt
- 🛡️ Middleware for authentication and validation
- 🗄️ MongoDB integration with Mongoose
- 🌍 CORS support

## 📂 Project Structure
```
ApiPredictApp/
│-- config/
│   ├── passport.js
│-- controllers/
│   ├── AuthController.js
│   ├── PredictController.js
│-- Middlewares/
│   ├── Auth.js
│   ├── AuthValidation.js
│   ├── middleware.js
│-- Models/
│   ├── PredictModeldb.js
│   ├── User.js
│-- Routes/
│   ├── AuthRouter.js
│   ├── predictRoute.js
│-- util/
│-- .env
│-- .gitignore
│-- package.json
│-- package-lock.json
│-- Server.js
```

## 🛠️ Installation

### ✅ Prerequisites
- Node.js (v14+ recommended)
- MongoDB installed and running

### 📥 Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/Maymasi/ApiPredictApp.git
   cd ApiPredictApp
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up the environment variables in a `.env` file:
   ```env
   PORT=8080
   JWT_SECRET="secret-123"
   GOOGLE_CLIENT_ID=your_ID
   GOOGLE_CLIENT_SECRET=your_Key
   ```
4. Start the server:
   ```sh
   npm start
   ```

## 🛡️ Middlewares
Middleware functions are used to validate and authenticate requests before processing them. They include:
- `Auth.js` → Handles authentication checks using JWT
- `AuthValidation.js` → Validates input data using Joi
- `middleware.js` → General middleware for handling request modifications

## 📦 Dependencies
```json
{
  "axios": "^1.7.9",
  "bcrypt": "^5.1.1",
  "body-parser": "^1.20.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "nodemon": "^3.1.9",
  "express-session": "^1.18.1",
  "joi": "^17.13.3",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.9.2",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0"
}
```

## 📜 License
This project is licensed under the **MIT License**.

---

## Contact Us

If you'd like to suggest new features or contribute to the project, feel free to contact us on LinkedIn:

- [Oussama Nouhar](https://www.linkedin.com/in/oussama-nouhar-3156132aa)
- [Omaima Siaf](https://www.linkedin.com/in/omaima-siaf-b636132aa/)
- [Souhayla Ghanem](https://www.linkedin.com/in/souhayla-ghanem-28791b306/)

---

## Contributors

- Oussama Nouhar
- Omaima Siaf
- Souhayla Ghanem
