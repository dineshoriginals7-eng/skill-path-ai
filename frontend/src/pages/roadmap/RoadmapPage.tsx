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
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'advanced':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-6 sm:p-10 font-sans space-y-6 animate-pulse">
        <div className="h-10 bg-gray-800/60 rounded-xl w-64" />
        <div className="h-32 bg-[#121522] rounded-3xl border border-gray-800" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[#121522] rounded-2xl border border-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  // EMPTY STATE: No roadmap exists
  if (!roadmap || !roadmap.modules || roadmap.modules.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-gray-100 flex items-center justify-center p-6 font-sans relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#121522] border border-gray-800 rounded-3xl p-8 text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5">
            <Compass className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            Your personalized roadmap is waiting
          </h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            SkillPath AI analyzes your diagnostic assessments and career objectives to assemble an optimized milestone sequence.
          </p>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateRoadmap}
            className="w-full mt-6 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assembling tailored modules...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Autonomous Roadmap</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141829] via-[#121524] to-[#181930] border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <Target className="w-3.5 h-3.5" /> Career Pathway: {(roadmap as any).career_role_name || roadmap.title || 'AI Engineering'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {roadmap.title}
              </h1>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-gray-400 block font-medium">Curriculum Scope</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {roadmap.completed_modules} of {roadmap.total_modules} Modules Mastered
              </span>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Total Completion</span>
              <span className="font-bold text-indigo-400">{roadmap.overall_progress}%</span>
            </div>
            <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmap.overall_progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module Timeline List */}
        <div className="relative pl-6 sm:pl-10 space-y-8">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[19px] sm:left-[35px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-800 to-gray-800 pointer-events-none" />

          {roadmap.modules.map((mod: any, index: number) => {
            const isCompleted = mod.status === 'completed';
            const isInProgress = mod.status === 'in_progress';
            const isAvailable = mod.status === 'available';
            const isLocked = mod.status === 'locked';

            return (
              <div key={mod.id} className="relative group">
                {/* Status Indicator Node on Vertical Line */}
                <div
                  className={`absolute -left-[30px] sm:-left-[47px] top-6 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-4 ring-[#0b0d13]'
                      : isInProgress
                      ? 'bg-indigo-600 text-white shadow-indigo-600/30 ring-4 ring-[#0b0d13] animate-pulse-soft'
                      : isAvailable
                      ? 'bg-gradient-to-tr from-indigo-900 to-violet-900 text-indigo-300 border border-indigo-500/40 ring-4 ring-[#0b0d13]'
                      : 'bg-[#181c2b] text-gray-600 border border-gray-800 ring-4 ring-[#0b0d13]'
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
                      ? 'bg-[#141829] border-indigo-500/50 shadow-xl shadow-indigo-950/30'
                      : isCompleted
                      ? 'bg-[#121522]/90 border-gray-800 hover:border-gray-700'
                      : isAvailable
                      ? 'bg-[#121522]/90 border-gray-800 hover:border-indigo-500/30'
                      : 'bg-[#10121c]/70 border-gray-800/60 opacity-80'
                  }`}
                >
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-indigo-400">
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

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {mod.estimated_hours} Hours
                      </span>
                      <span className="capitalize text-gray-500">&bull; {mod.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {mod.description}
                  </p>

                  {/* Progress bar if In Progress */}
                  {isInProgress && (
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-300 font-medium">Active Module Progress</span>
                        <span className="text-indigo-400 font-bold">{mod.progress_percentage || 50}%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${mod.progress_percentage || 50}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom Action or Locked Note */}
                  <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                    {isLocked ? (
                      <span className="text-xs text-gray-500 flex items-center gap-1.5 italic">
                        <Lock className="w-3.5 h-3.5" /> Complete previous module to unlock
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/roadmap/module/${mod.id}`)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isInProgress
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                            : isCompleted
                            ? 'bg-[#181c2b] hover:bg-[#202538] text-gray-300'
                            : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300'
                        }`}
                      >
                        <span>{isCompleted ? 'Review Module' : isInProgress ? 'Continue Learning' : 'View Module'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="text-[11px] text-gray-500">
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
