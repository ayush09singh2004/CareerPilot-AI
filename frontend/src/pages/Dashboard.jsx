import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, PieChart, Briefcase, TrendingUp,
  Copy, Trash2, Edit, Upload, PenLine, ArrowRight, Sparkles
} from 'lucide-react';
import resumeService from '../services/resumeService';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (err) {
      setError('Failed to fetch resumes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.deleteResume(id);
        setResumes(resumes.filter(r => r._id !== id));
      } catch (err) {
        alert('Failed to delete resume');
      }
    }
  };

  const handleDuplicate = async (resume) => {
    try {
      const duplicateData = {
        ...resume,
        title: `${resume.title || 'Untitled'} (Copy)`,
      };
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.analysisCache;
      delete duplicateData.lastAnalyzedAt;
      delete duplicateData.__v;

      const newResume = await resumeService.createResume(duplicateData);
      setResumes([newResume, ...resumes]);
    } catch (err) {
      alert('Failed to duplicate resume');
    }
  };

  const getLatestScore = () => {
    if (resumes.length === 0) return 0;
    return resumes[0].analysisCache?.resumeScore || 0;
  };

  const getATSScore = () => {
    if (resumes.length === 0) return 0;
    return resumes[0].analysisCache?.atsScore || 0;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {currentUser?.fullName?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          What would you like to do today?
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      )}

      {/* ══════════════════════════════════════════════════════
          DUAL ACTION CARDS — Flow 1 (primary) + Flow 2 (secondary)
          ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Card 1: Upload Existing Resume (PRIMARY) ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-7 text-white flex flex-col shadow-lg">
          {/* decorative blob */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col flex-1">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-5">
              <Upload size={24} className="text-white" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold">Upload Existing Resume</h2>
              <span className="text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                Recommended
              </span>
            </div>

            <p className="text-blue-100 text-sm leading-relaxed mb-6 flex-1">
              Already have a resume? Upload it and get instant ATS analysis, AI feedback,
              job matching, and a personalised learning roadmap.
            </p>

            {/* What you get */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-6">
              {['ATS Score', 'Strengths & Gaps', 'Job Matching', 'Learning Roadmap'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-blue-100">
                  <span className="w-1 h-1 rounded-full bg-blue-200 shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition shadow-sm text-sm"
            >
              <Upload size={16} /> Upload Resume <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Card 2: Create New Resume (SECONDARY) ── */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-7 border-2 border-borderMain flex flex-col shadow-soft hover:border-primary/40 transition-colors">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col flex-1">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <PenLine size={24} className="text-primary" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-gray-900">Create New Resume</h2>
              <Sparkles size={16} className="text-yellow-400" />
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
              Don't have a resume? Build one from scratch using our AI-powered Resume Builder
              with professional templates.
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-6">
              {['3 Pro Templates', 'PDF Download', 'AI Analysis', 'Job Matching'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <Link
              to="/resume-builder"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm text-sm"
            >
              <PenLine size={16} /> Create Resume <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STATS — unchanged from original
          ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <PieChart size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Latest AI Score</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{getLatestScore()}/100</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-success flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Latest ATS Match</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{getATSScore()}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Saved Resumes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{resumes.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-warning flex items-center justify-center">
              <Briefcase size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Recommended Jobs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {resumes[0]?.analysisCache?.recommendedJobs?.length || 0}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RESUME HISTORY — unchanged from original
          ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-soft border border-borderMain p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Resumes</h2>
          <Link to="/resume-builder" className="text-primary text-sm font-medium hover:underline">
            View All
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No resumes yet</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Upload an existing resume or create a new one to get started.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700"
              >
                <Upload size={15} /> Upload Resume
              </Link>
              <Link
                to="/resume-builder"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <PenLine size={15} /> Create Resume
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map(resume => (
              <div
                key={resume._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {resume.template || 'classic'}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg truncate mb-1" title={resume.title}>
                  {resume.title || 'Untitled Resume'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/resume-builder?id=${resume._id}`)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition"
                      title="Edit Resume"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(resume)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {resume.analysisCache ? (
                    <span className="text-xs font-bold text-success bg-green-50 px-2 py-1 rounded">
                      Analyzed
                    </span>
                  ) : (
                    <Link to={`/analysis?id=${resume._id}`} className="text-xs font-bold text-primary hover:underline">
                      Analyze Now
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
