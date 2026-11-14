# SkillPath AI — Intelligent, Adaptive & Evaluation-Driven Learning Ecosystem

Built for **Google Fest**, **SkillPath AI** is an intelligent, multi-agent learning platform that operates on an **EVALUATION-FIRST** principle: understand the learner completely, diagnose their existing competencies through rigorous adaptive assessment, identify exact strengths and weaknesses, and construct a personalized, evidence-grounded learning pathway.

---

## 🌟 Core Philosophy: Evaluation-First Learning

Most learning platforms recommend static courses based on self-reported interests alone. **SkillPath AI never prescribes a roadmap before measuring demonstrated performance.**

1. **Continuous Learner Intelligence Profile:** Maintains living cognitive telemetry for every student.
2. **Multi-Agent AI Architecture:** 10 specialized micro-agents orchestrated around diagnostic assessment and curriculum synthesis.
3. **Adaptive Diagnostic Engine:** Evaluates MCQs, code prediction, debugging, and scenario challenges with test-case accuracy.
4. **Transparent Career Readiness:** Calibrates verified competencies against real-world industry career targets (e.g., Full Stack Developer, Data Scientist, ML Engineer).
5. **Context-Aware AI Mentor:** Provides pedagogical assistance backed by actual assessment evidence, course progress, and weak areas.

---

## 🏗️ System Architecture & Tech Stack

```
SkillPath AI Ecosystem
├── Frontend (React 18 + TypeScript + Vite + Tailwind CSS + Recharts + Zustand)
│   ├── Landing Page & Public Information Portal
│   ├── Authentication (JWT Bearer Token + Refresh Flow)
│   ├── 5-Step Progressive Onboarding (Profile, Academics, Experience, Documents, Target)
│   ├── Interest Discovery & AI Career Alignment Questionnaire
│   ├── Real-Time Adaptive Assessment Interface (Timer, Code Blocks, Dynamic Feedback)
│   ├── Skill Gap Analysis (Spider Radar Chart, Competency Matrix, Score History)
│   ├── Career Matchmaker (Readiness Gauge, Verified vs Missing Skills Breakdown)
│   ├── Dynamic Learning Roadmap (Interactive Milestone Timeline & Progression)
│   ├── Context-Aware AI Learning Mentor (Chat Streams with Knowledge Evidence)
│   └── System Administrator Cockpit (Agent Latencies, Telemetry, Invocations)
│
├── Backend (FastAPI + Pydantic v2 + SQLAlchemy ORM + SQLite/PostgreSQL)
│   ├── 26-Table Relational Schema (Users, Profiles, Assessments, Skills, Roadmaps, Agents)
│   ├── Multi-Agent Cognitive Orchestrator & Deterministic Demo Engine
│   ├── Evaluation & Skill Scoring Service (Weighted Multi-Factor Competency Matrix)
│   └── 8 Modular Routers: Auth, Profile, Assessment, Skills, Roadmap, Mentor, Documents, Intelligence
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v20.20.2)
- **Python**: v3.9+ with `venv`

### 1. Start FastAPI Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start React Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Pre-Seeded Demo Credentials

The platform ships with a pre-seeded database containing career catalogs, skill matrices, question banks, and demo accounts:

| Role | Email | Password | Access |
|---|---|---|---|
| **Learner (Student)** | `demo@skillpath.ai` | `Demo@1234` | Full access to Dashboard, Quizzes, Roadmap & Mentor |
| **Administrator** | `admin@skillpath.ai` | `Admin@1234` | Full access to Admin Cockpit & Agent Telemetry (`/admin`) |

*You can also register a new account on `/register` to experience the 5-step onboarding and interest discovery wizard from scratch.*

---

## 🤖 The 10 Specialized AI Agents

SkillPath AI coordinates 10 micro-agents through a centralized orchestrator:

1. **Interest Discovery Agent:** Conducts interactive questionnaires to map authentic learner interests without forcing premature career silos.
2. **Document Analysis Agent:** Extracts validated skills, subjects, and grades from uploaded mark sheets, resumes, and certificates.
3. **Assessment Generation Agent:** Generates balanced, multi-tier questions (MCQs, coding challenges, conceptual drills) tailored to target skills.
4. **Evaluation & Scoring Agent:** Objectively scores responses with test-case evaluation and transparent rubrics.
5. **Skill Gap Analysis Agent:** Categorizes competencies into strong, intermediate, weak, and missing foundational skills.
6. **Career Matching Agent:** Calculates weighted career readiness percentages against required industry competencies.
7. **Learning Roadmap Agent:** Synthesizes optimized module sequences tailored strictly to verified gaps.
8. **AI Mentor Agent:** Answers student inquiries using their verified learning history and real performance metrics.
9. **Continuous Reassessment Agent:** Measures improvement delta across iterations and unlocks progressive roadmap stages.
10. **Central Learner Intelligence Agent:** Synthesizes event-driven and periodic telemetry into actionable learning insights.

---

## 📊 Database Schema (26 Relational Tables)

- **Auth & Identity:** `users`, `learner_profiles`, `user_interests`, `interest_history`
- **Career & Skills:** `career_roles`, `skill_catalog`, `career_skill_requirements`, `skill_evaluations`, `skill_history`
- **Assessments:** `assessments`, `questions`, `assessment_attempts`, `user_answers`, `reassessment_comparisons`
- **Curriculum:** `learning_roadmaps`, `learning_modules`, `learning_progress`, `learning_resources`
- **Projects & Work:** `student_projects`, `project_submissions`, `work_experiences`
- **Mentor & Intelligence:** `mentor_conversations`, `student_documents`, `document_analyses`, `learner_insights`, `learner_snapshots`

---

## 🧪 Verification & Health Check

Run the automated in-memory workflow test script:
```bash
cd backend
venv/bin/python -c "
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
assert client.get('/health').status_code == 200
print('SkillPath AI Backend & Database: Operational!')
"
```
