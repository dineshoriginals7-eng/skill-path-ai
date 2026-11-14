import { create } from 'zustand';
import type {
  LearnerProfile,
  Interest,
  SkillEvaluation,
  LearningRoadmap,
  Assessment,
  LearnerInsight,
} from '../types';

interface AppStoreState {
  profile: LearnerProfile | null;
  interests: Interest[];
  skills: SkillEvaluation[];
  roadmap: LearningRoadmap | null;
  assessments: Assessment[];
  insights: LearnerInsight[];
  isDemo: boolean;

  setProfile: (profile: LearnerProfile | null) => void;
  setInterests: (interests: Interest[]) => void;
  setSkills: (skills: SkillEvaluation[]) => void;
  setRoadmap: (roadmap: LearningRoadmap | null) => void;
  setAssessments: (assessments: Assessment[]) => void;
  setInsights: (insights: LearnerInsight[]) => void;
  setIsDemo: (isDemo: boolean) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  profile: null,
  interests: [],
  skills: [],
  roadmap: null,
  assessments: [],
  insights: [],
  isDemo: false,

  setProfile: (profile) => set({ profile }),
  setInterests: (interests) => set({ interests }),
  setSkills: (skills) => set({ skills }),
  setRoadmap: (roadmap) => set({ roadmap }),
  setAssessments: (assessments) => set({ assessments }),
  setInsights: (insights) => set({ insights }),
  setIsDemo: (isDemo) => set({ isDemo }),

  clearAll: () =>
    set({
      profile: null,
      interests: [],
      skills: [],
      roadmap: null,
      assessments: [],
      insights: [],
      isDemo: false,
    }),
}));

// Listen for demo-mode custom event from API interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('skillpath:demo-mode', (event: any) => {
    useAppStore.getState().setIsDemo(event?.detail ?? true);
  });
}
