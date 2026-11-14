// ==========================================
// SkillPath AI - Global Type Definitions
// ==========================================

// ------------------------------------------
// Enums
// ------------------------------------------
export enum OnboardingStep {
  PROFILE = 1,
  INTERESTS = 2,
  ASSESSMENT = 3,
  COMPLETE = 4,
}

// ------------------------------------------
// Generic API Types
// ------------------------------------------
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  status?: number;
  error?: string;
  is_demo?: boolean;
}

// ------------------------------------------
// Auth & User Types
// ------------------------------------------
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  onboarding_complete?: boolean;
}

export type UserPublic = User;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  onboarding_complete: boolean;
}

export interface AuthState {
  user: UserPublic | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

// ------------------------------------------
// Learner Profile & Interests
// ------------------------------------------
export interface CourseRecord {
  title: string;
  provider?: string;
  completion_date?: string;
  grade_or_score?: string;
  credential_url?: string;
}

export interface CertificationRecord {
  name: string;
  issuer: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  url?: string;
}

export interface ProjectRecord {
  title: string;
  description?: string;
  technologies?: string[];
  github_url?: string;
  live_url?: string;
}

export interface ExperienceRecord {
  role: string;
  organization: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

export interface LearnerProfile {
  id: string;
  user_id: string;
  phone?: string | null;
  bio?: string | null;
  educational_qualification?: string | null;
  college_or_university?: string | null;
  academic_year?: string | null;
  department?: string | null;
  gpa_or_percentage?: string | null;
  current_technical_skills: string[];
  previously_completed_courses?: CourseRecord[];
  certifications?: CertificationRecord[];
  projects?: ProjectRecord[];
  work_experience?: ExperienceRecord[];
  career_aspirations?: string | null;
  primary_career_goal?: string | null;
  target_career_role_id?: string | null;
  onboarding_step: number;
  onboarding_complete: boolean | string;
  created_at?: string;
  updated_at?: string;
}

export interface Interest {
  id: string;
  category: string;
  is_primary: boolean | string;
  source: string;
  confidence?: number;
  created_at?: string;
}

// ------------------------------------------
// Assessment & Questions
// ------------------------------------------
export type QuestionType =
  | 'mcq'
  | 'output_prediction'
  | 'debugging'
  | 'coding'
  | 'conceptual'
  | 'scenario';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  skill_id?: string | null;
  skill_name: string;
  question_text: string;
  code_snippet?: string | null;
  options?: QuestionOption[] | null;
  explanation?: string | null;
  tags?: string[];
  is_active?: boolean;
}

export interface AssessmentAnswer {
  id?: string;
  attempt_id?: string;
  question_id: string;
  user_answer: string;
  is_correct?: boolean;
  score?: number;
  max_score?: number;
  time_taken_seconds?: number;
  ai_feedback?: string;
  answered_at?: string;
}

export interface AnswerResult {
  question_id: string;
  is_correct: boolean;
  score: number;
  max_score: number;
  correct_answer?: string;
  explanation?: string;
  ai_feedback?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  attempt_number: number;
  score_percentage?: number | null;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  time_taken_seconds?: number | null;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string | null;
  answers?: AssessmentAnswer[];
}

export interface Assessment {
  id: string;
  user_id?: string;
  title: string;
  type: 'initial' | 'module' | 'reassessment' | 'practice';
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  target_skills: string[];
  difficulty?: string;
  total_questions: number;
  answered_questions: number;
  score_percentage?: number | null;
  time_limit_minutes?: number | null;
  questions?: Question[];
  time_started?: string | null;
  time_completed?: string | null;
  duration_minutes?: number | null;
  ai_analysis?: Record<string, any> | null;
  created_at: string;
  updated_at?: string;
}

export interface CompleteAssessmentResponse {
  assessment_id: string;
  attempt_id: string;
  score_percentage: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  skill_scores: {
    skill_name: string;
    score_percentage: number;
    proficiency?: string;
    proficiency_level?: string;
    strength_level?: string;
    learning_priority?: string;
    [key: string]: any;
  }[];
  recommendations: string[];
  next_steps: string[];
  ai_analysis?: Record<string, any> | null;
  [key: string]: any;
}

// ------------------------------------------
// Skills & Evaluations
// ------------------------------------------
export type ProficiencyLevel =
  | 'not_assessed'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type StrengthLevel = 'strong' | 'intermediate' | 'weak' | 'critical_weakness';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface SkillEvaluation {
  id: string;
  user_id: string;
  skill_id?: string | null;
  skill_name: string;
  assessment_id?: string | null;
  proficiency_level: ProficiencyLevel;
  score_percentage: number;
  strength_level: StrengthLevel;
  weakness_areas: string[];
  strength_areas: string[];
  learning_priority: PriorityLevel;
  evidence: any[];
  notes?: string | null;
  is_verified: boolean;
  evaluated_at: string;
  updated_at?: string;
}

export interface SkillHistory {
  id: string;
  evaluation_id: string;
  score_percentage: number;
  proficiency_level: string;
  assessment_id?: string | null;
  snapshot_reason?: string | null;
  recorded_at: string;
}

export interface SkillAnalysis {
  overall_proficiency: number;
  evaluated_skills_count: number;
  strong_skills: SkillEvaluation[];
  intermediate_skills: SkillEvaluation[];
  weak_skills: SkillEvaluation[];
  critical_weaknesses: SkillEvaluation[];
  readiness_by_role: CareerReadiness[];
  learning_priorities: SkillEvaluation[];
}

// ------------------------------------------
// Career Roles & Readiness
// ------------------------------------------
export interface CareerSkillRequirement {
  id: string;
  career_role_id: string;
  skill_id: string;
  importance: 'required' | 'preferred' | 'optional';
  weight: number;
  min_proficiency: 'beginner' | 'intermediate' | 'advanced';
  skill?: {
    id?: string;
    name: string;
    category?: string;
  };
}

export interface CareerRole {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  icon?: string | null;
  is_active: boolean;
  created_at?: string;
  skill_requirements?: CareerSkillRequirement[];
}

export interface CareerReadiness {
  role_id: string;
  role_name: string;
  category?: string;
  readiness_score: number;
  match_percentage: number;
  strong_skills_count: number;
  total_required_skills: number;
  strong_skills: string[];
  weak_skills: string[];
  missing_skills: string[];
  recommendations: string[];
}

// ------------------------------------------
// Learning Roadmap & Modules
// ------------------------------------------
export interface ModuleResource {
  type: 'video' | 'article' | 'documentation' | 'tutorial' | 'interactive' | string;
  title: string;
  url?: string;
  description?: string;
  duration?: string;
}

export interface LearningProgress {
  id: string;
  module_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent_minutes: number;
  resources_viewed: string[];
  exercises_completed: string[];
  assessment_score?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
}

export interface LearningModule {
  id: string;
  roadmap_id: string;
  skill_id?: string | null;
  title: string;
  description?: string | null;
  learning_objectives: string[];
  topics: string[];
  resources: ModuleResource[];
  exercises: any[];
  mini_project?: any | null;
  order_index: number;
  estimated_hours?: number | null;
  difficulty: DifficultyLevel | string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | string;
  is_prerequisite_met?: boolean;
  prerequisite_module_ids?: string[];
  progress_percentage?: number;
  progress?: LearningProgress;
  created_at?: string;
  updated_at?: string;
}

export interface LearningRoadmap {
  id: string;
  user_id: string;
  career_role_id?: string | null;
  title: string;
  description?: string | null;
  is_active: boolean;
  total_modules: number;
  completed_modules: number;
  overall_progress: number;
  ai_generated: boolean;
  generation_basis?: Record<string, any> | null;
  modules?: LearningModule[];
  created_at: string;
  updated_at?: string;
}

// ------------------------------------------
// Intelligence, Insights, Recommendations
// ------------------------------------------
export interface LearnerInsight {
  id: string;
  user_id: string;
  insight_type: 'skill_strength' | 'skill_weakness' | 'improvement' | 'pattern' | 'recommendation';
  category?: string | null;
  title: string;
  description: string;
  evidence: any[];
  priority: PriorityLevel;
  is_active: boolean;
  agent?: string | null;
  trigger?: string | null;
  created_at: string;
  expires_at?: string | null;
}

export interface Recommendation {
  id: string;
  user_id: string;
  recommendation_type: 'skill' | 'course' | 'resource' | 'roadmap_update';
  title: string;
  description?: string | null;
  action_items: string[];
  reasoning?: string | null;
  status: 'pending' | 'acknowledged' | 'completed' | 'dismissed';
  agent?: string | null;
  created_at: string;
  acknowledged_at?: string | null;
}

export interface MentorMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  is_demo?: boolean;
  context_snapshot?: Record<string, any> | null;
  tokens_used?: Record<string, any> | null;
  created_at: string;
}

// ------------------------------------------
// Documents
// ------------------------------------------
export interface DocumentAnalysis {
  id: string;
  document_id: string;
  extracted_skills: string[];
  extracted_scores: { subject: string; score: string | number; grade?: string }[];
  extracted_certifications: string[];
  extracted_experience: string[];
  academic_performance?: Record<string, any> | null;
  key_insights: string[];
  raw_text?: string | null;
  confidence_score?: string | null;
  analyzed_at: string;
  agent_version?: string | null;
}

export interface StudentDocument {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_type?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  storage_path: string;
  analysis_consent: boolean;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  analysis?: DocumentAnalysis | null;
}

// ------------------------------------------
// Dashboard Summary
// ------------------------------------------
export interface DashboardSummary {
  user: UserPublic;
  profile: LearnerProfile | null;
  overall_proficiency: number;
  career_readiness_score: number;
  active_roadmap: LearningRoadmap | null;
  recent_assessments: Assessment[];
  top_skills: SkillEvaluation[];
  critical_gaps: SkillEvaluation[];
  recent_insights: LearnerInsight[];
  recommended_actions: Recommendation[];
  next_module: LearningModule | null;
  total_learning_hours: number;
  current_streak_days: number;
  unified?: any;
  assessments_count?: number;
  skills_count?: number;
  roadmap_status?: any;
}
