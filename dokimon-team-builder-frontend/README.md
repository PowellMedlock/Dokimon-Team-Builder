# Dokimon Quest Team Builder Frontend

React + Vite frontend for the Spring Boot API.

## Run

Requirements: Node.js 20+ and the Spring Boot backend running on port 8080.

```bash
npm install
npm run dev
```

Open the Vite URL, normally http://localhost:5173.

The frontend uses `GET /api/dokimon` and `POST /api/team-builder/analyze`.

If the backend is elsewhere, create `.env` with:

```text
VITE_API_BASE_URL=http://localhost:8080
```
