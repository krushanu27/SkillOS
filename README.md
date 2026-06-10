# SkillOS

AI-Powered Operating System for Reusable Expert Skills

---

## Overview

SkillOS is a productivity-focused AI platform that transforms expert workflows into reusable AI-powered skills.

Instead of repeatedly writing prompts, users can launch a skill, provide input, optionally upload supporting documents, and receive structured AI-generated outputs.

The platform is designed to support professional, academic, legal, development, and creative workflows through a unified workspace.

---

## Current Version

**Version:** v0.6.0

**Status:** Stable MVP

---

## Core Features

### Dashboard

* Professional AI Workspace UI
* Skill Search
* Category Filters
* Theme Switching
* Active Navigation
* Responsive Tablet Layout

### Skill Workspace

* Reusable Expert Skills
* File Upload Support
* Runtime Processing Console
* Copy Output
* Reset Workspace
* Success Notifications
* Workspace Information Cards

### Execution History

* Persistent Skill History
* Timeline Style View
* Latest-First Sorting
* Loading States
* Empty States

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* React Router

### Backend

* FastAPI
* Python

### AI Layer

* Ollama
* Local LLMs

### Storage

Current:

* JSON Persistence

Planned:

* PostgreSQL

---

## Project Structure

### Frontend

```txt
frontend/
└── src/
    ├── app/
    ├── pages/
    ├── services/
    ├── types/
    ├── index.css
    └── main.tsx
```

### Backend

```txt
backend/
└── app/
    ├── main.py
    ├── routes/
    ├── services/
    ├── skills/
    ├── uploads/
    └── history_store.py
```

---

## Available APIs

### Skills

```http
GET /skills
POST /skills/run
GET /skills/history
```

### Files

```http
POST /files/upload
```

### AI

```http
POST /ai/chat
```

---

## Running the Project

### Backend

```bash
cd backend
uvicorn app.main:app --reload
```

Backend URL:

```txt
http://localhost:8000
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

---

## Workflow

1. Select a Skill
2. Enter Instructions
3. Optionally Upload a File
4. Execute Skill
5. Receive AI Output
6. Review Execution History

---

## Current Limitations

* Local Ollama dependency
* No user authentication
* No user accounts
* Shared history for all users
* JSON-based persistence
* No cloud deployment
* No favorites system
* No recent skills tracking
* No multi-user support

---

## Roadmap

### v0.7.0

* Favorites
* Recent Skills
* History Management
* Additional Workspace Improvements

### v0.8.0

* Authentication
* User Accounts

### v0.9.0

* PostgreSQL Migration
* Production Data Layer

### v1.0.0

* Public MVP Release
* Hosted Deployment
* Production AI Integration

---

## Author

Krushanu Bhatt

MCA Graduate | AI/ML Enthusiast | Full Stack Developer

---

## License

Personal Project
