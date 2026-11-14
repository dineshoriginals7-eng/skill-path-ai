import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  BrainCircuit,
  BookOpen,
  Activity,
  Layers,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'catalog'>('overview');

  const systemMetrics = [
    { label: 'Registered Learners', value: '1,428', change: '+12% this week', icon: Users, color: 'text-white' },
    { label: 'Assessments Conducted', value: '3,892', change: '84% pass rate', icon: BrainCircuit, color: 'text-white' },
    { label: 'Active Roadmaps', value: '1,120', change: '68% completion rate', icon: BookOpen, color: 'text-white' },
    { label: 'Multi-Agent Operations', value: '28,490', change: '100% healthy', icon: Activity, color: 'text-white' },
  ];

  const agentsStatus = [
    { name: 'Interest Discovery Agent', status: 'Online', latency: '42ms', executions: '1,428', health: '100%' },
    { name: 'Document Analysis Agent', status: 'Online', latency: '120ms', executions: '890', health: '99.8%' },
    { name: 'Assessment Generation Agent', status: 'Online', latency: '65ms', executions: '4,102', health: '100%' },
    { name: 'Evaluation & Scoring Agent', status: 'Online', latency: '54ms', executions: '9,340', health: '100%' },
    { name: 'Skill Gap Analysis Agent', status: 'Online', latency: '38ms', executions: '3,892', health: '100%' },
    { name: 'Career Matching Agent', status: 'Online', latency: '40ms', executions: '2,640', health: '100%' },
    { name: 'Learning Roadmap Agent', status: 'Online', latency: '85ms', executions: '1,200', health: '99.9%' },
    { name: 'Personalized AI Mentor Agent', status: 'Online', latency: '92ms', executions: '5,210', health: '100%' },
    { name: 'Continuous Reassessment Agent', status: 'Online', latency: '48ms', executions: '1,890', health: '100%' },
    { name: 'Central Learner Intelligence Agent', status: 'Online', latency: '110ms', executions: '3,450', health: '100%' },
  ];

  const recentLogs = [
    { timestamp: 'Just now', agent: 'AI Mentor Agent', event: 'Calibrated pedagogy query for Alex Rivera (Demo)', level: 'INFO' },
    { timestamp: '1m ago', agent: 'Evaluation Agent', event: 'Automated test-case evaluation on Python quiz (10/10)', level: 'INFO' },
    { timestamp: '4m ago', agent: 'Roadmap Agent', event: 'Personalized pathway synthesized for Full Stack Developer', level: 'SUCCESS' },
    { timestamp: '8m ago', agent: 'Assessment Agent', event: 'Generated 10 adaptive questions from skill catalog', level: 'INFO' },
    { timestamp: '12m ago', agent: 'Document Agent', event: 'Parsed academic transcripts; extracted 14 verified skills', level: 'SUCCESS' },
  ];

  return (
    <div className="space-y-8 animate-fade-in p-2 sm:p-6 font-body text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292929] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Administrator Cockpit
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
            SkillPath AI System Administration
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Global orchestrator telemetry, multi-agent health status, and platform intelligence logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="neutral" className="px-3 py-1 text-xs text-white border-[#292929] bg-[#171717]">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-1.5 inline-block" />
            Backend Online (Port 8000)
          </Badge>
          <Badge variant="neutral" className="px-3 py-1 text-xs text-[#A1A1AA] border-[#292929] bg-[#141414]">
            Demo Mode Active
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#292929] pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'agents'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]'
          }`}
        >
          10 Specialized AI Agents
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <Card key={idx} className="p-5 border-[#292929] bg-[#141414]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">{m.label}</span>
                    <div className="p-2 rounded-lg bg-[#171717] border border-[#292929] text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-heading text-white">{m.value}</div>
                  <span className="text-xs font-medium text-[#A1A1AA] mt-1 block">{m.change}</span>
                </Card>
              );
            })}
          </div>

          {/* System Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 border-[#292929] bg-[#141414]">
              <CardHeader title="Real-Time Agent Pipeline Telemetry" subtitle="Live event log of the multi-agent cognitive engine" />
              <CardContent className="space-y-3 mt-4">
                {recentLogs.map((log, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#171717] border border-[#292929] flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-[#292929] text-white shrink-0 mt-0.5">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{log.agent}</div>
                        <p className="text-[#A1A1AA] mt-0.5">{log.event}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="neutral" size="sm" className="border-[#292929] bg-[#141414] text-white">
                        {log.level}
                      </Badge>
                      <span className="text-[10px] text-[#A1A1AA] block mt-1">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="p-6 border-[#292929] bg-[#141414]">
              <CardHeader title="Environment Configuration" subtitle="Active runtime parameters" />
              <CardContent className="space-y-4 mt-4 text-xs">
                <div className="flex justify-between py-2 border-b border-[#292929]">
                  <span className="text-[#A1A1AA]">Environment</span>
                  <span className="font-mono font-bold text-white">development</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#292929]">
                  <span className="text-[#A1A1AA]">Database Engine</span>
                  <span className="font-mono font-bold text-white">SQLite (26 tables)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#292929]">
                  <span className="text-[#A1A1AA]">LLM Provider</span>
                  <span className="font-mono font-bold text-white">Demo Engine (Deterministic)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#292929]">
                  <span className="text-[#A1A1AA]">Adaptive Reassessment</span>
                  <span className="font-mono font-bold text-white">Enabled</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#292929]">
                  <span className="text-[#A1A1AA]">Evaluation Mode</span>
                  <span className="font-mono font-bold text-white">Evaluation-First Strict</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#A1A1AA]">JWT Token Expiry</span>
                  <span className="font-mono font-bold text-white">7 days (604,800s)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <Card className="p-6 border-[#292929] bg-[#141414]">
          <CardHeader title="Specialized AI Agents Registry" subtitle="All 10 orchestrated micro-agents powering SkillPath AI" />
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#292929] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Agent Name</th>
                    <th className="pb-3 font-semibold">Operational Status</th>
                    <th className="pb-3 font-semibold">Avg Latency</th>
                    <th className="pb-3 font-semibold">Total Invocations</th>
                    <th className="pb-3 font-semibold">Health Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#292929]">
                  {agentsStatus.map((ag, idx) => (
                    <tr key={idx} className="hover:bg-[#171717] transition-colors">
                      <td className="py-3 font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        {ag.name}
                      </td>
                      <td className="py-3">
                        <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-white/20">
                          {ag.status}
                        </Badge>
                      </td>
                      <td className="py-3 font-mono text-[#A1A1AA]">{ag.latency}</td>
                      <td className="py-3 font-mono text-[#A1A1AA]">{ag.executions}</td>
                      <td className="py-3 font-semibold text-white font-mono">{ag.health}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboardPage;
