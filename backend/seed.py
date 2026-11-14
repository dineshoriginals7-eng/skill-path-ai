"""
Seed script — populates the database with default career roles,
skills, career-skill mappings, and a complete, consistent demo learner profile.
Run via: python seed.py from the backend directory.
"""
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, init_db
from app.models.career import CareerRole, SkillCatalog, CareerSkillRequirement
from app.models.user import User
from app.models.learner_profile import LearnerProfile, Interest
from app.models.skill import SkillEvaluation, SkillHistory
from app.models.assessment import Assessment, AssessmentAttempt, AssessmentAnswer, Question
from app.models.roadmap import LearningRoadmap, LearningModule, LearningProgress
from app.models.intelligence import LearnerInsight, RecommendationHistory
from app.core.security import get_password_hash
import uuid

# 10 Exact Requested Career Roles
CAREER_ROLES = [
    {
        "name": "Full Stack Developer",
        "category": "Development",
        "icon": "layers",
        "description": "Designs, develops, and deploys both client-side interfaces and scalable backend server applications.",
    },
    {
        "name": "Frontend Developer",
        "category": "Development",
        "icon": "monitor",
        "description": "Crafts accessible, responsive, and performant user interfaces using modern web frameworks.",
    },
    {
        "name": "Backend Developer",
        "category": "Development",
        "icon": "server",
        "description": "Architects resilient server-side services, microservices, databases, and secure APIs.",
    },
    {
        "name": "AI Engineer",
        "category": "Data & AI",
        "icon": "brain",
        "description": "Builds generative AI systems, fine-tunes LLMs, and orchestrates cognitive pipelines.",
    },
    {
        "name": "Machine Learning Engineer",
        "category": "Data & AI",
        "icon": "cpu",
        "description": "Researches, trains, validates, and deploys production machine learning models at scale.",
    },
    {
        "name": "Data Scientist",
        "category": "Data & AI",
        "icon": "bar-chart",
        "description": "Extracts mathematical insights, designs statistical experiments, and drives data-informed decisions.",
    },
    {
        "name": "Data Analyst",
        "category": "Data & AI",
        "icon": "pie-chart",
        "description": "Transforms business datasets into visual dashboards, KPI reports, and actionable business intelligence.",
    },
    {
        "name": "Cybersecurity Analyst",
        "category": "Security",
        "icon": "shield",
        "description": "Monitors networks, identifies vulnerabilities, mitigates threats, and enforces defense-in-depth policies.",
    },
    {
        "name": "Cloud Engineer",
        "category": "Infrastructure",
        "icon": "cloud",
        "description": "Provisions, manages, and automates scalable cloud infrastructure, networking, and serverless compute.",
    },
    {
        "name": "Mobile Application Developer",
        "category": "Development",
        "icon": "smartphone",
        "description": "Builds high-performance native and cross-platform mobile apps for iOS and Android ecosystems.",
    },
]

SKILLS = [
    # Languages
    {"name": "Python", "category": "Programming Language", "difficulty_level": "beginner"},
    {"name": "JavaScript", "category": "Programming Language", "difficulty_level": "beginner"},
    {"name": "TypeScript", "category": "Programming Language", "difficulty_level": "intermediate"},
    {"name": "Java", "category": "Programming Language", "difficulty_level": "intermediate"},
    {"name": "C++", "category": "Programming Language", "difficulty_level": "intermediate"},
    {"name": "SQL", "category": "Database", "difficulty_level": "beginner"},
    {"name": "HTML", "category": "Web", "difficulty_level": "beginner"},
    {"name": "CSS", "category": "Web", "difficulty_level": "beginner"},
    # Frontend Frameworks
    {"name": "React", "category": "Framework", "difficulty_level": "intermediate"},
    {"name": "Vue.js", "category": "Framework", "difficulty_level": "intermediate"},
    {"name": "Angular", "category": "Framework", "difficulty_level": "intermediate"},
    # Backend & Runtimes
    {"name": "Node.js", "category": "Runtime", "difficulty_level": "intermediate"},
    {"name": "Express.js", "category": "Framework", "difficulty_level": "intermediate"},
    {"name": "FastAPI", "category": "Framework", "difficulty_level": "intermediate"},
    {"name": "Django", "category": "Framework", "difficulty_level": "intermediate"},
    # AI & ML
    {"name": "Machine Learning", "category": "AI/ML", "difficulty_level": "advanced"},
    {"name": "Deep Learning", "category": "AI/ML", "difficulty_level": "advanced"},
    {"name": "Prompt Engineering", "category": "AI/ML", "difficulty_level": "intermediate"},
    {"name": "Large Language Models", "category": "AI/ML", "difficulty_level": "advanced"},
    {"name": "Vector Databases", "category": "AI/ML", "difficulty_level": "intermediate"},
    {"name": "TensorFlow", "category": "AI/ML Framework", "difficulty_level": "advanced"},
    {"name": "PyTorch", "category": "AI/ML Framework", "difficulty_level": "advanced"},
    # Data & Analytics
    {"name": "Data Analysis", "category": "Data Science", "difficulty_level": "intermediate"},
    {"name": "Statistics", "category": "Mathematics", "difficulty_level": "intermediate"},
    {"name": "Pandas", "category": "Data Science Library", "difficulty_level": "intermediate"},
    {"name": "NumPy", "category": "Data Science Library", "difficulty_level": "beginner"},
    {"name": "Power BI", "category": "Business Intelligence", "difficulty_level": "intermediate"},
    {"name": "Tableau", "category": "Business Intelligence", "difficulty_level": "intermediate"},
    {"name": "Excel", "category": "Data Analysis", "difficulty_level": "beginner"},
    # CS Fundamentals
    {"name": "Data Structures", "category": "Computer Science", "difficulty_level": "intermediate"},
    {"name": "Algorithms", "category": "Computer Science", "difficulty_level": "intermediate"},
    # DevOps, Cloud & Security
    {"name": "Git", "category": "Tool", "difficulty_level": "beginner"},
    {"name": "Docker", "category": "DevOps", "difficulty_level": "intermediate"},
    {"name": "Kubernetes", "category": "DevOps", "difficulty_level": "advanced"},
    {"name": "AWS", "category": "Cloud", "difficulty_level": "intermediate"},
    {"name": "Linux Administration", "category": "Infrastructure", "difficulty_level": "intermediate"},
    {"name": "Network Security", "category": "Security", "difficulty_level": "intermediate"},
    {"name": "Penetration Testing", "category": "Security", "difficulty_level": "advanced"},
    # Databases
    {"name": "MongoDB", "category": "Database", "difficulty_level": "beginner"},
    {"name": "PostgreSQL", "category": "Database", "difficulty_level": "intermediate"},
    {"name": "Redis", "category": "Database", "difficulty_level": "intermediate"},
    # Mobile
    {"name": "React Native", "category": "Mobile Framework", "difficulty_level": "intermediate"},
    {"name": "Flutter", "category": "Mobile Framework", "difficulty_level": "intermediate"},
    {"name": "Figma", "category": "Design", "difficulty_level": "beginner"},
]

# Map requirements with importance ('required', 'preferred', 'optional') and weights
CAREER_SKILLS = {
    "Full Stack Developer": [
        ("HTML", "required", 1.0),
        ("CSS", "required", 1.0),
        ("JavaScript", "required", 1.5),
        ("TypeScript", "preferred", 1.0),
        ("React", "required", 1.4),
        ("Node.js", "required", 1.3),
        ("Express.js", "required", 1.1),
        ("SQL", "required", 1.2),
        ("PostgreSQL", "preferred", 0.9),
        ("MongoDB", "preferred", 0.8),
        ("Git", "required", 0.8),
        ("Docker", "preferred", 0.8),
    ],
    "Frontend Developer": [
        ("HTML", "required", 1.5),
        ("CSS", "required", 1.5),
        ("JavaScript", "required", 1.6),
        ("TypeScript", "required", 1.3),
        ("React", "required", 1.5),
        ("Git", "required", 0.8),
        ("Figma", "preferred", 0.7),
    ],
    "Backend Developer": [
        ("Python", "required", 1.4),
        ("Node.js", "required", 1.3),
        ("SQL", "required", 1.5),
        ("PostgreSQL", "required", 1.3),
        ("FastAPI", "preferred", 1.0),
        ("Docker", "required", 1.1),
        ("Redis", "preferred", 0.9),
        ("Git", "required", 0.8),
    ],
    "AI Engineer": [
        ("Python", "required", 1.6),
        ("Prompt Engineering", "required", 1.4),
        ("Large Language Models", "required", 1.5),
        ("Vector Databases", "required", 1.3),
        ("PyTorch", "preferred", 1.1),
        ("FastAPI", "required", 1.0),
        ("Git", "required", 0.8),
    ],
    "Machine Learning Engineer": [
        ("Python", "required", 1.6),
        ("Machine Learning", "required", 1.5),
        ("Deep Learning", "required", 1.4),
        ("TensorFlow", "required", 1.2),
        ("PyTorch", "required", 1.2),
        ("Statistics", "required", 1.3),
        ("Docker", "preferred", 0.9),
        ("Git", "required", 0.8),
    ],
    "Data Scientist": [
        ("Python", "required", 1.5),
        ("Statistics", "required", 1.5),
        ("Data Analysis", "required", 1.4),
        ("Pandas", "required", 1.3),
        ("NumPy", "required", 1.1),
        ("SQL", "required", 1.2),
        ("Machine Learning", "required", 1.3),
    ],
    "Data Analyst": [
        ("SQL", "required", 1.5),
        ("Excel", "required", 1.3),
        ("Power BI", "required", 1.4),
        ("Tableau", "preferred", 1.2),
        ("Data Analysis", "required", 1.4),
        ("Statistics", "preferred", 1.0),
        ("Python", "preferred", 0.9),
    ],
    "Cybersecurity Analyst": [
        ("Network Security", "required", 1.6),
        ("Linux Administration", "required", 1.4),
        ("Penetration Testing", "required", 1.3),
        ("Python", "preferred", 1.0),
        ("SQL", "preferred", 0.8),
        ("Git", "preferred", 0.6),
    ],
    "Cloud Engineer": [
        ("AWS", "required", 1.6),
        ("Docker", "required", 1.4),
        ("Kubernetes", "required", 1.3),
        ("Linux Administration", "required", 1.3),
        ("Python", "preferred", 1.0),
        ("Git", "required", 0.8),
    ],
    "Mobile Application Developer": [
        ("JavaScript", "required", 1.4),
        ("TypeScript", "required", 1.2),
        ("React Native", "required", 1.5),
        ("Flutter", "preferred", 1.2),
        ("Git", "required", 0.8),
        ("HTML", "preferred", 0.6),
        ("CSS", "preferred", 0.6),
    ],
}


def seed():
    init_db()
    db = SessionLocal()
    try:
        # 1. Seed career roles
        career_map = {}
        for cr in CAREER_ROLES:
            existing = db.query(CareerRole).filter_by(name=cr["name"]).first()
            if not existing:
                role = CareerRole(id=str(uuid.uuid4()), **cr)
                db.add(role)
                db.flush()
                career_map[cr["name"]] = role
            else:
                existing.description = cr["description"]
                existing.category = cr["category"]
                existing.icon = cr["icon"]
                career_map[cr["name"]] = existing

        # 2. Seed skills
        skill_map = {}
        for sk in SKILLS:
            existing = db.query(SkillCatalog).filter_by(name=sk["name"]).first()
            if not existing:
                skill = SkillCatalog(id=str(uuid.uuid4()), **sk)
                db.add(skill)
                db.flush()
                skill_map[sk["name"]] = skill
            else:
                existing.category = sk["category"]
                existing.difficulty_level = sk["difficulty_level"]
                skill_map[sk["name"]] = existing

        # 3. Seed career-skill requirements
        for career_name, skill_list in CAREER_SKILLS.items():
            career = career_map.get(career_name)
            if not career:
                continue
            for skill_name, importance, weight in skill_list:
                skill = skill_map.get(skill_name)
                if not skill:
                    continue
                existing_req = db.query(CareerSkillRequirement).filter_by(
                    career_role_id=career.id, skill_id=skill.id
                ).first()
                if not existing_req:
                    req = CareerSkillRequirement(
                        id=str(uuid.uuid4()),
                        career_role_id=career.id,
                        skill_id=skill.id,
                        importance=importance,
                        weight=weight,
                        min_proficiency="advanced" if importance == "required" and weight >= 1.4 else "intermediate",
                    )
                    db.add(req)

        # 4. Create Demo User
        demo_email = "demo@skillpath.ai"
        demo_user = db.query(User).filter_by(email=demo_email).first()
        if not demo_user:
            demo_user = User(
                id=str(uuid.uuid4()),
                email=demo_email,
                hashed_password=get_password_hash("Demo@1234"),
                full_name="Alex Rivera (Demo)",
                is_active=True,
                is_verified=True,
            )
            db.add(demo_user)
            db.flush()

        fsd_role = career_map.get("Full Stack Developer")

        # Demo Profile
        demo_profile = db.query(LearnerProfile).filter_by(user_id=demo_user.id).first()
        if not demo_profile:
            demo_profile = LearnerProfile(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                educational_qualification="Bachelor of Science in Computer Science",
                college_or_university="State Institute of Technology",
                academic_year="Senior (4th Year)",
                department="Computer Science & Engineering",
                gpa_or_percentage="3.8 GPA (88%)",
                current_technical_skills=["Python", "JavaScript", "HTML", "CSS", "SQL", "Git", "React"],
                previously_completed_courses=["Data Structures & Algorithms", "Database Management Systems", "Web Application Architecture"],
                certifications=["Meta Frontend Developer Specialization", "AWS Certified Cloud Practitioner"],
                career_aspirations="Land a High-Impact Full Stack Engineer Role at a Product Scaleup",
                primary_career_goal="Full Stack Developer",
                target_career_role_id=fsd_role.id if fsd_role else None,
                onboarding_step=6,
                onboarding_complete="true",
            )
            db.add(demo_profile)
        else:
            demo_profile.target_career_role_id = fsd_role.id if fsd_role else None
            demo_profile.primary_career_goal = "Full Stack Developer"
            demo_profile.onboarding_complete = "true"

        # Demo Interests
        existing_interests = db.query(Interest).filter_by(user_id=demo_user.id).all()
        if not existing_interests:
            interests_to_add = [
                Interest(user_id=demo_user.id, category="Full Stack Development", is_primary=True),
                Interest(user_id=demo_user.id, category="Artificial Intelligence", is_primary=False),
                Interest(user_id=demo_user.id, category="Cloud Computing", is_primary=False),
            ]
            db.add_all(interests_to_add)

        # 5. Seed Consistent Demo Diagnostic Assessment & Results
        # Reset any legacy conflicting demo evaluations/roadmaps for demo@skillpath.ai
        db.query(SkillHistory).filter(SkillHistory.evaluation_id.in_(
            [e.id for e in db.query(SkillEvaluation).filter_by(user_id=demo_user.id).all()]
        )).delete(synchronize_session=False)
        db.query(SkillEvaluation).filter_by(user_id=demo_user.id).delete(synchronize_session=False)
        db.query(Assessment).filter_by(user_id=demo_user.id).delete(synchronize_session=False)
        db.query(LearningRoadmap).filter_by(user_id=demo_user.id).delete(synchronize_session=False)
        db.query(LearnerInsight).filter_by(user_id=demo_user.id).delete(synchronize_session=False)
        db.query(RecommendationHistory).filter_by(user_id=demo_user.id).delete(synchronize_session=False)
        db.flush()

        demo_assessment = Assessment(
            id=str(uuid.uuid4()),
            user_id=demo_user.id,
            title="Full Stack Initial Diagnostic Assessment",
            type="diagnostic",
            status="completed",
            target_skills=["JavaScript", "React", "Python", "SQL", "HTML", "CSS"],
            difficulty="adaptive",
            total_questions=12,
            answered_questions=12,
            score_percentage=72.5,
            time_started=datetime.utcnow() - timedelta(days=3, hours=2),
            time_completed=datetime.utcnow() - timedelta(days=3, hours=1, minutes=38),
            duration_minutes=22,
            ai_analysis={
                "summary": "Demonstrated strong mastery in JavaScript, Python, and frontend basics. Clear gap in SQL window functions and indexing strategy.",
                "primary_strength": "Async JavaScript, Closures, React Hook Life Cycle",
                "primary_weakness": "SQL Complex Joins and Execution Plans",
            },
        )
        db.add(demo_assessment)
        db.flush()

        # Seed Demo Skill Evaluations linked to this assessment
        demo_evals_data = [
            {
                "skill_name": "JavaScript",
                "score_percentage": 78.0,
                "proficiency_level": "advanced",
                "strength_level": "strong",
                "learning_priority": "low",
                "strength_areas": ["ES6+ Syntax", "Promises & Async/Await", "Closures"],
                "weakness_areas": ["Web Workers"],
                "evidence": ["Diagnostic: Answered 3/3 async questions correctly with 100% accuracy."],
            },
            {
                "skill_name": "React",
                "score_percentage": 74.0,
                "proficiency_level": "intermediate",
                "strength_level": "strong",
                "learning_priority": "medium",
                "strength_areas": ["Custom Hooks", "Component Lifecycle", "State Lifting"],
                "weakness_areas": ["useMemo / useCallback Optimization"],
                "evidence": ["Diagnostic: Built counter hook and state management logic correctly."],
            },
            {
                "skill_name": "Python",
                "score_percentage": 84.0,
                "proficiency_level": "advanced",
                "strength_level": "strong",
                "learning_priority": "low",
                "strength_areas": ["OOP Patterns", "List Comprehensions", "Type Hinting"],
                "weakness_areas": ["Metaclasses"],
                "evidence": ["Diagnostic: Solved data transformation algorithm in 4 minutes."],
            },
            {
                "skill_name": "HTML",
                "score_percentage": 90.0,
                "proficiency_level": "advanced",
                "strength_level": "strong",
                "learning_priority": "low",
                "strength_areas": ["Semantic Elements", "Accessibility (ARIA)", "Forms"],
                "weakness_areas": [],
                "evidence": ["Diagnostic: Perfect score on semantic structure and access tags."],
            },
            {
                "skill_name": "CSS",
                "score_percentage": 82.0,
                "proficiency_level": "advanced",
                "strength_level": "strong",
                "learning_priority": "low",
                "strength_areas": ["Flexbox", "Grid", "Media Queries"],
                "weakness_areas": ["Complex CSS Keyframe Animations"],
                "evidence": ["Diagnostic: Responsive layout problem passed all checks."],
            },
            {
                "skill_name": "SQL",
                "score_percentage": 42.0,
                "proficiency_level": "beginner",
                "strength_level": "weak",
                "learning_priority": "high",
                "strength_areas": ["Basic SELECT & WHERE", "Single-table queries"],
                "weakness_areas": ["Window Functions (RANK, ROW_NUMBER)", "Index Optimization", "Subqueries"],
                "evidence": ["Diagnostic: Missed 2 out of 3 join and aggregation problems."],
            },
            {
                "skill_name": "Git",
                "score_percentage": 80.0,
                "proficiency_level": "advanced",
                "strength_level": "strong",
                "learning_priority": "low",
                "strength_areas": ["Branching", "Merge Conflict Resolution", "Rebase"],
                "weakness_areas": [],
                "evidence": ["Diagnostic: Git workflow simulation completed with zero errors."],
            },
        ]

        for d in demo_evals_data:
            catalog_sk = skill_map.get(d["skill_name"])
            eval_row = SkillEvaluation(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                skill_id=catalog_sk.id if catalog_sk else None,
                skill_name=d["skill_name"],
                assessment_id=demo_assessment.id,
                proficiency_level=d["proficiency_level"],
                score_percentage=d["score_percentage"],
                strength_level=d["strength_level"],
                weakness_areas=d["weakness_areas"],
                strength_areas=d["strength_areas"],
                learning_priority=d["learning_priority"],
                evidence=d["evidence"],
                is_verified=True,
                evaluated_at=datetime.utcnow() - timedelta(days=3),
                updated_at=datetime.utcnow() - timedelta(days=3),
            )
            db.add(eval_row)
            db.flush()

            # History snapshot
            db.add(SkillHistory(
                evaluation_id=eval_row.id,
                score_percentage=d["score_percentage"],
                proficiency_level=d["proficiency_level"],
                assessment_id=demo_assessment.id,
                snapshot_reason="diagnostic_baseline",
                recorded_at=datetime.utcnow() - timedelta(days=3),
            ))

        # 6. Seed Consistent Demo Learning Roadmap
        demo_roadmap = LearningRoadmap(
            id=str(uuid.uuid4()),
            user_id=demo_user.id,
            career_role_id=fsd_role.id if fsd_role else None,
            title="Full Stack Developer Mastery Pathway",
            description="Personalized curriculum calibrated to accelerate Full Stack job readiness, targeting proven gaps in SQL and Node while advancing existing JavaScript strengths.",
            is_active=True,
            total_modules=5,
            completed_modules=1,
            overall_progress=28.0,
            ai_generated=True,
            generation_basis={
                "diagnostic_score": 72.5,
                "target_role": "Full Stack Developer",
                "primary_weakness": "SQL & Relational Databases",
            },
        )
        db.add(demo_roadmap)
        db.flush()

        modules_data = [
            {
                "title": "Web Foundations & Modern JavaScript",
                "description": "Solidify async execution context, promises, closures, and DOM patterns for high-throughput client apps.",
                "order_index": 1,
                "status": "completed",
                "difficulty": "intermediate",
                "estimated_hours": 8.0,
                "learning_objectives": ["Master event loop and microtask queues", "Leverage async/await with error boundaries", "Modern ES module bundling"],
                "topics": ["Event Loop & Call Stack", "Promises & Microtasks", "Functional Utilities & Immutability"],
            },
            {
                "title": "Relational Databases & SQL Query Optimization",
                "description": "High-priority gap module: master multi-table JOINs, indexing strategies, window functions, and schema normalization.",
                "order_index": 2,
                "status": "in_progress",
                "difficulty": "intermediate",
                "estimated_hours": 12.0,
                "learning_objectives": ["Execute complex multi-table analytical queries", "Analyze EXPLAIN query plans", "Optimize composite B-tree indexes"],
                "topics": ["Inner, Left, and Full Outer Joins", "Window Functions (OVER, PARTITION BY)", "Index Types and B-Tree Traversal", "Transactions & ACID Principles"],
            },
            {
                "title": "Full Stack API Architecture with Node & Express",
                "description": "Build production RESTful APIs, JWT authentication middlewares, rate limiters, and PostgreSQL ORM bindings.",
                "order_index": 3,
                "status": "available",
                "difficulty": "intermediate",
                "estimated_hours": 10.0,
                "learning_objectives": ["Implement secure JWT token rotation", "Structure clean controller-service-repository layers", "Handle streaming responses and file uploads"],
                "topics": ["RESTful Standards", "Middleware Pipelines", "Connection Pooling with PostgreSQL", "API Rate Limiting & Validation"],
            },
            {
                "title": "State Management & React Production Architecture",
                "description": "Scale React applications using Zustand, React Query for server state, and memoized component subtrees.",
                "order_index": 4,
                "status": "locked",
                "difficulty": "advanced",
                "estimated_hours": 14.0,
                "learning_objectives": ["Eliminate unnecessary re-renders with memoization", "Cache server queries with TanStack Query", "Design accessible compound UI components"],
                "topics": ["Atomic State Management", "Server State Invalidation", "React Profiler & Performance Tuning"],
            },
            {
                "title": "Full Stack Deployment, CI/CD & Docker",
                "description": "Containerize full-stack services, configure multi-stage Dockerfiles, and automate GitHub Actions deployment pipelines.",
                "order_index": 5,
                "status": "locked",
                "difficulty": "advanced",
                "estimated_hours": 10.0,
                "learning_objectives": ["Author minimal multi-stage Dockerfiles", "Automate testing and container registry pushes", "Deploy to cloud compute with health checks"],
                "topics": ["Docker & Container Isolation", "CI/CD Pipeline Automation", "Cloud Secrets Management & Monitoring"],
            },
        ]

        for m in modules_data:
            db.add(LearningModule(
                id=str(uuid.uuid4()),
                roadmap_id=demo_roadmap.id,
                **m
            ))

        # 7. Seed Demo Learner Insights
        demo_insights = [
            LearnerInsight(
                user_id=demo_user.id,
                insight_type="strength",
                category="Frontend Engineering",
                title="Strong Mastery in JavaScript & Async Workflows",
                description="Demonstrated 85% accuracy in event loop semantics, promises, and functional composition during diagnostic assessment.",
                evidence=["Answered all 3 async questions correctly in under 60 seconds each."],
                priority="medium",
                agent="Skill Gap Analysis Agent",
            ),
            LearnerInsight(
                user_id=demo_user.id,
                insight_type="gap",
                category="Database Systems",
                title="SQL Window Functions & Indexing Require Reinforcement",
                description="Evaluated at 42% in SQL during diagnostic baseline. Complex analytical queries and index optimization scored lowest.",
                evidence=["Diagnostic questions on PARTITION BY and execution plan indexing were missed."],
                priority="high",
                agent="Skill Gap Analysis Agent",
            ),
            LearnerInsight(
                user_id=demo_user.id,
                insight_type="improvement",
                category="Component Architecture",
                title="Consistent Component Design Velocity",
                description="Successfully completed Module 1 exercises on modern JavaScript patterns with 100% test pass rate.",
                evidence=["Module 1 marked complete; passing all 8 automated exercises."],
                priority="low",
                agent="Continuous Reassessment Agent",
            ),
        ]
        db.add_all(demo_insights)

        # 8. Seed Demo Recommendations
        demo_recs = [
            RecommendationHistory(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                recommendation_type="practice",
                title="SQL Window Functions & Indexing Practice",
                description="Bridge your SQL join and indexing gap by completing Module 2 query drills.",
                reasoning="Diagnostic assessment identified complex SQL queries as a critical gap for Full Stack Developer.",
                action_items=["Start SQL Drills", "Review Window Functions"],
                status="pending",
            ),
            RecommendationHistory(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                recommendation_type="mentor",
                title="Ask AI Mentor about B-Tree Index Tradeoffs",
                description="Deepen your database architecture understanding through interactive mentor inquiry.",
                reasoning="Understanding write penalties on indexed columns solidifies system design readiness.",
                action_items=["Chat with AI Mentor"],
                status="pending",
            ),
        ]
        db.add_all(demo_recs)

        # 9. Create Admin User
        admin_email = "admin@skillpath.ai"
        admin_user = db.query(User).filter_by(email=admin_email).first()
        if not admin_user:
            from app.core.config import settings
            admin_user = User(
                id=str(uuid.uuid4()),
                email=admin_email,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="SkillPath Admin",
                is_active=True,
                is_admin=True,
                is_verified=True,
                role="admin",
            )
            db.add(admin_user)

        db.commit()
        print("✅ Database successfully initialized and seeded with 10 career roles!")
        print(f"   Career roles: {len(CAREER_ROLES)}")
        print(f"   Skills in catalog: {len(SKILLS)}")
        print(f"   Demo user: {demo_email} / Demo@1234 (Fully coherent verified data seeded)")
        print(f"   Admin user: {admin_email}")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
