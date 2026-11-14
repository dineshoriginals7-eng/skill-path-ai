import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Lock,
  Play,
  CheckCircle2,
  Clock,
  Target,
  ChevronRight,
  Loader2,
  Compass
} from 'lucide-react';
import api, { RoadmapData } from '../../services/api';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRoadmap = async () => {
      try {
        const data = await api.getRoadmap();
        if (isMounted) setRoadmap(data);
      } catch (err) {
        console.error('Failed to load roadmap:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRoadmap();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const data = await api.generateRoadmap();
      setRoadmap(data);
      toast.success('Your autonomous learning roadmap is generated!');
    } catch {
      toast.error('Could not generate roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    return 'bg-[#171717] text-[#A1A1AA] border border-[#292929]';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white p-6 sm:p-10 font-body space-y-6 animate-pulse">
        <div className="h-10 bg-[#171717] rounded-xl w-64" />
        <div className="h-32 bg-[#141414] rounded-3xl border border-[#292929]" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[#141414] rounded-2xl border border-[#292929]" />
          ))}
        </div>
      </div>
    );
  }

  // EMPTY STATE: No roadmap exists
  if (!roadmap || !roadmap.modules || roadmap.modules.length === 0) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center p-6 font-body relative">
        <div className="max-w-md w-full bg-[#141414] border border-[#292929] rounded-3xl p-8 text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#171717] border border-[#292929] text-white flex items-center justify-center mb-5">
            <Compass className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold font-heading text-white">
            Your personalized roadmap is waiting
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
            SkillPath AI analyzes your diagnostic assessments and career objectives to assemble an optimized milestone sequence.
          </p>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateRoadmap}
            className="w-full mt-6 py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Assembling tailored modules...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Generate Autonomous Roadmap</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white p-4 sm:p-6 lg:p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#292929] shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-2">
                <Target className="w-3.5 h-3.5" /> Career Pathway: {(roadmap as any).career_role_name || roadmap.title || 'AI Engineering'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                {roadmap.title}
              </h1>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-[#A1A1AA] block font-medium">Curriculum Scope</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {roadmap.completed_modules} of {roadmap.total_modules} Modules Mastered
              </span>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA]">Total Completion</span>
              <span className="font-bold text-white">{roadmap.overall_progress}%</span>
            </div>
            <div className="w-full bg-[#171717] h-2.5 rounded-full overflow-hidden border border-[#292929]">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmap.overall_progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module Timeline List */}
        <div className="relative pl-6 sm:pl-10 space-y-8">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[19px] sm:left-[35px] top-4 bottom-4 w-0.5 bg-[#292929] pointer-events-none" />

          {roadmap.modules.map((mod: any, index: number) => {
            const isCompleted = mod.status === 'completed';
            const isInProgress = mod.status === 'in_progress';
            const isAvailable = mod.status === 'available';
            const isLocked = mod.status === 'locked';

            return (
              <div key={mod.id} className="relative group">
                {/* Status Indicator Node on Vertical Line */}
                <div
                  className={`absolute -left-[30px] sm:-left-[47px] top-6 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform ${
                    isCompleted
                      ? 'bg-white text-black ring-4 ring-[#090909]'
                      : isInProgress
                      ? 'bg-white text-black ring-4 ring-[#090909]'
                      : isAvailable
                      ? 'bg-[#171717] text-white border border-[#292929] ring-4 ring-[#090909]'
                      : 'bg-[#141414] text-[#A1A1AA] border border-[#292929] ring-4 ring-[#090909]'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                  {isInProgress && <Play className="w-4 h-4 fill-current ml-0.5" />}
                  {isAvailable && <Play className="w-4 h-4 ml-0.5" />}
                  {isLocked && <Lock className="w-4 h-4" />}
                </div>

                {/* Module Card */}
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    isInProgress
                      ? 'bg-[#141414] border-white/40 shadow-sm'
                      : isCompleted
                      ? 'bg-[#141414] border-[#292929] hover:border-neutral-500'
                      : isAvailable
                      ? 'bg-[#141414] border-[#292929] hover:border-neutral-500'
                      : 'bg-[#141414] border-[#292929] opacity-70'
                  }`}
                >
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-white">
                        MODULE {mod.order_index || index + 1}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getDifficultyBadge(
                          mod.difficulty
                        )}`}
                      >
                        {mod.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" />
                        {mod.estimated_hours} Hours
                      </span>
                      <span className="capitalize text-[#A1A1AA]">&bull; {mod.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold font-heading text-white mb-2 tracking-tight">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                    {mod.description}
                  </p>

                  {/* Progress bar if In Progress */}
                  {isInProgress && (
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A1A1AA] font-medium">Active Module Progress</span>
                        <span className="text-white font-bold">{mod.progress_percentage || 50}%</span>
                      </div>
                      <div className="w-full bg-[#171717] h-2 rounded-full overflow-hidden border border-[#292929]">
                        <div
                          className="bg-white h-full rounded-full"
                          style={{ width: `${mod.progress_percentage || 50}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom Action or Locked Note */}
                  <div className="pt-4 border-t border-[#292929] flex items-center justify-between">
                    {isLocked ? (
                      <span className="text-xs text-[#A1A1AA] flex items-center gap-1.5 italic">
                        <Lock className="w-3.5 h-3.5" /> Complete previous module to unlock
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/roadmap/module/${mod.id}`)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isInProgress
                            ? 'bg-white hover:bg-neutral-200 text-black shadow-sm'
                            : isCompleted
                            ? 'bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white'
                            : 'bg-[#171717] hover:bg-[#222222] border border-[#292929] text-white'
                        }`}
                      >
                        <span>{isCompleted ? 'Review Module' : isInProgress ? 'Continue Learning' : 'View Module'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="text-[11px] text-[#A1A1AA]">
                      {isCompleted ? 'Validated' : isInProgress ? 'In Progress' : isAvailable ? 'Available' : 'Locked'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
