# Generational Political Turnout

🌐 Live Demo: https://safwans143.github.io/Generational-Political-Turnout/

An interactive full-stack data platform analyzing generational differences in political turnout across elections. This project explores how voter participation varies by age group and demographic factors, with a focus on uncovering trends in youth engagement and generational gaps.

---

## 🚀 Overview

Political turnout varies significantly across age groups, with younger voters historically participating at lower rates than older generations :contentReference[oaicite:0]{index=0}. This project visualizes and analyzes these patterns through an interactive web platform, enabling users to explore turnout data across regions and demographics.

The platform integrates multiple datasets and provides intuitive visual tools to better understand:
- Generational turnout gaps
- Regional voting patterns
- Demographic influences on political participation

---

## 🧠 Features

- 📊 **Interactive Data Visualization**
  - Dynamic charts and maps showing turnout trends across age groups
- 🗺️ **Geospatial Mapping**
  - Region-based exploration using map-based UI (Leaflet)
- 🔍 **Multi-Dataset Integration**
  - Combined and cleaned datasets for consistent analysis
- ⚡ **Full-Stack Architecture**
  - Frontend + backend with API-driven data access
- 🌐 **Deployed Application**
  - Hosted frontend with live updates via GitHub Pages

---

## 🏗️ Tech Stack

**Frontend**
- React / JavaScript
- Leaflet (mapping)
- HTML/CSS

**Backend**
- FastAPI (Python)
- RESTful API design

**Database**
- PostgreSQL (hosted via Supabase)

**Data Processing**
- Python (pandas, NumPy)

**Deployment**
- GitHub Pages (frontend)
- Supabase (backend + database hosting)

---

## 📊 Data & Analysis

- Processed and cleaned multiple datasets (~2.4k+ records)
- Performed exploratory data analysis to identify turnout trends
- Focused on generational patterns in political engagement

Research shows that younger cohorts often exhibit lower turnout due to factors like political knowledge gaps and engagement differences, making generational analysis critical for understanding democratic participation.

---

## 🧩 System Architecture

```
Frontend (React + Leaflet)
↓
REST API (FastAPI)
↓
PostgreSQL Database (Supabase)
```

---

## ⚙️ Setup Instructions

### 1. Clone repo

```bash
git clone https://github.com/SafwanS143/Generational-Political-Turnout.git
cd Generational-Political-Turnout
```

### 2. Backend Setup

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

### 3. Frontend Setup

cd frontend

npm install

npm run dev

### 📈 Key Outcomes

- Built a full-stack data platform with real-world datasets
- Enabled interactive exploration of political turnout trends
- Delivered insights into generational engagement patterns
- Deployed a live application accessible to users

### 🔮 Future Improvements

- Add real-time data updates
- Expand datasets to include more elections
- Enhance analytics with predictive modeling
- Improve performance and loading times

### 👤 Author

Safwan Shiblee
University of Waterloo — Mechatronics Engineering

- GitHub: https://github.com/SafwanS143
- LinkedIn: https://linkedin.com/in/safwan-shiblee/

