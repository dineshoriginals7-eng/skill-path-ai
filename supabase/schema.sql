"""
Supabase / PostgreSQL schema — run in Supabase SQL editor for production.
For local development, SQLAlchemy creates tables via init_db() automatically.
"""

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own record" ON users FOR SELECT USING (auth.uid()::text = id::text);

-- ============================================================
-- CAREER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS career_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILL CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    description TEXT,
    prerequisites JSONB DEFAULT '[]',
    difficulty_level VARCHAR(50) DEFAULT 'beginner',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CAREER SKILL REQUIREMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS career_skill_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    career_role_id UUID NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skill_catalog(id) ON DELETE CASCADE,
    importance VARCHAR(50) DEFAULT 'required' CHECK (importance IN ('required','preferred','optional')),
    weight FLOAT DEFAULT 1.0,
    min_proficiency VARCHAR(50) DEFAULT 'intermediate'
);
CREATE INDEX idx_career_skill_career ON career_skill_requirements(career_role_id);
CREATE INDEX idx_career_skill_skill ON career_skill_requirements(skill_id);

-- ============================================================
-- LEARNER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS learner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    bio TEXT,
    avatar_url VARCHAR(500),
    educational_qualification VARCHAR(255),
    college_or_university VARCHAR(255),
    academic_year VARCHAR(50),
    department VARCHAR(255),
    gpa_or_percentage VARCHAR(50),
    current_technical_skills JSONB DEFAULT '[]',
    previously_completed_courses JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    projects JSONB DEFAULT '[]',
    work_experience JSONB DEFAULT '[]',
    career_aspirations TEXT,
    primary_career_goal VARCHAR(255),
    target_career_role_id UUID REFERENCES career_roles(id),
    onboarding_step INTEGER DEFAULT 1,
    onboarding_complete VARCHAR(10) DEFAULT 'false',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile only" ON learner_profiles FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- INTERESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    is_primary VARCHAR(10) DEFAULT 'false',
    source VARCHAR(50) DEFAULT 'manual',
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_interests_user ON interests(user_id);
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own interests only" ON interests FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS interest_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    previous_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENT DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    file_size_bytes INTEGER,
    storage_path VARCHAR(1000) NOT NULL,
    analysis_consent BOOLEAN DEFAULT FALSE,
    analysis_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own documents only" ON student_documents FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS document_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID UNIQUE NOT NULL REFERENCES student_documents(id) ON DELETE CASCADE,
    extracted_skills JSONB DEFAULT '[]',
    extracted_scores JSONB DEFAULT '[]',
    extracted_certifications JSONB DEFAULT '[]',
    extracted_experience JSONB DEFAULT '[]',
    academic_performance JSONB,
    key_insights JSONB DEFAULT '[]',
    raw_text TEXT,
    confidence_score VARCHAR(10),
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    agent_version VARCHAR(50)
);

-- ============================================================
-- QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES skill_catalog(id),
    skill_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    options JSONB,
    correct_answer TEXT,
    test_cases JSONB,
    explanation TEXT,
    tags JSONB DEFAULT '[]',
    source VARCHAR(50) DEFAULT 'ai_generated',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_questions_skill ON questions(skill_id);

-- ============================================================
-- ASSESSMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'initial',
    status VARCHAR(50) DEFAULT 'pending',
    target_skills JSONB DEFAULT '[]',
    difficulty VARCHAR(50) DEFAULT 'adaptive',
    total_questions INTEGER DEFAULT 0,
    answered_questions INTEGER DEFAULT 0,
    score_percentage FLOAT,
    time_started TIMESTAMPTZ,
    time_completed TIMESTAMPTZ,
    duration_minutes INTEGER,
    ai_analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own assessments only" ON assessments FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    score_percentage FLOAT,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    status VARCHAR(50) DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    user_answer TEXT,
    is_correct BOOLEAN,
    score FLOAT DEFAULT 0.0,
    max_score FLOAT DEFAULT 1.0,
    time_taken_seconds INTEGER,
    ai_feedback TEXT,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_answers_attempt ON assessment_answers(attempt_id);

-- ============================================================
-- SKILL EVALUATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skill_catalog(id),
    skill_name VARCHAR(255) NOT NULL,
    assessment_id UUID REFERENCES assessments(id),
    proficiency_level VARCHAR(50),
    score_percentage FLOAT,
    strength_level VARCHAR(50),
    weakness_areas JSONB DEFAULT '[]',
    strength_areas JSONB DEFAULT '[]',
    learning_priority VARCHAR(50) DEFAULT 'medium',
    evidence JSONB DEFAULT '[]',
    notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE skill_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own skill evals only" ON skill_evaluations FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS skill_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES skill_evaluations(id) ON DELETE CASCADE,
    score_percentage FLOAT,
    proficiency_level VARCHAR(50),
    assessment_id UUID REFERENCES assessments(id),
    snapshot_reason VARCHAR(255),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    provider VARCHAR(255),
    url VARCHAR(1000),
    description TEXT,
    skill_tags JSONB DEFAULT '[]',
    difficulty VARCHAR(50) DEFAULT 'beginner',
    duration_hours FLOAT,
    is_free BOOLEAN DEFAULT TRUE,
    thumbnail_url VARCHAR(1000),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    course_title VARCHAR(500) NOT NULL,
    provider VARCHAR(255),
    status VARCHAR(50) DEFAULT 'started',
    completion_percentage FLOAT DEFAULT 0.0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    certificate_url VARCHAR(1000),
    source VARCHAR(50) DEFAULT 'manual'
);

-- ============================================================
-- LEARNING ROADMAPS & MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_role_id UUID REFERENCES career_roles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    total_modules INTEGER DEFAULT 0,
    completed_modules INTEGER DEFAULT 0,
    overall_progress FLOAT DEFAULT 0.0,
    ai_generated BOOLEAN DEFAULT TRUE,
    generation_basis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE learning_roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own roadmaps only" ON learning_roadmaps FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID NOT NULL REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skill_catalog(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives JSONB DEFAULT '[]',
    topics JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    exercises JSONB DEFAULT '[]',
    mini_project JSONB,
    order_index INTEGER DEFAULT 0,
    estimated_hours FLOAT,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    status VARCHAR(50) DEFAULT 'locked',
    is_prerequisite_met BOOLEAN DEFAULT FALSE,
    prerequisite_module_ids JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID UNIQUE NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started',
    progress_percentage FLOAT DEFAULT 0.0,
    time_spent_minutes INTEGER DEFAULT 0,
    resources_viewed JSONB DEFAULT '[]',
    exercises_completed JSONB DEFAULT '[]',
    assessment_score FLOAT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    technologies JSONB DEFAULT '[]',
    github_url VARCHAR(1000),
    live_url VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'in_progress',
    skills_demonstrated JSONB DEFAULT '[]',
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code_quality_score FLOAT,
    complexity_score FLOAT,
    skills_verified JSONB DEFAULT '[]',
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    overall_feedback TEXT,
    evaluated_by VARCHAR(50) DEFAULT 'ai',
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEARNER INTELLIGENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS learner_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    priority VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    agent VARCHAR(100),
    trigger VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);
ALTER TABLE learner_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own insights only" ON learner_insights FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS learner_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_type VARCHAR(50) DEFAULT 'periodic',
    overall_proficiency FLOAT,
    career_readiness_score FLOAT,
    strong_skills JSONB DEFAULT '[]',
    weak_skills JSONB DEFAULT '[]',
    missing_skills JSONB DEFAULT '[]',
    assessments_completed JSONB,
    courses_completed JSONB,
    active_interests JSONB DEFAULT '[]',
    full_profile_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    action_items JSONB DEFAULT '[]',
    reasoning TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    agent VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mentor_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    context_snapshot JSONB,
    tokens_used JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE mentor_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own conversations only" ON mentor_conversations FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_mentor_session ON mentor_conversations(session_id);
CREATE INDEX idx_mentor_user ON mentor_conversations(user_id);
