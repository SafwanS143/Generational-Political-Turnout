<div align="center">

# Generational Political Turnout

**An interactive geospatial platform for analyzing voter turnout across age cohorts, regions, and federal elections in Canada.**

[![Live](https://img.shields.io/badge/demo-live-22c55e?style=flat-square)](https://safwans143.github.io/Generational-Political-Turnout/)
[![Hosted by](https://img.shields.io/badge/hosted%20by-GLOCAL%20Foundation-0a66c2?style=flat-square)](https://glocalfoundation.ca)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-000000?style=flat-square&logo=nextdotjs&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](#)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.3-336791?style=flat-square&logo=postgresql&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](#)
[![Jenkins](https://img.shields.io/badge/CI-Jenkins-D24939?style=flat-square&logo=jenkins&logoColor=white)](#)
[![SonarQube](https://img.shields.io/badge/quality-SonarQube-4E9BCD?style=flat-square&logo=sonarqube&logoColor=white)](#)
[![Tests](https://img.shields.io/badge/tests-pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white)](#)

[**Live Demo**](https://safwans143.github.io/Generational-Political-Turnout/) ·
[Architecture](#architecture) ·
[API](#api-reference) ·
[Local Setup](#local-development) ·
[CI/CD](#cicd-pipeline)

</div>

---

## Overview

This project quantifies and visualizes how political participation diverges across **generations, genders, and provinces** in Canadian federal elections, with a focus on the post-secondary "Vote on Campus" cohort. It was built during the **Summer 2025 GLOCAL Foundation of Canada** internship, deployed via GitHub Pages, and **embedded on the GLOCAL Foundation website**, where it serves as the foundation's public-facing turnout analytics tool.

The system ingests, geocodes, and normalizes multi-source electoral data into a PostGIS-backed warehouse, exposes it through a typed FastAPI service, and renders it as an interactive Leaflet + Recharts dashboard.

---

## Architecture

```
   ┌────────────────────────┐         ┌──────────────────────────────┐
   │  GLOCAL Foundation     │ ──────▶ │  GitHub Pages (Next.js 15    │
   │  public website        │  embed  │  static export · React 19 ·  │
   │                        │         │  Leaflet · Recharts · TS)    │
   └────────────────────────┘         └──────────────┬───────────────┘
                                                     │  HTTPS / JSON
                                      ┌──────────────▼───────────────┐
                                      │   FastAPI · uvicorn          │
                                      │   Dockerized service · CORS  │
                                      └──────────────┬───────────────┘
                                                     │  SQLAlchemy + GeoAlchemy2
                                      ┌──────────────▼───────────────┐
                                      │  Supabase · PostgreSQL 15    │
                                      │  + PostGIS 3.3 extension     │
                                      └──────────────────────────────┘

   Offline ETL :  CSV ─▶ pandas / NumPy ─▶ GeoPy / Nominatim ─▶ PostGIS
   CI / CD     :  Jenkins  →  Docker build  →  pytest + coverage  →  SonarQube  →  docker-compose deploy
```

The frontend is a **statically exported Next.js bundle** — no server runtime is required at the edge. The FastAPI service is **fully containerized** and reproducible from `docker-compose.yml`; production data lives on a managed Supabase Postgres instance with the PostGIS extension enabled.

---

## Tech Stack

| Layer            | Stack                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Frontend**     | Next.js 15.3, React 19, TypeScript 5, Tailwind CSS 4, Leaflet 1.9, react-leaflet, Recharts, axios |
| **Backend**      | FastAPI 0.104, Uvicorn, SQLAlchemy, GeoAlchemy2, Alembic, python-dotenv               |
| **Data / ETL**   | pandas 2.0, NumPy 1.24, GeoPy (Nominatim with rate-limited cache), tqdm, Folium       |
| **Database**     | PostgreSQL 15 + PostGIS 3.3 (Supabase managed pooler)                                 |
| **Infra**        | Docker, docker-compose                                                                 |
| **CI / CD**      | Jenkins (declarative pipeline-as-code), SonarQube static analysis                      |
| **Quality**      | pytest, pytest-cov, SonarQube quality gates, ESLint, TypeScript strict mode            |
| **Deployment**   | GitHub Pages (frontend), embedded on the GLOCAL Foundation website                     |

---

## Repository Layout

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint, CORS, routers
│   │   ├── database.py          # SQLAlchemy engine + session factory
│   │   ├── models.py            # ORM models: Institution, AgeGenderTurnout
│   │   ├── routers/             # /api/voter-turnout, /api/age-gender-turnout
│   │   ├── load_to_db.py        # bulk loader from cleaned CSVs
│   │   └── create_tables.py     # schema bootstrap
│   ├── data_processing/         # offline ETL: clean, geocode, normalize
│   ├── tests/                   # pytest suites (FastAPI TestClient)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                     # Next.js app, Leaflet/Recharts components
│   ├── Dockerfile
│   └── package.json
├── data/                        # source CSVs + geocode cache
├── docker-compose.yml           # postgres (PostGIS) + backend + frontend
├── Jenkinsfile                  # 5-stage declarative CI/CD pipeline
├── sonar-project.properties     # SonarQube scanner config
└── .github/workflows/
    └── deploy-frontend.yml      # static export → GitHub Pages
```

---

## API Reference

Base URL (local): `http://localhost:8000`

| Method | Path                       | Description                                                              |
| :----: | -------------------------- | ------------------------------------------------------------------------ |
| `GET`  | `/`                        | Service identity                                                         |
| `GET`  | `/api/health`              | Liveness probe — returns `{"status": "healthy"}`                         |
| `GET`  | `/api/voter-turnout`       | Per-institution turnout with geocoded coordinates and resolution status  |
| `GET`  | `/api/age-gender-turnout`  | Aggregated turnout by election year, province, gender, and age cohort    |
| `GET`  | `/openapi.json`            | OpenAPI 3 schema (auto-generated)                                        |
| `GET`  | `/docs`                    | Swagger UI                                                               |

### Example

```bash
curl -s http://localhost:8000/api/voter-turnout | jq '.[0]'
```

```json
{
  "province": "Ontario",
  "name": "University of Waterloo",
  "votes": 1842,
  "latitude": 43.4723,
  "longitude": -80.5449,
  "geocode_status": "OK",
  "geocode_address": "University of Waterloo, Waterloo, Ontario, Canada"
}
```

---

## Data Pipeline

The ETL layer (`backend/data_processing/`) is **idempotent and re-runnable**:

1. **Ingest** — load raw "Vote on Campus" and "Age & Gender Turnout" CSVs (~2.4k records) into pandas frames.
2. **Clean & normalize** — type coercion, range validation (`0 ≤ turnout ≤ 100`), trim/canonicalize categorical fields, drop rows missing required keys.
3. **Geocode** — resolve institution addresses via **GeoPy / Nominatim** with a `RateLimiter` (1 req/s) and per-row error capture (`OK` / `NOT FOUND` / `ERROR`).
4. **Cache** — geocoded coordinates are persisted to `data/institution_locations.csv`; subsequent runs skip the network round-trip entirely.
5. **Load** — bulk insert into PostGIS via SQLAlchemy / GeoAlchemy2.

This means re-runs cost nothing on cache hit and never duplicate Nominatim's free-tier quota.

---

## Local Development

### Prerequisites

- Docker 24+ and Docker Compose v2
- Node.js 18+ (only if running the frontend outside Docker)
- Python 3.11+ (only if running the backend outside Docker)

### One-shot: full stack via Compose

```bash
git clone https://github.com/SafwanS143/Generational-Political-Turnout.git
cd Generational-Political-Turnout
docker compose up --build
```

| Service     | URL                              |
| ----------- | -------------------------------- |
| Frontend    | http://localhost:3000            |
| Backend API | http://localhost:8000            |
| Swagger UI  | http://localhost:8000/docs       |
| Postgres    | `localhost:5432` (postgres / password) |

### Backend only (host Python)

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend only

```bash
cd frontend
npm ci
npm run dev
```

---

## Testing

Tests live under `backend/tests/` and run against the FastAPI app via `TestClient` (no DB required for the smoke suite).

```bash
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing
```

Inside CI the same command runs **inside the freshly-built backend image**, producing JUnit XML and Cobertura coverage that are fed into Jenkins (`junit`) and SonarQube.

---

## CI/CD Pipeline

A declarative Jenkinsfile (`./Jenkinsfile`) drives every commit through five stages:

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐
│ Checkout │ → │  Build   │ → │   Test   │ → │ SonarQube  │ → │  Deploy  │
└──────────┘   └──────────┘   └──────────┘   └────────────┘   └──────────┘
   git scm      docker build    pytest          static          docker
                backend +       +cov in         analysis,        compose
                frontend        container       quality          up -d
                                JUnit out       gates
```

| Stage              | What it does                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Checkout**       | `checkout scm`                                                                              |
| **Build**          | Builds tagged Docker images for the backend and frontend (`:${BUILD_NUMBER}` and `:latest`) |
| **Test**           | Runs `pytest` inside the backend image; copies `test-results.xml` + `coverage.xml` out; publishes JUnit |
| **SonarQube**      | Runs `sonar-scanner` against `sonar-project.properties` inside `withSonarQubeEnv('SonarQube')` |
| **Deploy**         | Auto-detects `docker compose` vs `docker-compose` and brings the stack up                    |

Secrets follow Jenkins best practice: the SonarQube auth token is injected by the configured server (`withSonarQubeEnv`) and never appears in source control.

The frontend is **independently deployed** to GitHub Pages by the workflow at `.github/workflows/deploy-frontend.yml` on every push to `main`, and the resulting static bundle is **embedded on the GLOCAL Foundation of Canada website**.

---

## Configuration

Backend configuration is environment-driven (`backend/.env` for local, Jenkins credentials in CI):

| Variable        | Purpose                                       | Example                                                            |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`  | SQLAlchemy connection string (Postgres+PostGIS) | `postgresql://postgres:password@postgres:5432/electoral_data`    |

The committed Supabase pooler URL is a **read-only public endpoint** for the deployed dataset and is intentionally not treated as a secret.

---

## Roadmap

- [ ] Materialized views for cohort aggregations (cut median query latency)
- [ ] Time-series turnout projections (ARIMA / lightweight ML baseline)
- [ ] Choropleth overlays at the riding (federal electoral district) level
- [ ] Per-institution drill-down view with year-over-year deltas
- [ ] OpenTelemetry traces from FastAPI → Postgres for request profiling

---

## Acknowledgments

Built during the **Summer 2025 internship at the GLOCAL Foundation of Canada**, in collaboration with a 25-intern cross-functional team. The deployed application is hosted on GLOCAL's public platform and powers their generational-turnout reporting.

Datasets sourced from Elections Canada open data ("Vote on Campus" and "Estimation of Voter Turnout by Age Group and Gender").

---

## Author

**Safwan Shiblee** — B.A.Sc. Mechatronics Engineering, University of Waterloo

[![GitHub](https://img.shields.io/badge/GitHub-SafwanS143-181717?style=flat-square&logo=github)](https://github.com/SafwanS143)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-safwan--shiblee-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/safwan-shiblee/)
[![Website](https://img.shields.io/badge/web-safwanshiblee.com-000000?style=flat-square)](https://safwanshiblee.com)
