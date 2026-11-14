import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Plus,
  Trash2,
  FileText,
  FileCode,
  FileImage,
  Sparkles,
  Briefcase,
  GraduationCap,
  Target,
  X,
  Loader2
} from 'lucide-react';
import api, { CareerRole } from '../../services/api';
import { authStore } from '../../store/authStore';

interface CourseItem {
  name: string;
  platform: string;
  year: string;
}

interface CertItem {
  name: string;
  issuer: string;
  date: string;
}

interface WorkItem {
  company: string;
  role: string;
  duration: string;
}

interface ProjectItem {
  title: string;
  tech: string;
  url: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  analyzed?: boolean;
}

export interface ExtractedCompetency {
  id: string;
  courseName: string;
  grade: string;
  skillName: string;
  suggestedLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  verified: boolean;
  institution?: string;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: GraduationCap },
  { id: 2, title: 'Academic', icon: FileText },
  { id: 3, title: 'Skills & Work', icon: Briefcase },
  { id: 4, title: 'Documents', icon: Upload },
  { id: 5, title: 'Career Goals', icon: Target },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [careerRoles, setCareerRoles] = useState<CareerRole[]>([]);

  // Step 1: Basic Info
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('Passionate learner aiming to build production-grade AI systems.');
  const [qualification, setQualification] = useState("Bachelor's");
  const [college, setCollege] = useState('State University / Tech Academy');
  const [academicYear, setAcademicYear] = useState('Senior (Year 4)');
  const [department, setDepartment] = useState('Computer Science');

  // Step 2: Academic Background
  const [gpa, setGpa] = useState('3.8');
  const [courses, setCourses] = useState<CourseItem[]>([
    { name: 'Data Structures and Algorithms', platform: 'University', year: '2023' },
  ]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCoursePlatform, setNewCoursePlatform] = useState('');
  const [newCourseYear, setNewCourseYear] = useState('');

  const [certifications, setCertifications] = useState<CertItem[]>([
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon AWS', date: '2024' },
  ]);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');

  // Step 3: Skills & Experience
  const [skills, setSkills] = useState<string[]>(['Python', 'JavaScript', 'React', 'Git', 'SQL']);
  const [skillInput, setSkillInput] = useState('');

  const [workExp, setWorkExp] = useState<WorkItem[]>([
    { company: 'Tech Innovation Labs', role: 'Software Engineering Intern', duration: '6 Months' },
  ]);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const [projects, setProjects] = useState<ProjectItem[]>([
    { title: 'AI Research Assistant', tech: 'React, Python, FastAPI', url: 'https://github.com/example/ai-agent' },
  ]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');

  // Step 4: Documents
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([
    { id: 'sample-resume', name: 'Resume_Engineering.pdf', size: 142000, type: 'pdf', analyzed: true },
  ]);
  const [consentAnalysis, setConsentAnalysis] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Document Verification Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedCompetency[]>([
    {
      id: 'ext-1',
      courseName: 'Data Structures & Algorithms',
      grade: 'A',
      skillName: 'Algorithms & Problem Solving',
      suggestedLevel: 'Intermediate',
      verified: true,
      institution: 'Computer Science Dept',
    },
    {
      id: 'ext-2',
      courseName: 'Database Management Systems',
      grade: 'A-',
      skillName: 'SQL & Relational Databases',
      suggestedLevel: 'Intermediate',
      verified: true,
      institution: 'Computer Science Dept',
    },
    {
      id: 'ext-3',
      courseName: 'Web Application Development',
      grade: 'B+',
      skillName: 'JavaScript & Web Fundamentals',
      suggestedLevel: 'Intermediate',
      verified: true,
      institution: 'Computer Science Dept',
    },
    {
      id: 'ext-4',
      courseName: 'Operating Systems & Linux',
      grade: 'B',
      skillName: 'Operating Systems & CLI',
      suggestedLevel: 'Beginner',
      verified: true,
      institution: 'Computer Science Dept',
    },
  ]);

  // Step 5: Career Goals
  const [careerAspirations, setCareerAspirations] = useState(
    'Aspiring to design autonomous multi-agent pipelines and deploy high-concurrency microservices in production.'
  );
  const [selectedCareerId, setSelectedCareerId] = useState('1');

  // Load initial career roles
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const roles = await api.getCareers();
        if (roles && roles.length > 0) {
          setCareerRoles(roles);
          setSelectedCareerId(roles[0].id);
        }
      } catch (err) {
        console.error('Error fetching careers:', err);
      }
    };
    fetchCareers();
  }, []);

  // Skill tag input handler
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (tagToRemove: string) => {
    setSkills(skills.filter((s) => s !== tagToRemove));
  };

  // Add Dynamic List Items
  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    setCourses([
      ...courses,
      { name: newCourseName, platform: newCoursePlatform || 'Self-Paced', year: newCourseYear || '2024' },
    ]);
    setNewCourseName('');
    setNewCoursePlatform('');
    setNewCourseYear('');
  };

  const handleAddCert = () => {
    if (!newCertName.trim()) return;
    setCertifications([
      ...certifications,
      { name: newCertName, issuer: newCertIssuer || 'Online Platform', date: newCertDate || '2024' },
    ]);
    setNewCertName('');
    setNewCertIssuer('');
    setNewCertDate('');
  };

  const handleAddWork = () => {
    if (!newCompany.trim() || !newRole.trim()) return;
    setWorkExp([...workExp, { company: newCompany, role: newRole, duration: newDuration || 'Current' }]);
    setNewCompany('');
    setNewRole('');
    setNewDuration('');
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;
    setProjects([
      ...projects,
      { title: newProjectTitle, tech: newProjectTech || 'Modern Stack', url: newProjectUrl || '#' },
    ]);
    setNewProjectTitle('');
    setNewProjectTech('');
    setNewProjectUrl('');
  };

  // Document upload logic
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newDocs: UploadedDoc[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      newDocs.push({
        id: 'doc-' + Date.now() + '-' + i,
        name: file.name,
        size: file.size,
        type: ext,
        analyzed: false,
      });
    }
    setUploadedFiles((prev) => [...prev, ...newDocs]);
    toast.success(`${newDocs.length} file(s) attached`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAnalyzeDocuments = async () => {
    if (!consentAnalysis) {
      toast.error('Please consent to AI analysis before continuing');
      return;
    }
    setIsAnalyzing(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setUploadedFiles((prev) =>
        prev.map((doc) => ({ ...doc, analyzed: true }))
      );
      setShowVerificationModal(true);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmExtractedCompetencies = () => {
    const verifiedItems = extractedItems.filter((i) => i.verified);
    if (verifiedItems.length === 0) {
      toast.error('No competencies selected for verification');
      setShowVerificationModal(false);
      return;
    }

    // Add verified skills to current skills
    const newSkillsToAdd = verifiedItems
      .map((i) => i.skillName)
      .filter((name) => !skills.includes(name));

    if (newSkillsToAdd.length > 0) {
      setSkills((prev) => [...prev, ...newSkillsToAdd]);
    }

    // Add verified courses to current courses
    const newCoursesToAdd = verifiedItems
      .filter((i) => !courses.some((c) => c.name.toLowerCase() === i.courseName.toLowerCase()))
      .map((i) => ({
        name: i.courseName,
        platform: i.institution || 'University Transcript',
        year: '2024',
      }));

    if (newCoursesToAdd.length > 0) {
      setCourses((prev) => [...prev, ...newCoursesToAdd]);
    }

    setShowVerificationModal(false);
    toast.success(
      `Verified and added ${verifiedItems.length} competencies to your profile!`
    );
  };

  // Step advancement & save
  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      // Prepare payload for current step
      const payload: any = {
        onboarding_step: currentStep,
      };

      if (currentStep === 1) {
        payload.phone = phone;
        payload.bio = bio;
        payload.educational_qualification = qualification;
        payload.college_or_university = college;
        payload.academic_year = academicYear;
        payload.department = department;
      } else if (currentStep === 2) {
        payload.gpa_or_percentage = gpa;
        payload.previously_completed_courses = courses;
        payload.certifications = certifications;
      } else if (currentStep === 3) {
        payload.current_technical_skills = skills;
        payload.work_experience = workExp;
        payload.projects = projects;
      } else if (currentStep === 5) {
        const selectedRole = careerRoles.find((r) => r.id === selectedCareerId);
        payload.career_aspirations = careerAspirations;
        payload.target_career_role_id = selectedCareerId;
        payload.primary_career_goal = selectedRole?.name || 'Full Stack AI Engineer';
        payload.onboarding_complete = true;
      }

      await api.updateProfile(payload);

      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        authStore.updateUser({ onboarding_complete: true });
        toast.success('Profile created successfully! Choose your focus areas next.');
        navigate('/interests');
      }
    } catch (err: any) {
      toast.error('Failed to save progress. Continuing...');
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        navigate('/interests');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 flex flex-col font-sans relative selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Navigation */}
      <header className="border-b border-gray-800/80 bg-[#0e111a]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
              </span>
              <span className="block text-[10px] text-gray-400 font-mono">ONBOARDING SETUP</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>Step {currentStep} of 5</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-indigo-400 font-medium">{STEPS[currentStep - 1].title}</span>
          </div>
        </div>

        {/* Horizontal 5-Step Progress Bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isCompleted = s.id < currentStep;
              const isCurrent = s.id === currentStep;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (s.id < currentStep) setCurrentStep(s.id);
                  }}
                  className={`flex flex-col gap-1.5 cursor-pointer ${
                    s.id < currentStep ? 'hover:opacity-80' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isCurrent
                          ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-[#151926] text-gray-500 border border-gray-800'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`hidden sm:inline text-xs font-medium truncate ${
                        isCurrent ? 'text-white font-semibold' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {/* Progress Line */}
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-indigo-500' : 'bg-gray-800'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-[#121522]/90 border border-gray-800/80 rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-xl">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Welcome & Background
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Let&apos;s understand your learning journey
                </h1>
                <p className="text-sm text-gray-400 mt-2">
                  Tell us about your educational qualification and current baseline so our AI agent can calibrate your path.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                      Educational Qualification
                    </label>
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="High School">High School</option>
                      <option value="Bachelor's">Bachelor&apos;s Degree</option>
                      <option value="Master's">Master&apos;s Degree</option>
                      <option value="PhD">PhD / Doctorate</option>
                      <option value="Bootcamp">Coding Bootcamp</option>
                      <option value="Self-taught">Self-Taught Engineer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                      College / University / School
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Berkeley, MIT or Self-Study"
                      className="w-full px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                      Academic Year / Standing
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="e.g. 3rd Year, Final Year, or Graduated"
                      className="w-full px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                    Department / Major
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science, Information Systems, Electrical"
                    className="w-full px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                    Brief Bio & Engineering Interests
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us what excites you about software, what you like building, or your focus area..."
                    className="w-full px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Background */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <GraduationCap className="w-3.5 h-3.5" /> Academic Performance
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Academic Milestones & Certifications
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Add completed courses or industry credentials to establish your baseline skills.
                </p>
              </div>

              {/* GPA */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                  GPA or Percentage Score
                </label>
                <input
                  type="text"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="e.g. 3.8 / 4.0 or 85%"
                  className="w-full max-w-xs px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dynamic Courses List */}
              <div className="pt-4 border-t border-gray-800/80">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Previously Completed Courses
                </h3>
                <div className="space-y-2 mb-3">
                  {courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#171b29] border border-gray-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{course.name}</p>
                        <p className="text-xs text-gray-400">
                          {course.platform} &bull; {course.year}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCourses(courses.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Course inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Course name"
                    className="sm:col-span-2 px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={newCoursePlatform}
                    onChange={(e) => setNewCoursePlatform(e.target.value)}
                    placeholder="Platform/School"
                    className="px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCourseYear}
                      onChange={(e) => setNewCourseYear(e.target.value)}
                      placeholder="Year"
                      className="w-full px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCourse}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Certifications List */}
              <div className="pt-4 border-t border-gray-800/80">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Certifications & Badges
                </h3>
                <div className="space-y-2 mb-3">
                  {certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#171b29] border border-gray-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{cert.name}</p>
                        <p className="text-xs text-gray-400">
                          {cert.issuer} &bull; {cert.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    placeholder="Certificate Title"
                    className="sm:col-span-2 px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    placeholder="Issuer (AWS, Google, etc.)"
                    className="px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCertDate}
                      onChange={(e) => setNewCertDate(e.target.value)}
                      placeholder="Year"
                      className="w-full px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCert}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Skills & Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <Briefcase className="w-3.5 h-3.5" /> Hands-on Capabilities
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Technical Skills & Practical Experience
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Add tags for technologies you know, followed by internships or standout projects.
                </p>
              </div>

              {/* Skill Tag Input */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                  Current Technical Skills (Type and press Enter)
                </label>
                <div className="p-3 bg-[#171b29] border border-gray-800 rounded-xl focus-within:border-indigo-500 transition-colors">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Add skill (e.g. Docker, TypeScript, PyTorch, GraphQL)..."
                    className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Work Experience dynamic list */}
              <div className="pt-4 border-t border-gray-800/80">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Work / Internship Experience
                </h3>
                <div className="space-y-2 mb-3">
                  {workExp.map((work, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#171b29] border border-gray-800"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{work.role}</p>
                        <p className="text-xs text-gray-400">
                          {work.company} &bull; {work.duration}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWorkExp(workExp.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Company name"
                    className="px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Role / Title"
                    className="px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="Duration (e.g. 6 mos)"
                      className="w-full px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddWork}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Projects dynamic list */}
              <div className="pt-4 border-t border-gray-800/80">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Key Projects & Portfolio
                </h3>
                <div className="space-y-2 mb-3">
                  {projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#171b29] border border-gray-800"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{proj.title}</p>
                        <p className="text-xs text-gray-400">
                          {proj.tech} &bull;{' '}
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                            {proj.url}
                          </a>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="Project title"
                    className="px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={newProjectTech}
                    onChange={(e) => setNewProjectTech(e.target.value)}
                    placeholder="Tech stack (React, Node, etc.)"
                    className="px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProjectUrl}
                      onChange={(e) => setNewProjectUrl(e.target.value)}
                      placeholder="Repo or Demo URL"
                      className="w-full px-3 py-2 bg-[#141722] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Document Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <Upload className="w-3.5 h-3.5" /> Context Ingestion
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Upload Resume or Academic Transcripts
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Drop your resume, project summaries, or syllabus. SkillPath AI automatically extracts competency evidence.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-800 hover:border-indigo-500/50 bg-[#161a27]/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-base font-semibold text-white">
                  Click to browse or drag and drop files here
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF, DOCX, JPG, and PNG (up to 25MB each)
                </p>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Attached Documents ({uploadedFiles.length})
                  </h4>
                  {uploadedFiles.map((doc) => {
                    let IconComponent = FileText;
                    if (['jpg', 'jpeg', 'png'].includes(doc.type)) IconComponent = FileImage;
                    else if (['js', 'py', 'ts'].includes(doc.type)) IconComponent = FileCode;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#171b29] border border-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                              {doc.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {(doc.size / 1024).toFixed(1)} KB &bull;{' '}
                              {doc.analyzed ? (
                                <span className="text-emerald-400 font-medium">Analyzed by AI</span>
                              ) : (
                                <span className="text-amber-400">Pending analysis</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setUploadedFiles(uploadedFiles.filter((d) => d.id !== doc.id))}
                          className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Consent Toggle */}
              <div className="p-4 rounded-xl bg-[#171b29] border border-gray-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentAnalysis}
                  onChange={(e) => setConsentAnalysis(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-[#141721] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-gray-300 cursor-pointer">
                  <span className="font-semibold text-white block">
                    I consent to AI analysis of my documents
                  </span>
                  SkillPath AI processes document semantics to identify completed modules, project experience, and technical skill evidence. Files remain private to your account.
                </label>
              </div>

              {/* AI Analyze Button */}
              {uploadedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleAnalyzeDocuments}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-800/60 text-violet-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                      <span>Analyzing document contents with LLM...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>Analyze & Extract Competencies</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* STEP 5: Career Goals */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <Target className="w-3.5 h-3.5" /> Final Calibration
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Define Your Primary Career Target
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Select the engineering role you are actively targeting. Your curriculum and readiness metrics will optimize for this milestone.
                </p>
              </div>

              {/* Primary Career Dropdown */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                  Target Career Role
                </label>
                <select
                  value={selectedCareerId}
                  onChange={(e) => setSelectedCareerId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {careerRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.category ? `(${role.category})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Career Description Preview */}
              {careerRoles.find((r) => r.id === selectedCareerId) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-800/40">
                  <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Role Summary
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {careerRoles.find((r) => r.id === selectedCareerId)?.description}
                  </p>
                </div>
              )}

              {/* Career Aspirations Textarea */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                  Specific Aspirations & Timeline
                </label>
                <textarea
                  rows={4}
                  value={careerAspirations}
                  onChange={(e) => setCareerAspirations(e.target.value)}
                  placeholder="e.g. Seeking an AI Full Stack role within 6 months. I want to build robust AI agents and scale backend vector databases."
                  className="w-full px-3.5 py-2.5 bg-[#171b29] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step Actions Footer */}
          <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1 || isSaving}
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#161a26] text-xs font-semibold text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndContinue}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : currentStep === 5 ? (
                <>
                  <span>Complete Setup</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* ACADEMIC REPORT EXTRACTION & VERIFICATION MODAL */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121522] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Academic Extraction & Skill Verification
                  </h3>
                  <p className="text-xs text-gray-400">
                    Review and verify competencies extracted by AI from your uploaded academic transcript.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Competencies Table/List */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {extractedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.verified
                      ? 'bg-[#161a29] border-indigo-500/40'
                      : 'bg-[#11131c] border-gray-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.verified}
                        onChange={(e) => {
                          const updated = [...extractedItems];
                          updated[idx].verified = e.target.checked;
                          setExtractedItems(updated);
                        }}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.courseName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                            Grade: {item.grade}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {item.institution || 'Computer Science Department'}
                        </span>
                      </div>
                    </div>

                    {/* Skill Tag & Suggested Level */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.skillName}
                        onChange={(e) => {
                          const updated = [...extractedItems];
                          updated[idx].skillName = e.target.value;
                          setExtractedItems(updated);
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#0e111a] border border-gray-700 text-white focus:outline-none focus:border-indigo-500 max-w-[170px]"
                        placeholder="Skill Name"
                      />
                      <select
                        value={item.suggestedLevel}
                        onChange={(e) => {
                          const updated = [...extractedItems];
                          updated[idx].suggestedLevel = e.target.value as any;
                          setExtractedItems(updated);
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#0e111a] border border-gray-700 text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note & Action Buttons */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Uncheck any items you do not wish to associate with your profile.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#161a26] text-xs font-semibold text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExtractedCompetencies}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Save to Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
