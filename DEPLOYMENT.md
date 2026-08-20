# CyberPassport deployment guide

This project is prepared to run as:

- Frontend: Vercel (React + Vite)
- Backend: Render (FastAPI + Python)
- Database: MongoDB Atlas

## 1) Backend on Render

1. Push this repository to GitHub.
2. In Render, create a New Web Service.
3. Set the Root Directory to `backend`.
4. Use the following build command:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

5. Use the following start command:

```bash
gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

6. Add environment variables:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
DATABASE_NAME=cyberpassport
FRONTEND_URL=https://your-vercel-app.vercel.app
PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
JWT_SECRET=generate-a-strong-secret
```

7. Save and deploy.

## 2) Frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Framework preset: Vite.
4. Add the environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

5. Deploy.

## 3) Post-deploy checks

- Confirm the backend health endpoint responds:

```bash
https://your-render-backend-url.onrender.com/health
```

- Confirm the frontend loads and can authenticate against the backend API.
- Confirm the app is using the deployed Render API URL, not localhost.

## 4) Notes

- The frontend is configured to rewrite all routes to `index.html` to support client-side routing.
- The backend CORS config accepts the configured `FRONTEND_URL` plus local development ports.
- The Rails-like ML file mismatch was fixed by resolving the actual model artifact name and exposing the prediction service used by startup and health checks.
