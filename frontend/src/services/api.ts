import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  UserPublic,
  TokenResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  LearnerProfile,
  Interest,
  Assessment,
  CompleteAssessmentResponse,
  SkillEvaluation,
  SkillHistory,
  SkillAnalysis,
  CareerReadiness,
  LearningRoadmap,
  LearningModule,
  LearningProgress,
  LearnerInsight,
  Recommendation,
  MentorMessage,
  StudentDocument,
  DocumentAnalysis,
  DashboardSummary,
} from '../types';

export type CareerRole = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  icon?: string | null;
  is_active: boolean;
  skills?: any[];
};

export type SkillItem = SkillEvaluation;
export type AssessmentData = Assessment;
export type AssessmentQuestion = {
  id: string;
  skill_name?: string;
  type?: string;
  question_type?: string;
  difficulty?: string;
  difficulty_level?: string;
  question_text?: string;
  prompt_text?: string;
  code_snippet?: string | null;
  options?: any[] | null;
  points?: number;
  [key: string]: any;
};
export type RoadmapData = LearningRoadmap;
export type AIInsight = LearnerInsight;
export type AssessmentSession = Assessment & { [key: string]: any };
export type AssessmentResults = CompleteAssessmentResponse & { [key: string]: any };
export type { LearningModule, MentorMessage };

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: Inject Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const rawTokens = localStorage.getItem('auth_tokens');
    if (rawTokens) {
      try {
        const tokens = JSON.parse(rawTokens);
        if (tokens?.access_token) {
          config.headers.Authorization = `Bearer ${tokens.access_token}`;
        }
      } catch {
        localStorage.removeItem('auth_tokens');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401s, token refresh, and demo mode indicator
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    const demoHeader = response.headers['x-demo-mode'];
    if (demoHeader === 'true' || demoHeader === '1') {
      window.dispatchEvent(new CustomEvent('skillpath:demo-mode', { detail: true }));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response && error.code === 'ERR_NETWORK') {
      window.dispatchEvent(new CustomEvent('skillpath:demo-mode', { detail: true }));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const rawTokens = localStorage.getItem('auth_tokens');
      if (rawTokens) {
        try {
          const parsed = JSON.parse(rawTokens);
          if (parsed?.refresh_token) {
            const refreshRes = await axios.post<TokenResponse>(
              `${API_BASE_URL}/api/auth/refresh`,
              { refresh_token: parsed.refresh_token }
            );

            const newTokens = refreshRes.data;
            localStorage.setItem(
              'auth_tokens',
              JSON.stringify({
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token,
                token_type: newTokens.token_type,
              })
            );

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
            }
            processQueue(null, newTokens.access_token);
            isRefreshing = false;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr as AxiosError, null);
          isRefreshing = false;
          localStorage.removeItem('auth_tokens');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Modular Sub-APIs
export const auth = {
  register: async (data: RegisterData): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/api/auth/register', data);
    return res.data;
  },
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/api/auth/login', credentials);
    return res.data;
  },
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/api/auth/refresh', {
      refresh_token: refreshToken,
    });
    return res.data;
  },
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      '/api/auth/forgot-password',
      { email }
    );
    return res.data;
  },
  resetPassword: async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      '/api/auth/reset-password',
      data
    );
    return res.data;
  },
  getMe: async (): Promise<UserPublic> => {
    const res = await apiClient.get<UserPublic>('/api/auth/me');
    return res.data;
  },
};

export const profile = {
  getProfile: async (): Promise<LearnerProfile> => {
    const res = await apiClient.get<LearnerProfile>('/api/profile/me');
    return res.data;
  },
  updateProfile: async (data: Partial<LearnerProfile>): Promise<LearnerProfile> => {
    const res = await apiClient.put<LearnerProfile>('/api/profile/me', data);
    return res.data;
  },
  getInterests: async (): Promise<Interest[]> => {
    const res = await apiClient.get<Interest[]>('/api/profile/interests');
    return res.data;
  },
  saveInterests: async (
    categoriesOrPayload: string[] | { categories: string[]; primary_category?: string },
    primaryCategory?: string
  ): Promise<Interest[]> => {
    let payload = Array.isArray(categoriesOrPayload)
      ? { categories: categoriesOrPayload, primary_category: primaryCategory }
      : categoriesOrPayload;
    const res = await apiClient.post<Interest[]>('/api/profile/interests', payload);
    return res.data;
  },
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/api/profile/dashboard-summary');
    return res.data;
  },
  getUnifiedIntelligence: async (): Promise<any> => {
    const res = await apiClient.get<any>('/api/profile/unified-intelligence');
    return res.data;
  },
};

export const assessment = {
  startAssessment: async (params?: {
    type?: string;
    target_skills?: string[];
    career_goal?: string;
  }): Promise<Assessment> => {
    const res = await apiClient.post<Assessment>('/api/assessment/start', params || { type: 'initial' });
    return res.data;
  },
  getAssessment: async (id: string): Promise<Assessment> => {
    const res = await apiClient.get<Assessment>(`/api/assessment/${id}`);
    return res.data;
  },
  submitAnswer: async (
    assessmentId: string,
    data: { question_id: string; user_answer: string; time_taken_seconds?: number }
  ): Promise<any> => {
    const res = await apiClient.post(`/api/assessment/${assessmentId}/answer`, data);
    return res.data;
  },
  completeAssessment: async (id: string): Promise<CompleteAssessmentResponse> => {
    const res = await apiClient.post<CompleteAssessmentResponse>(`/api/assessment/${id}/complete`);
    return res.data;
  },
  getHistory: async (): Promise<Assessment[]> => {
    const res = await apiClient.get<Assessment[]>('/api/assessment/history');
    return res.data;
  },
  getResults: async (id: string): Promise<any> => {
    const res = await apiClient.get<any>(`/api/assessment/${id}/results`);
    return res.data;
  },
};

export const skills = {
  getMySkills: async (): Promise<SkillEvaluation[]> => {
    const res = await apiClient.get<SkillEvaluation[]>('/api/skills/my-skills');
    return res.data;
  },
  getSkillAnalysis: async (): Promise<SkillAnalysis> => {
    const res = await apiClient.get<SkillAnalysis>('/api/skills/skill-analysis');
    return res.data;
  },
  getSkillHistory: async (skillName?: string): Promise<SkillHistory[]> => {
    const query = skillName ? encodeURIComponent(skillName) : 'General';
    const res = await apiClient.get<SkillHistory[]>(`/api/skills/history/${query}`);
    return res.data;
  },
  getCareerReadiness: async (roleId?: string): Promise<CareerReadiness> => {
    const query = roleId ? `?role_id=${encodeURIComponent(roleId)}` : '';
    const res = await apiClient.get<CareerReadiness>(`/api/skills/career-readiness${query}`);
    return res.data;
  },
  getCareers: async (): Promise<CareerRole[]> => {
    const res = await apiClient.get<CareerRole[]>('/api/skills/careers');
    return res.data;
  },
  requestAssessment: async (payload: any): Promise<any> => {
    const res = await apiClient.post('/api/skills/request-assessment', payload);
    return res.data;
  },
};

export const roadmap = {
  generateRoadmap: async (roleId?: string): Promise<LearningRoadmap> => {
    const query = roleId ? `?role_id=${encodeURIComponent(roleId)}` : '';
    const res = await apiClient.post<LearningRoadmap>(`/api/roadmap/generate${query}`);
    return res.data;
  },
  getMyRoadmap: async (): Promise<LearningRoadmap> => {
    const res = await apiClient.get<LearningRoadmap>('/api/roadmap/my-roadmap');
    return res.data;
  },
  updateModuleProgress: async (
    moduleId: string,
    progress: Partial<LearningProgress>
  ): Promise<LearningProgress> => {
    const res = await apiClient.put<LearningProgress>(
      `/api/roadmap/module/${moduleId}/progress`,
      progress
    );
    return res.data;
  },
  getModule: async (moduleId: string): Promise<LearningModule> => {
    const res = await apiClient.get<LearningModule>(`/api/roadmap/module/${moduleId}`);
    return res.data;
  },
};

export const mentor = {
  sendMessage: async (message: string, sessionId?: string): Promise<MentorMessage> => {
    const res = await apiClient.post<any>('/api/mentor/chat', {
      message,
      session_id: sessionId || 'default',
    });
    const data = res.data;
    return {
      id: 'mentor-' + Date.now(),
      session_id: data.session_id,
      role: 'assistant',
      content: data.response || data.content || '',
      created_at: new Date().toISOString(),
      is_demo: data.is_demo,
    };
  },
  getConversations: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/api/mentor/conversations');
    return res.data;
  },
  getConversationMessages: async (sessionId: string): Promise<MentorMessage[]> => {
    const res = await apiClient.get<MentorMessage[]>(`/api/mentor/conversations/${sessionId}`);
    return res.data;
  },
};

export const documents = {
  uploadDocument: async (
    file: File,
    fileType: string = 'resume',
    consent: boolean = true
  ): Promise<StudentDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('analysis_consent', String(consent));

    const res = await apiClient.post<StudentDocument>('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getDocuments: async (): Promise<StudentDocument[]> => {
    const res = await apiClient.get<StudentDocument[]>('/api/documents/my-documents');
    return res.data;
  },
  analyzeDocument: async (documentId: string): Promise<DocumentAnalysis> => {
    const res = await apiClient.post<DocumentAnalysis>(`/api/documents/${documentId}/analyze`);
    return res.data;
  },
  deleteDocument: async (documentId: string): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/api/documents/${documentId}`);
    return res.data;
  },
};

export const intelligence = {
  getInsights: async (): Promise<LearnerInsight[]> => {
    const res = await apiClient.get<LearnerInsight[]>('/api/intelligence/insights');
    return res.data;
  },
  getReport: async (): Promise<any> => {
    const res = await apiClient.get<any>('/api/intelligence/report');
    return res.data;
  },
  refreshIntelligence: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/api/intelligence/refresh');
    return res.data;
  },
  getRecommendations: async (): Promise<Recommendation[]> => {
    const res = await apiClient.get<Recommendation[]>('/api/intelligence/recommendations');
    return res.data;
  },
};

// Flattened API object providing direct convenience methods used by pages
export const api = {
  auth,
  profile,
  assessment,
  skills,
  roadmap,
  mentor,
  documents,
  intelligence,

  // Direct convenience methods
  forgotPassword: (email: string) => auth.forgotPassword(email),
  getCareers: () => skills.getCareers(),
  getUnifiedIntelligence: () => profile.getUnifiedIntelligence(),
  updateProfile: (data: Partial<LearnerProfile>) => profile.updateProfile(data),
  saveInterests: (
    categoriesOrPayload: string[] | { categories: string[]; primary_category?: string },
    primaryCategory?: string
  ) => profile.saveInterests(categoriesOrPayload, primaryCategory),
  startAssessment: (params?: any) => assessment.startAssessment(params),
  getAssessment: (id: string) => assessment.getAssessment(id),
  submitAnswer: (assessmentId: string, data: any) => assessment.submitAnswer(assessmentId, data),
  completeAssessment: (assessmentId: string) => assessment.completeAssessment(assessmentId),
  getAssessmentResults: (id: string) => assessment.getResults(id),
  getSkills: () => skills.getMySkills(),
  getSkillHistory: (skillName?: string) => skills.getSkillHistory(skillName),
  requestAssessment: (payload: any) => skills.requestAssessment(payload),
  getCareerReadiness: (roleId?: string) => skills.getCareerReadiness(roleId),
  generateRoadmap: (roleId?: string) => roadmap.generateRoadmap(roleId),
  getRoadmap: () => roadmap.getMyRoadmap(),
  getModule: (moduleId: string) => roadmap.getModule(moduleId),
  updateModuleProgress: (moduleId: string, progress: any) => roadmap.updateModuleProgress(moduleId, progress),
  getMentorHistory: (sessionId?: string) => mentor.getConversationMessages(sessionId || 'default'),
  sendMentorMessage: (message: string, sessionId?: string) => mentor.sendMessage(message, sessionId),
  getInsights: () => intelligence.getInsights(),
  refreshIntelligence: () => intelligence.refreshIntelligence(),

  // Comprehensive unified dashboard aggregator (single source of truth)
  getDashboardData: async () => {
    try {
      const summary: any = await profile.getDashboardSummary();
      const unified = summary?.unified;

      const stats = unified?.stats || {
        assessments_completed: summary?.assessments_count || 0,
        skills_assessed: summary?.skills_count || 0,
        readiness_score: 0,
        roadmap_progress: summary?.roadmap_status?.overall_progress || 0,
        modules_completed: summary?.roadmap_status?.completed_modules || 0,
        total_modules: summary?.roadmap_status?.total_modules || 0,
        study_hours: 0,
      };

      const primaryGoal =
        unified?.target_career?.name ||
        summary?.profile?.primary_career_goal ||
        'Full Stack Developer';

      const nextAction = unified?.is_diagnostic_pending
        ? {
            title: 'Initial Diagnostic Assessment',
            estimated_time: '15 mins',
            type: 'Diagnostic',
            target: '/assessment',
          }
        : {
            title: unified?.roadmap?.modules?.[0]?.title || 'Continue Active Learning Module',
            estimated_time: '25 mins',
            type: 'Module',
            target: '/roadmap',
          };

      return {
        stats: {
          assessments_completed: stats.assessments_completed ?? 0,
          skills_assessed: stats.skills_evaluated_count ?? (stats.skills_assessed ?? 0),
          roadmap_progress: stats.roadmap_progress_percentage ?? (stats.roadmap_progress ?? 0),
          readiness_score: stats.readiness_score ?? (unified?.career_alignment?.readiness_score ?? 0),
          modules_completed: stats.completed_modules ?? 0,
          total_modules: stats.total_modules ?? 0,
          study_hours: stats.study_hours ?? 0,
        },
        primary_goal: primaryGoal,
        target_career: unified?.target_career,
        career_alignment: unified?.career_alignment,
        is_diagnostic_pending: Boolean(unified?.is_diagnostic_pending),
        next_action: nextAction,
        insights: unified?.insights || [],
        top_skills: unified?.verified_skills || [],
        weak_skills: unified?.weak_skills || [],
        unassessed_skills: unified?.unassessed_skills || [],
        recent_assessments: unified?.recent_assessments || [],
        current_modules: unified?.roadmap?.modules || [],
        recommendations: unified?.recommendations || [],
        academic_metrics: unified?.academic_metrics,
        unified,
      };
    } catch (err) {
      console.error('getDashboardData error:', err);
      return {
        stats: {
          assessments_completed: 0,
          skills_assessed: 0,
          roadmap_progress: 0,
          readiness_score: 0,
          modules_completed: 0,
          total_modules: 0,
          study_hours: 0,
        },
        primary_goal: 'Full Stack Developer',
        is_diagnostic_pending: true,
        next_action: { title: 'Initial Diagnostic Assessment', estimated_time: '15 mins', type: 'Diagnostic', target: '/assessment' },
        insights: [],
        top_skills: [],
        weak_skills: [],
        unassessed_skills: [],
        recent_assessments: [],
        current_modules: [],
        recommendations: [],
      };
    }
  },
};

export default api;
