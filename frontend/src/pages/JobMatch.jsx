import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, MapPin, DollarSign, Clock, BookOpen,
  ChevronRight, X, ExternalLink, Bookmark, BookmarkCheck,
  CheckCircle, AlertCircle, TrendingUp, Target, Zap,
  Star, Award, ArrowRight, RefreshCw, Search, SlidersHorizontal,
  GraduationCap, Code2, Building2, Calendar, Users,
  ChevronDown, ChevronUp, Lightbulb, Flame
} from 'lucide-react';
import resumeService from '../services/resumeService';

// ─────────────────────────────────────────────────────────────
//  MOCK JOB DATA  (rich, realistic — used as fallback if no AI data)
// ─────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  {
    id: 'j1',
    role: 'Full Stack Developer',
    company: 'Razorpay',
    companyLogo: 'R',
    companyColor: 'bg-blue-600',
    location: 'Bengaluru, India (Hybrid)',
    type: 'Full-time',
    salary: '₹12L – ₹20L / yr',
    experience: '0–2 years',
    matchPercentage: 88,
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'JavaScript'],
    preferredSkills: ['TypeScript', 'Redis', 'Docker', 'AWS'],
    responsibilities: [
      'Build and maintain scalable full-stack web applications',
      'Collaborate with design and product teams on feature development',
      'Write clean, well-documented code with unit tests',
      'Participate in code reviews and technical discussions',
      'Optimize application performance and ensure reliability',
    ],
    qualifications: [
      "B.Tech/B.E. in Computer Science or related field",
      'Strong fundamentals in data structures and algorithms',
      'Experience with React and Node.js ecosystems',
      'Familiarity with databases (SQL and NoSQL)',
    ],
    description:
      'Razorpay is looking for a passionate Full Stack Developer to join our growing engineering team. You will work on our core payment infrastructure and build products used by millions of businesses across India.',
    benefits: ['Health Insurance', 'Stock Options (ESOP)', 'Flexible Hours', 'Learning Budget ₹50K/yr', 'Gym Membership'],
    deadline: '2026-08-15',
    applyUrl: 'https://razorpay.com/jobs',
    websiteUrl: 'https://razorpay.com',
    matchAnalysis: {
      matchingSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      missingSkills: ['TypeScript', 'Redis', 'Docker'],
      strengths: ['Strong MERN stack foundation', 'Good DSA background from IIIT', 'Active GitHub projects'],
      weaknesses: ['No professional experience yet', 'Missing cloud/DevOps skills'],
      suggestions: ['Add TypeScript to your projects', 'Learn Docker basics in 2 weeks', 'Build one microservices project'],
    },
    skillGap: [
      { skill: 'TypeScript', priority: 'High', time: '3 weeks', demand: 85 },
      { skill: 'Docker', priority: 'High', time: '2 weeks', demand: 80 },
      { skill: 'Redis', priority: 'Medium', time: '1 week', demand: 60 },
      { skill: 'AWS Basics', priority: 'Medium', time: '3 weeks', demand: 75 },
    ],
    roadmap: [
      { week: 'Week 1', topic: 'TypeScript Fundamentals', priority: 'High', duration: '8 hours' },
      { week: 'Week 2', topic: 'Advanced TypeScript + React TS', priority: 'High', duration: '10 hours' },
      { week: 'Week 3', topic: 'Docker & Containerization', priority: 'High', duration: '8 hours' },
      { week: 'Week 4', topic: 'Redis & Caching Strategies', priority: 'Medium', duration: '6 hours' },
      { week: 'Week 5', topic: 'AWS Fundamentals (EC2, S3)', priority: 'Medium', duration: '10 hours' },
      { week: 'Week 6', topic: 'CI/CD Pipelines & DevOps Basics', priority: 'Low', duration: '6 hours' },
    ],
  },
  {
    id: 'j2',
    role: 'Frontend Engineer',
    company: 'Zepto',
    companyLogo: 'Z',
    companyColor: 'bg-purple-600',
    location: 'Mumbai, India (On-site)',
    type: 'Full-time',
    salary: '₹10L – ₹16L / yr',
    experience: '0–1 year',
    matchPercentage: 82,
    requiredSkills: ['React', 'JavaScript', 'CSS', 'Git', 'REST APIs'],
    preferredSkills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Testing (Jest)'],
    responsibilities: [
      'Develop pixel-perfect, responsive UI components',
      'Integrate RESTful APIs and manage application state',
      'Optimize web performance (LCP, FID, CLS)',
      'Write unit and integration tests',
      'Work in an Agile environment with 2-week sprints',
    ],
    qualifications: [
      'Proficiency in React and modern JavaScript (ES6+)',
      'Understanding of web performance metrics',
      'Eye for detail and strong design sensibility',
      'Experience with version control (Git)',
    ],
    description:
      'Zepto is India\'s fastest growing quick commerce company. Join our frontend team to build the web experience for millions of daily users. You\'ll work on high-traffic, performance-critical applications.',
    benefits: ['Health & Dental Insurance', 'Free Zepto Credits', 'Remote Fridays', 'Annual Bonus', 'MacBook Pro'],
    deadline: '2026-08-01',
    applyUrl: 'https://zepto.team',
    websiteUrl: 'https://zepto.team',
    matchAnalysis: {
      matchingSkills: ['React', 'JavaScript', 'CSS', 'Git'],
      missingSkills: ['Next.js', 'TypeScript', 'Jest'],
      strengths: ['Solid React knowledge', 'Good project portfolio', 'CSS and responsive design skills'],
      weaknesses: ['No production-level experience', 'Limited testing knowledge'],
      suggestions: ['Learn Next.js fundamentals (1 week)', 'Add Jest tests to existing projects', 'Build a performance-optimized demo app'],
    },
    skillGap: [
      { skill: 'Next.js', priority: 'High', time: '2 weeks', demand: 78 },
      { skill: 'TypeScript', priority: 'High', time: '3 weeks', demand: 85 },
      { skill: 'Jest / Testing', priority: 'Medium', time: '2 weeks', demand: 65 },
      { skill: 'Web Performance', priority: 'Medium', time: '1 week', demand: 70 },
    ],
    roadmap: [
      { week: 'Week 1', topic: 'Next.js App Router & SSR', priority: 'High', duration: '10 hours' },
      { week: 'Week 2', topic: 'TypeScript for React Developers', priority: 'High', duration: '8 hours' },
      { week: 'Week 3', topic: 'Testing with Jest & React Testing Library', priority: 'Medium', duration: '7 hours' },
      { week: 'Week 4', topic: 'Web Vitals & Performance Optimization', priority: 'Medium', duration: '6 hours' },
      { week: 'Week 5', topic: 'State Management (Zustand / Redux Toolkit)', priority: 'Low', duration: '5 hours' },
    ],
  },
  {
    id: 'j3',
    role: 'Backend Developer (Node.js)',
    company: 'CRED',
    companyLogo: 'C',
    companyColor: 'bg-gray-800',
    location: 'Bengaluru, India (Hybrid)',
    type: 'Full-time',
    salary: '₹14L – ₹22L / yr',
    experience: '1–3 years',
    matchPercentage: 74,
    requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'REST APIs'],
    preferredSkills: ['Microservices', 'Kafka', 'Redis', 'AWS', 'GraphQL'],
    responsibilities: [
      'Design and build high-performance RESTful and GraphQL APIs',
      'Architect scalable microservices for fintech workloads',
      'Implement robust security practices for financial data',
      'Write comprehensive unit and integration tests (>80% coverage)',
      'Collaborate on system design for new product features',
    ],
    qualifications: [
      'Strong understanding of Node.js event loop and async patterns',
      'Experience with relational and NoSQL databases',
      'Knowledge of software security principles',
      'Familiarity with cloud infrastructure (AWS/GCP preferred)',
    ],
    description:
      'CRED is a members-only platform that rewards responsible credit card users. Our backend powers financial transactions for 10M+ premium users. We are looking for backend engineers who love building systems that are fast, reliable, and secure.',
    benefits: ['Top-tier Salary', 'ESOPs', 'Unlimited PTO', 'Mental Health Support', 'Conference Budget'],
    deadline: '2026-08-20',
    applyUrl: 'https://careers.cred.club',
    websiteUrl: 'https://cred.club',
    matchAnalysis: {
      matchingSkills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
      missingSkills: ['PostgreSQL', 'Kafka', 'Redis', 'AWS', 'Microservices'],
      strengths: ['Strong Node.js and Express foundation', 'MongoDB experience', 'API design skills'],
      weaknesses: ['No SQL database experience', 'No messaging queue knowledge', 'Missing cloud experience'],
      suggestions: ['Learn PostgreSQL basics using your Node.js skills', 'Build a project with Redis for caching', 'Take AWS Solutions Architect Associate course'],
    },
    skillGap: [
      { skill: 'PostgreSQL', priority: 'High', time: '3 weeks', demand: 88 },
      { skill: 'Redis', priority: 'High', time: '1 week', demand: 80 },
      { skill: 'Kafka / Message Queues', priority: 'Medium', time: '2 weeks', demand: 72 },
      { skill: 'AWS', priority: 'Medium', time: '4 weeks', demand: 90 },
      { skill: 'GraphQL', priority: 'Low', time: '2 weeks', demand: 65 },
    ],
    roadmap: [
      { week: 'Week 1', topic: 'SQL & PostgreSQL Fundamentals', priority: 'High', duration: '10 hours' },
      { week: 'Week 2', topic: 'Advanced PostgreSQL + Indexing', priority: 'High', duration: '8 hours' },
      { week: 'Week 3', topic: 'Redis – Caching and Pub/Sub', priority: 'High', duration: '7 hours' },
      { week: 'Week 4', topic: 'Message Queues (Kafka / RabbitMQ)', priority: 'Medium', duration: '8 hours' },
      { week: 'Week 5', topic: 'AWS Core Services (EC2, RDS, S3, Lambda)', priority: 'Medium', duration: '12 hours' },
      { week: 'Week 6', topic: 'Microservices Architecture Patterns', priority: 'Medium', duration: '8 hours' },
      { week: 'Week 7', topic: 'GraphQL API Design', priority: 'Low', duration: '6 hours' },
    ],
  },
  {
    id: 'j4',
    role: 'Software Development Engineer I',
    company: 'Amazon',
    companyLogo: 'A',
    companyColor: 'bg-orange-500',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹25L – ₹40L / yr',
    experience: '0–2 years',
    matchPercentage: 68,
    requiredSkills: ['Data Structures', 'Algorithms', 'Java / C++ / Python', 'OOP', 'System Design Basics'],
    preferredSkills: ['AWS', 'Distributed Systems', 'Low-level Design', 'High-level Design'],
    responsibilities: [
      'Build and ship software features used by millions of Amazon customers',
      'Participate in on-call rotations and maintain high system availability',
      'Write production-quality code with comprehensive test coverage',
      'Engage in design reviews and technical planning',
      'Mentor peers and contribute to engineering culture',
    ],
    qualifications: [
      'CS degree from a reputed institution',
      'Strong problem-solving skills (LeetCode Medium proficiency)',
      'Understanding of OOP, design patterns, and SOLID principles',
      'Ability to write clean, maintainable code',
    ],
    description:
      'Amazon SDE-1 roles offer one of the best growth trajectories in the industry. You will join a two-pizza team and own features end-to-end. The role requires strong fundamentals and a leadership mindset aligned with Amazon\'s Leadership Principles.',
    benefits: ['₹40L+ CTC', 'Signing Bonus', 'RSUs (4-year vest)', 'Relocation Allowance', 'Prime Membership', 'Employee Discount'],
    deadline: '2026-09-01',
    applyUrl: 'https://amazon.jobs',
    websiteUrl: 'https://amazon.com',
    matchAnalysis: {
      matchingSkills: ['Data Structures', 'Algorithms', 'OOP'],
      missingSkills: ['Java or C++', 'System Design', 'AWS', 'Low-level Design'],
      strengths: ['Strong DSA background', 'IIIT Surat pedigree', 'Problem-solving aptitude'],
      weaknesses: ['Primary language is JS/Python, not Java/C++', 'No system design experience', 'No cloud background'],
      suggestions: ['Practice 150+ LeetCode problems (focus on Medium)', 'Learn System Design using Grokking the System Design course', 'Build one AWS project (S3 + Lambda + DynamoDB)'],
    },
    skillGap: [
      { skill: 'System Design', priority: 'High', time: '6 weeks', demand: 95 },
      { skill: 'Java Core', priority: 'High', time: '4 weeks', demand: 80 },
      { skill: 'AWS Services', priority: 'High', time: '4 weeks', demand: 90 },
      { skill: 'Low-level Design (LLD)', priority: 'Medium', time: '3 weeks', demand: 75 },
      { skill: 'Distributed Systems', priority: 'Medium', time: '4 weeks', demand: 88 },
    ],
    roadmap: [
      { week: 'Weeks 1–2', topic: 'LeetCode Intensive (Arrays, DP, Graphs)', priority: 'High', duration: '20 hours' },
      { week: 'Weeks 3–4', topic: 'Java Core + OOP + Design Patterns', priority: 'High', duration: '16 hours' },
      { week: 'Week 5', topic: 'Low-level Design (LLD) with Java', priority: 'High', duration: '10 hours' },
      { week: 'Weeks 6–7', topic: 'System Design Fundamentals (HLD)', priority: 'High', duration: '14 hours' },
      { week: 'Weeks 8–9', topic: 'AWS Core Services + Hands-on Labs', priority: 'Medium', duration: '16 hours' },
      { week: 'Week 10', topic: 'Mock Interviews + Leadership Principles', priority: 'Medium', duration: '8 hours' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const matchColor = (pct) => {
  if (pct >= 85) return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500', ring: 'ring-green-200' };
  if (pct >= 70) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500', ring: 'ring-yellow-200' };
  return { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-400', ring: 'ring-red-200' };
};

const priorityStyle = (p) => ({
  High:   'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  Low:    'bg-blue-50 text-blue-600 border-blue-100',
}[p] || 'bg-gray-50 text-gray-600');

const demandBar = (d) => {
  if (d >= 80) return 'bg-red-400';
  if (d >= 60) return 'bg-yellow-400';
  return 'bg-blue-400';
};

// ─────────────────────────────────────────────────────────────
//  ROADMAP MODAL  (standalone — separate from Job Details)
// ─────────────────────────────────────────────────────────────
const RoadmapModal = ({ jobs, onClose }) => {
  // Aggregate all roadmap steps across every job, deduplicated by topic
  const allSteps = [];
  const seen = new Set();
  jobs.forEach(j => {
    (j.roadmap || []).forEach(step => {
      if (!seen.has(step.topic)) {
        seen.add(step.topic);
        allSteps.push(step);
      }
    });
  });

  // Aggregate all skill gaps
  const skillMap = {};
  jobs.flatMap(j => j.skillGap || []).forEach(s => {
    if (!skillMap[s.skill]) skillMap[s.skill] = { ...s };
    skillMap[s.skill].demand = Math.max(skillMap[s.skill].demand, s.demand);
  });
  const skillGaps = Object.values(skillMap).sort((a, b) => b.demand - a.demand);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-borderMain bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Learning Roadmap</h2>
              <p className="text-sm text-gray-500 mt-0.5">Personalised plan to close your skill gaps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">

          {/* Skill Gap overview */}
          {skillGaps.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Target size={15} className="text-primary" /> Skills to Learn
              </h3>
              <div className="space-y-2.5">
                {skillGaps.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{item.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                          item.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>{item.priority}</span>
                        <span className="text-gray-400">{item.time}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${demandBar(item.demand)} transition-all duration-700`}
                        style={{ width: item.demand + '%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly roadmap timeline */}
          {allSteps.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Flame size={15} className="text-orange-500" /> Weekly Learning Plan
              </h3>
              <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-blue-300 before:to-transparent">
                {allSteps.map((step, i) => (
                  <div key={i} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-8 top-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-sm z-10">
                      {i + 1}
                    </div>
                    <div className="bg-white border border-borderMain rounded-xl p-4 shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">{step.week}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            step.priority === 'High'   ? 'bg-red-50 text-red-600 border-red-100' :
                            step.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>{step.priority} Priority</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} /> {step.duration}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm">{step.topic}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty fallback */}
          {allSteps.length === 0 && skillGaps.length === 0 && (
            <div className="text-center py-10">
              <GraduationCap className="mx-auto w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Run an AI Analysis first to generate your personalised roadmap.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-borderMain bg-gray-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Merge AI recommended jobs with mock data
const buildJobList = (aiJobs = []) => {
  if (!aiJobs || aiJobs.length === 0) return MOCK_JOBS;
  // Enrich AI jobs with mock structure if they match by role name
  const enriched = aiJobs.map((aj, i) => {
    const mock = MOCK_JOBS.find(m => m.role.toLowerCase().includes(aj.role?.toLowerCase()?.split(' ')[0]));
    return mock ? { ...mock, matchPercentage: aj.matchPercentage || mock.matchPercentage, id: mock.id + '_ai_' + i }
      : {
        ...MOCK_JOBS[i % MOCK_JOBS.length],
        id: 'ai_' + i,
        role: aj.role || 'Software Engineer',
        matchPercentage: aj.matchPercentage || 75,
      };
  });
  // Append any mock jobs not represented
  const combined = [...enriched];
  MOCK_JOBS.forEach(m => { if (!enriched.some(e => e.id === m.id)) combined.push(m); });
  return combined;
};

// ─────────────────────────────────────────────────────────────
//  JOB DETAIL MODAL
// ─────────────────────────────────────────────────────────────
const JobModal = ({ job, onClose, savedJobs, onToggleSave }) => {
  const [tab, setTab] = useState('overview');
  const colors = matchColor(job.matchPercentage);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isSaved = savedJobs.includes(job.id);
  const tabs = ['overview', 'match', 'skill gap', 'roadmap'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-borderMain bg-gray-50/60">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${job.companyColor} rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm`}>
              {job.companyLogo}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{job.role}</h2>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                <Building2 size={13} /> {job.company} &nbsp;•&nbsp;
                <MapPin size={13} /> {job.location}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Briefcase size={11} /> {job.type}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <DollarSign size={11} /> {job.salary}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock size={11} /> {job.experience}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
              {job.matchPercentage}% Match
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-borderMain">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${
                tab === t
                  ? 'text-primary border-b-2 border-primary bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'skill gap' ? 'Skill Gap' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <>
              <section>
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Lightbulb size={16} className="text-primary" /> About the Role
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Code2 size={16} className="text-primary" /> Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">{s}</span>
                  ))}
                </div>
                {job.preferredSkills?.length > 0 && (
                  <>
                    <h4 className="font-semibold text-gray-600 text-xs uppercase tracking-wide mt-3 mb-2">Preferred</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.preferredSkills.map(s => (
                        <span key={s} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">{s}</span>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section>
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Users size={16} className="text-primary" /> Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <ChevronRight size={14} className="text-primary shrink-0 mt-0.5" /> {r}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary" /> Qualifications
                  </h3>
                  <ul className="space-y-2">
                    {job.qualifications.map((q, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle size={14} className="text-success shrink-0 mt-0.5" /> {q}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Star size={16} className="text-primary" /> Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map(b => (
                    <span key={b} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100 flex items-center gap-1">
                      <CheckCircle size={10} /> {b}
                    </span>
                  ))}
                </div>
              </section>

              <section className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-700 text-sm font-medium">
                  <Calendar size={15} /> Application Deadline:&nbsp;
                  <span className="font-bold">{new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </section>
            </>
          )}

          {/* ── MATCH ANALYSIS TAB ── */}
          {tab === 'match' && (
            <>
              {/* Score gauge */}
              <div className={`p-5 rounded-2xl ${colors.bg} ring-1 ${colors.ring} flex items-center gap-5`}>
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-white/60" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={colors.text} strokeWidth="3" strokeDasharray={`${job.matchPercentage}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${colors.text}`}>{job.matchPercentage}</span>
                </div>
                <div>
                  <p className={`text-lg font-bold ${colors.text}`}>
                    {job.matchPercentage >= 85 ? 'Excellent Match!' : job.matchPercentage >= 70 ? 'Good Match' : 'Partial Match'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Your profile matches {job.matchPercentage}% of what {job.company} is looking for.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle size={15} /> Matching Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matchAnalysis.matchingSkills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-white text-green-700 text-xs font-medium rounded-full border border-green-200">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle size={15} /> Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matchAnalysis.missingSkills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-white text-red-600 text-xs font-medium rounded-full border border-red-200">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><TrendingUp size={15} className="text-green-500" /> Your Strengths</h4>
                  <ul className="space-y-2">
                    {job.matchAnalysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><AlertCircle size={15} className="text-red-400" /> Areas to Improve</h4>
                  <ul className="space-y-2">
                    {job.matchAnalysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" /> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Zap size={15} /> Suggestions to Improve Match
                </h4>
                <ul className="space-y-2">
                  {job.matchAnalysis.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <ArrowRight size={13} className="shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ── SKILL GAP TAB ── */}
          {tab === 'skill gap' && (
            <>
              <p className="text-sm text-gray-500">Skills you need to learn to increase your match percentage for this role.</p>
              <div className="space-y-4">
                {job.skillGap.map((item, i) => (
                  <div key={i} className="bg-white border border-borderMain rounded-xl p-4 hover:shadow-soft transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-sm">{item.skill}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={11} /> {item.time}</span>
                        <span className="flex items-center gap-1"><Flame size={11} className="text-orange-400" /> {item.demand}% demand</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${demandBar(item.demand)}`}
                        style={{ width: item.demand + '%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── ROADMAP TAB ── */}
          {tab === 'roadmap' && (
            <>
              <p className="text-sm text-gray-500 mb-2">
                A personalised learning roadmap to help you meet <strong>{job.company}</strong>'s requirements.
              </p>
              <div className="relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent space-y-4">
                {job.roadmap.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm z-10
                      ${step.priority === 'High' ? 'bg-red-500' : step.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-white border border-borderMain rounded-xl p-4 shadow-soft group-hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">{step.week}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle(step.priority)}`}>
                            {step.priority}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {step.duration}
                          </span>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{step.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer — sticky action buttons */}
        <div className="p-4 border-t border-borderMain bg-gray-50/60 flex flex-wrap gap-3 items-center justify-between">
          <button
            onClick={() => onToggleSave(job.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors
              ${isSaved
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            {isSaved ? 'Saved' : 'Save Job'}
          </button>

          <div className="flex gap-2">
            {job.websiteUrl && (
              <a
                href={job.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink size={14} /> Website
              </a>
            )}
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              Apply Now <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  PREFERENCES MODAL
// ─────────────────────────────────────────────────────────────
const PreferencesModal = ({ prefs, onChange, onClose }) => {
  const [local, setLocal] = useState({ ...prefs });
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-primary" /> Job Preferences
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Job Type</label>
            <select
              value={local.type}
              onChange={e => setLocal({ ...local, type: e.target.value })}
              className="w-full p-3 border border-borderMain rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary/20"
            >
              {['Any', 'Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={local.location}
              onChange={e => setLocal({ ...local, location: e.target.value })}
              placeholder="e.g. Bengaluru, Remote, Any"
              className="w-full p-3 border border-borderMain rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Match %</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="50" max="95" step="5"
                value={local.minMatch}
                onChange={e => setLocal({ ...local, minMatch: Number(e.target.value) })}
                className="flex-1 accent-primary"
              />
              <span className="font-bold text-primary w-12 text-center">{local.minMatch}%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-borderMain rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          <button
            onClick={() => { onChange(local); onClose(); }}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  JOB CARD
// ─────────────────────────────────────────────────────────────
const JobCard = ({ job, onViewDetails, onToggleSave, isSaved }) => {
  const colors = matchColor(job.matchPercentage);
  return (
    <div className="bg-white p-5 rounded-2xl shadow-soft border border-borderMain hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${job.companyColor} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0`}>
            {job.companyLogo}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-snug">{job.role}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
              <Building2 size={11} className="text-gray-400" /> {job.company}
              &nbsp;·&nbsp;<MapPin size={11} className="text-gray-400" /> {job.location.split('(')[0].trim()}
            </p>
          </div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
          {job.matchPercentage}%
        </div>
      </div>

      {/* Match bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Match Score</span><span>{job.matchPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${colors.bar} transition-all duration-700`} style={{ width: job.matchPercentage + '%' }} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          <DollarSign size={11} /> {job.salary}
        </span>
        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          <Clock size={11} /> {job.experience}
        </span>
        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          <Briefcase size={11} /> {job.type}
        </span>
      </div>

      {/* Required skills */}
      <div className="flex flex-wrap gap-1.5">
        {job.requiredSkills.slice(0, 4).map(s => (
          <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">{s}</span>
        ))}
        {job.requiredSkills.length > 4 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{job.requiredSkills.length - 4}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onViewDetails(job)}
          className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
        >
          View Details <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onToggleSave(job.id)}
          title={isSaved ? 'Remove from saved' : 'Save job'}
          className={`p-2 rounded-xl border transition-colors ${
            isSaved ? 'bg-primary/10 border-primary/20 text-primary' : 'border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-blue-50'
          }`}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
const JobMatch = () => {
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false); // separate from job details modal
  const [savedJobs, setSavedJobs]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_saved_jobs') || '[]'); } catch { return []; }
  });
  const [showPrefs, setShowPrefs]     = useState(false);
  const [activeTab, setActiveTab]     = useState('all'); // all | saved
  const [search, setSearch]           = useState('');
  const [prefs, setPrefs]             = useState({ type: 'Any', location: '', minMatch: 60 });

  // Persist saved jobs
  useEffect(() => {
    localStorage.setItem('cp_saved_jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  // Load jobs (try AI analysis cache, fall back to mock)
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resumes = await resumeService.getResumes();
      if (resumes && resumes.length > 0) {
        const latest = resumes[0];
        const aiJobs = latest.analysisCache?.recommendedJobs || [];
        setJobs(buildJobList(aiJobs));
      } else {
        setJobs(MOCK_JOBS);
      }
    } catch (err) {
      // Fallback to mock data — never show empty state for network errors
      setJobs(MOCK_JOBS);
      setError('Could not load your personalised matches. Showing curated recommendations instead.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const toggleSave = useCallback((id) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);
  }, []);

  // Filtered jobs
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = !search || j.role.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchesTab    = activeTab === 'all' || savedJobs.includes(j.id);
    const matchesPct    = j.matchPercentage >= prefs.minMatch;
    const matchesType   = prefs.type === 'Any' || j.type.toLowerCase().includes(prefs.type.toLowerCase());
    const matchesLoc    = !prefs.location || j.location.toLowerCase().includes(prefs.location.toLowerCase());
    return matchesSearch && matchesTab && matchesPct && matchesType && matchesLoc;
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Global skill gap (aggregate across all jobs)
  const allMissing = jobs.flatMap(j => j.skillGap || []);
  const skillMap = {};
  allMissing.forEach(s => {
    if (!skillMap[s.skill]) skillMap[s.skill] = { ...s, count: 0 };
    skillMap[s.skill].count++;
    skillMap[s.skill].demand = Math.max(skillMap[s.skill].demand, s.demand);
  });
  const topSkillGaps = Object.values(skillMap).sort((a, b) => b.demand - a.demand).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
          <p className="text-gray-500 mt-1 text-sm">Personalised jobs based on your resume and skills.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadJobs}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-blue-50 transition"
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>
          <button
            onClick={() => setShowPrefs(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <SlidersHorizontal size={15} /> Update Preferences
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Search + Tabs ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by role or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-borderMain rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary/20"
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {['all', 'saved'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${
                activeTab === t ? 'bg-white text-gray-900 shadow-soft' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'saved' ? `Saved (${savedJobs.length})` : 'All Jobs'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Job Cards */}
        <div className="lg:col-span-2 space-y-4">

          {loading ? (
            // Skeleton loaders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-borderMain shadow-soft animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-lg w-20" />
                  <div className="h-6 bg-gray-200 rounded-lg w-20" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-9 bg-gray-200 rounded-xl" />
              </div>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-borderMain shadow-soft text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">No jobs found</h3>
              <p className="text-gray-500 text-sm mt-2 mb-5">
                {activeTab === 'saved' ? 'You haven\'t saved any jobs yet.' : 'Try adjusting your search or preferences.'}
              </p>
              <button
                onClick={() => { setSearch(''); setActiveTab('all'); setPrefs({ type: 'Any', location: '', minMatch: 60 }); }}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 font-medium">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>
              {filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={setSelectedJob}
                  onToggleSave={toggleSave}
                  isSaved={savedJobs.includes(job.id)}
                />
              ))}
            </>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">

          {/* Skill Gap Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-soft border border-borderMain">
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Target size={16} className="text-primary" /> Skill Gap Summary
            </h3>
            <p className="text-xs text-gray-500 mb-4">Skills in demand across your job matches.</p>
            <div className="space-y-3">
              {topSkillGaps.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{item.skill}</span>
                    <span className="text-gray-400">{item.demand}% demand</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${demandBar(item.demand)} transition-all duration-700`}
                      style={{ width: item.demand + '%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRoadmap(true)}
              className="w-full mt-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition flex items-center justify-center gap-2"
            >
              <BookOpen size={15} /> View Learning Roadmap
            </button>
          </div>

          {/* Top Match summary card */}
          {!loading && filteredJobs.length > 0 && (
            <div className="bg-gradient-to-br from-primary to-blue-700 p-5 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-blue-200" />
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Top Match</span>
              </div>
              <h4 className="font-bold text-lg leading-tight">{filteredJobs[0].role}</h4>
              <p className="text-blue-100 text-sm mt-0.5">{filteredJobs[0].company}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-3xl font-black">{filteredJobs[0].matchPercentage}%</span>
                <button
                  onClick={() => setSelectedJob(filteredJobs[0])}
                  className="px-4 py-2 bg-white text-primary rounded-xl text-sm font-bold hover:bg-blue-50 transition"
                >
                  View Details
                </button>
              </div>
              <div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-white transition-all duration-700" style={{ width: filteredJobs[0].matchPercentage + '%' }} />
              </div>
            </div>
          )}

          {/* Quick stats */}
          {!loading && (
            <div className="bg-white p-5 rounded-2xl shadow-soft border border-borderMain space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-green-600">{jobs.filter(j => j.matchPercentage >= 80).length}</p>
                  <p className="text-xs text-green-700 font-medium">Strong Matches</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-primary">{savedJobs.length}</p>
                  <p className="text-xs text-blue-700 font-medium">Saved Jobs</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-purple-600">
                    {jobs.length > 0 ? Math.round(jobs.reduce((s, j) => s + j.matchPercentage, 0) / jobs.length) : 0}%
                  </p>
                  <p className="text-xs text-purple-700 font-medium">Avg. Match</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-orange-500">{topSkillGaps.filter(s => s.priority === 'High').length}</p>
                  <p className="text-xs text-orange-700 font-medium">Skills to Learn</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          savedJobs={savedJobs}
          onToggleSave={toggleSave}
        />
      )}
      {showRoadmap && (
        <RoadmapModal
          jobs={jobs}
          onClose={() => setShowRoadmap(false)}
        />
      )}
      {showPrefs && (
        <PreferencesModal
          prefs={prefs}
          onChange={setPrefs}
          onClose={() => setShowPrefs(false)}
        />
      )}
    </div>
  );
};

export default JobMatch;
