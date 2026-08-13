# 🔐 CyberPassport

### AI-Powered Dynamic Cybersecurity Risk & Digital Trust Passport

CyberPassport is an **AI-powered cybersecurity risk assessment system** that analyzes a user's digital security behavior and generates a **Cyber Trust Score, Future Risk Score, Risk Level, and personalized security recommendations**.

The system combines **Machine Learning, cybersecurity behavioral analysis, explainable predictions, and a recommendation engine** to help users understand their current security posture and take corrective actions.

---

## 🚀 Key Features

* 🔐 **Cyber Trust Score** – evaluates the user's current cybersecurity hygiene on a 0–100 scale.
* ⚠️ **Risk Level Prediction** – classifies users as:

  * 🟢 Low
  * 🟡 Medium
  * 🔴 High
* 📈 **Future Risk Prediction** – estimates the user's potential future cybersecurity risk.
* 🤖 **Machine Learning Prediction** – uses an XGBoost classification model.
* 🧠 **Cybersecurity Feature Analysis** – identifies security weaknesses from user behavior.
* 💡 **Personalized Recommendations** – generates recommendations based on detected security risks.
* 📊 **Risk Dashboard** – displays trust score, risk level, security indicators and recommendations.
* 🔍 **Individual Risk Explanation** – explains why a user receives a particular risk level.
* 🧪 **Scenario Testing** – evaluates how changing security behavior can affect risk.
* 🔄 **Risk Improvement Simulation** – shows how improving security practices can improve the user's security posture.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   React / Vite      │
                    │   Vercel Frontend   │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI         │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
      │ Prediction  │   │ Trust Score │   │Recommendation│
      │   Service   │   │   Service   │   │    Engine    │
      └──────┬──────┘   └─────────────┘   └──────────────┘
             │
             ▼
      ┌─────────────┐
      │   XGBoost   │
      │ ML Model    │
      └─────────────┘
             │
             ▼
      ┌────────────────┐
      │ MongoDB        │
      │ User Profiles  │
      └────────────────┘
```

---

# 🧠 Machine Learning

CyberPassport was developed using a synthetic cybersecurity behavioral dataset containing:

* **100,000 user records**
* **30 total columns**
* **26 categorical cybersecurity features**
* Cyber Trust Score
* Future Risk Score
* Risk Level

### Risk Classes

| Risk Level | Description                       |
| ---------- | --------------------------------- |
| 🟢 Low     | Strong cybersecurity practices    |
| 🟡 Medium  | Moderate cybersecurity weaknesses |
| 🔴 High    | Significant cybersecurity risks   |

---

# 📊 Dataset Features

The model analyzes cybersecurity-related behaviors such as:

* Occupation category
* Password management
* Password change frequency
* Password length
* MFA type
* MFA coverage
* Device encryption
* OS update status
* VPN usage
* Public Wi-Fi usage
* Auto-connect settings
* Phishing detection
* Security training
* HTTPS awareness
* Breach exposure
* Antivirus status
* Login monitoring
* Backup frequency
* Browser password storage
* Software source
* Account alerts
* Cloud backup
* Social media privacy
* Shared device usage
* Email security level
* Past phishing clicks

---

# 🤖 Model Performance

Several machine learning models were evaluated.

| Model             |   Accuracy |  Precision |     Recall |         F1 |
| ----------------- | ---------: | ---------: | ---------: | ---------: |
| Random Forest     |     93.90% |     94.13% |     93.90% |     93.97% |
| Gradient Boosting |     94.08% |     94.10% |     94.08% |     94.09% |
| **XGBoost**       | **94.12%** | **94.15%** | **94.12%** | **94.13%** |

### Selected Model

**XGBoost** was selected as the final prediction model because it provided the best overall performance among the evaluated models.

The trained model is stored as:

```text
models/xgboost_final.pkl
```

---

# 🧮 Cyber Trust Score

The Cyber Trust Score represents the user's current cybersecurity hygiene.

The score ranges from:

```text
0 ─────────────────────────────── 100
High Risk                         Strong Security
```

Higher scores indicate stronger cybersecurity practices.

The system considers factors such as:

* MFA adoption
* Password security
* Device protection
* Software sources
* Phishing behavior
* Security awareness
* Backup practices
* Privacy settings
* Antivirus protection
* Login monitoring

---

# ⚠️ Risk Classification

The system maps the cybersecurity trust score into three levels:

```text
75 – 100  → Low Risk
45 – 74   → Medium Risk
0 – 44    → High Risk
```

These thresholds are used by the cybersecurity risk assessment layer.

---

# 💡 Recommendation Engine

CyberPassport includes a rule-based cybersecurity recommendation engine.

The recommendation engine analyzes the user's security profile and identifies weaknesses.

### Example

If:

```text
MFA = No MFA
```

The system may recommend:

```text
Enable Multi-Factor Authentication (MFA)
```

If:

```text
Password Management = Remember All
```

The system may recommend:

```text
Use a password manager and generate unique passwords.
```

If:

```text
Software Source = Unknown Sources
```

The system may recommend:

```text
Install software only from trusted and verified sources.
```

The recommendation engine can provide:

* Priority
* Security issue
* Explanation
* Recommended action
* Security category

---

# 🔍 Explainable Cybersecurity Analysis

CyberPassport does not only provide a risk label.

It also identifies the cybersecurity factors contributing to the user's risk.

Example:

```text
Risk Level: HIGH

Main Risk Factors:

🔴 No MFA
🔴 Weak Password Management
🔴 Unknown Software Sources
🔴 Frequent Phishing Clicks
🟠 Poor Device Protection

Recommended Actions:

✓ Enable MFA
✓ Use a password manager
✓ Install software only from trusted sources
✓ Complete phishing-awareness training
```

---

# 🧪 Risk Improvement Simulation

CyberPassport can simulate security improvements.

For example:

### Current Profile

```text
MFA: No MFA
Password Management: Remember All
Software Source: Unknown Sources

Trust Score: 42
Risk Level: High
```

### Improved Profile

```text
MFA: Authenticator App
Password Management: Password Manager
Software Source: Official Store

Improved Trust Score: 78
Risk Level: Low
```

This allows users to understand how changing their cybersecurity behavior can improve their security posture.

---

# 🗂️ Project Structure

```text
CyberPassport/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── main.py
│   │
│   ├── services/
│   │   ├── prediction.py
│   │   ├── trust_score.py
│   │   └── recommendation.py
│   │
│   ├── schemas/
│   │   └── user_profile.py
│   │
│   ├── models/
│   │   ├── xgboost_final.pkl
│   │   ├── feature_encoders.pkl
│   │   └── target_encoder.pkl
│   │
│   ├── requirements.txt
│   └── README.md
│
├── notebooks/
│   ├── 01_Data_Generation.ipynb
│   ├── 02_EDA.ipynb
│   ├── 03_Preprocessing.ipynb
│   └── 04_Model_Training.ipynb
│
└── README.md
```

---

# 🔌 Backend API

The backend is implemented using **FastAPI**.

### Main API Operations

#### Health Check

```http
GET /
```

Returns the backend status.

---

### Cybersecurity Risk Prediction

```http
POST /predict
```

Receives a user's cybersecurity profile and returns:

```json
{
  "cyber_trust_score": 76,
  "future_risk_score": 31,
  "risk_level": "Low"
}
```

---

### Recommendations

```http
POST /recommendations
```

Returns personalized cybersecurity recommendations.

Example:

```json
{
  "recommendations": [
    {
      "category": "MFA",
      "priority": "High",
      "recommendation": "Enable Multi-Factor Authentication"
    }
  ]
}
```

---

# 🛡️ Cybersecurity Components

The major cybersecurity components of CyberPassport include:

### 1. Password Security

Analyzes:

* Password management method
* Password length
* Password change behavior

### 2. Multi-Factor Authentication

Analyzes:

* MFA availability
* MFA type
* MFA coverage

### 3. Device Security

Analyzes:

* Device encryption
* Antivirus
* OS updates

### 4. Network Security

Analyzes:

* VPN usage
* Public Wi-Fi usage
* Auto-connect behavior

### 5. Phishing Protection

Analyzes:

* Phishing detection
* Previous phishing clicks
* HTTPS awareness
* Security training

### 6. Privacy

Analyzes:

* Social media privacy
* Shared device usage
* Account alerts

### 7. Data Protection

Analyzes:

* Cloud backup
* Backup frequency
* Browser password storage

---

# 💾 Database

MongoDB can be used to store application-level user information.

Example collections:

```text
users
risk_assessments
recommendations
risk_history
```

MongoDB is **not required for ML training**.

The trained model and encoders remain as files, while MongoDB can be used by the deployed application for:

* User profiles
* Previous risk assessments
* Risk history
* Recommendation history
* Dashboard data

---

# 🧪 Testing

Testing is performed at multiple levels.

### ML Testing

The model is evaluated using:

* Accuracy
* Precision
* Recall
* F1 Score
* Confusion Matrix

### Backend Testing

API endpoints should be tested using:

* Swagger UI
* Postman
* Frontend requests

FastAPI automatically provides interactive API documentation.

```text
/docs
```

### Scenario Testing

Example scenarios:

```text
Scenario 1:
Strong password + MFA + antivirus
→ Low Risk

Scenario 2:
Weak password + No MFA + unknown software
→ High Risk

Scenario 3:
Moderate security practices
→ Medium Risk
```

---

# 🌐 Deployment

### Frontend

The React/Vite frontend can be deployed using:

```text
Vercel
```

### Backend

The FastAPI backend can be deployed using:

```text
Render
```

### Database

MongoDB Atlas can be used as the cloud database.

### Deployment Architecture

```text
User
 │
 ▼
Vercel
React Frontend
 │
 │ HTTPS API
 ▼
Render
FastAPI Backend
 │
 ├── XGBoost Model
 ├── Trust Score Service
 ├── Recommendation Engine
 │
 ▼
MongoDB Atlas
```

---

# ⚙️ Local Setup

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd CyberPassport
```

---

## 2. Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Start FastAPI

```bash
uvicorn main:app --reload
```

Backend will run at:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

---

# 🎨 Frontend Setup

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

The frontend will be available at the Vite development URL shown in the terminal.

---

# 🔐 Environment Variables

Create a `.env` file for backend configuration.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=cyberpassport
```

For the frontend:

```env
VITE_API_URL=http://localhost:8000
```

For production, replace the local backend URL with the deployed Render API URL.

---

# 📁 ML Model Files

The backend requires the trained model and encoders:

```text
models/
├── xgboost_final.pkl
├── feature_encoders.pkl
└── target_encoder.pkl
```

These files are generated during the ML pipeline and are used during prediction.

---

# 🔄 Machine Learning Pipeline

```text
Data Generation
      ↓
Exploratory Data Analysis
      ↓
Data Cleaning
      ↓
Missing Value Handling
      ↓
Categorical Encoding
      ↓
Train/Test Split
      ↓
Model Training
      ↓
Model Evaluation
      ↓
XGBoost Selection
      ↓
Model Serialization
      ↓
FastAPI Prediction Service
      ↓
Cybersecurity Risk Assessment
      ↓
Recommendation Engine
      ↓
Frontend Dashboard
```

---

# 📌 Future Improvements

Future versions of CyberPassport can include:

* Continuous risk monitoring
* Real breach-data integration
* Real-time threat intelligence
* Time-series risk prediction
* User risk history
* Automated security alerts
* Graph-based digital identity analysis
* Advanced SHAP-based explanations
* Adaptive recommendations
* Integration with cybersecurity APIs

---

# 🎯 Project Goal

CyberPassport aims to transform cybersecurity assessment from a **static security checklist into a dynamic AI-powered cybersecurity passport**.

Instead of simply telling users that they are at risk, the system:

```text
Analyze
   ↓
Predict
   ↓
Explain
   ↓
Recommend
   ↓
Simulate Improvement
   ↓
Improve Cybersecurity Posture
```

---

## 👩‍💻 Technologies Used

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost

### Backend

* FastAPI
* Python
* Pydantic
* Uvicorn

### Frontend

* React
* Vite
* TypeScript

### Database

* MongoDB Atlas

### Deployment

* Vercel
* Render

### Development

* VS Code
* Git
* GitHub

---

## 🏆 CyberPassport

**AI-powered cybersecurity risk assessment and digital trust management system.**

> Analyze your digital security.
> Understand your risk.
> Improve your cybersecurity.
