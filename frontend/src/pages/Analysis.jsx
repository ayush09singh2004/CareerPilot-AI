import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import analysisService from '../services/analysisService';
import resumeService from '../services/resumeService';
import { Briefcase } from 'lucide-react';

const Analysis = () => {
  const [resumes, setResumes]               = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [analysis, setAnalysis]             = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const navigate                            = useNavigate();
  const [searchParams]                      = useSearchParams();
  const urlResumeId                         = searchParams.get('id');

  // Fetch resumes on mount; auto-select if ID provided in URL
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await resumeService.getResumes();
        setResumes(data);
        if (urlResumeId && data.some(r => r._id === urlResumeId)) {
          setSelectedResumeId(urlResumeId);
        } else if (data.length > 0) {
          setSelectedResumeId(data[0]._id);
        }
      } catch (err) {
        setError('Failed to load resumes.');
      }
    };
    fetchResumes();
  }, [urlResumeId]);

  const handleAnalyze = async () => {
    if (!selectedResumeId) return setError('Please select a resume to analyze.');
    setLoading(true);
    setError('');
    try {
      const result = await analysisService.analyzeResume(selectedResumeId);
      setAnalysis(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderScoreCard = (title, score, colorClass) => (
    <div className={`p-6 rounded-2xl border bg-white shadow-sm flex flex-col items-center justify-center ${colorClass}`}>
      <h3 className="text-gray-500 font-medium mb-2 text-center uppercase tracking-wider text-sm">{title}</h3>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className="text-current" strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <span className="absolute text-2xl font-bold text-gray-800">{score}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Resume Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">Get instant feedback and a personalized learning roadmap.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {resumes.length > 0 && (
            <select
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ring-primary/20 text-sm"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              {resumes.map(r => (
                <option key={r._id} value={r._id}>{r.title || 'Untitled Resume'}</option>
              ))}
            </select>
          )}
          {resumes.length === 0 && (
            <span className="text-sm text-gray-400 italic">No resumes found — upload or create one first.</span>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading || resumes.length === 0}
            className={`px-5 py-2.5 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors ${loading || resumes.length === 0 ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'}`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            )}
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-error rounded-xl border border-red-100">{error}</div>}

      {/* Loading Skeleton */}
      {loading && !analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="h-48 bg-gray-200 rounded-2xl md:col-span-2"></div>
          <div className="h-64 bg-gray-200 rounded-2xl md:col-span-3"></div>
        </div>
      )}

      {/* Results Dashboard */}
      {!loading && analysis && (
        <div className="space-y-6">

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {renderScoreCard("Overall Score", analysis.resumeScore, "text-primary border-blue-100")}
            {renderScoreCard("ATS Match", analysis.atsScore, "text-green-500 border-green-100")}

            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
              <h3 className="text-gray-500 font-medium mb-3 uppercase tracking-wider text-sm">Professional Summary</h3>
              <p className="text-gray-700 leading-relaxed text-sm">{analysis.summary}</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
              <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
              <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Keywords & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
              <h3 className="text-gray-800 font-bold mb-4">Missing ATS Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords?.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">{kw}</span>
                ))}
                {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) && (
                  <span className="text-sm text-gray-500">No missing keywords found!</span>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
              <h3 className="text-gray-800 font-bold mb-4">Missing Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg border border-yellow-200">{skill}</span>
                ))}
                {(!analysis.missingSkills || analysis.missingSkills.length === 0) && (
                  <span className="text-sm text-gray-500">Your skill list looks complete!</span>
                )}
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
            <h3 className="text-gray-800 font-bold mb-4">Improvement Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.improvementSuggestions?.map((sug, i) => (
                <div key={i} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-sm text-gray-700">{sug}</div>
              ))}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-gray-800 font-bold">Recommended Job Roles</h3>
              <button
                onClick={() => navigate('/job-match')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
              >
                <Briefcase size={15} /> View All Job Matches
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.recommendedJobs?.map((job, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/job-match')}
                  className="p-4 border border-borderMain rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/30 hover:shadow-soft transition"
                >
                  <span className="font-medium text-gray-800 text-sm">{job.role}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${job.matchPercentage > 80 ? 'bg-green-100 text-green-700' : job.matchPercentage > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {job.matchPercentage}% Match
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gap & Roadmap */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
            <h3 className="text-gray-800 font-bold mb-2">Skill Gap Analysis</h3>
            <p className="text-sm text-gray-600 mb-6">{analysis.skillGap}</p>

            <h3 className="text-gray-800 font-bold mb-4">Personalized Learning Roadmap</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {analysis.learningRoadmap?.map((step, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white font-bold text-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    {i + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-primary uppercase">{step.week}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${step.priority === 'High' ? 'bg-red-100 text-red-600' : step.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                        {step.priority} Priority
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{step.topic}</h4>
                    <p className="text-xs text-gray-500">Estimated time: {step.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/job-match')}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              <Briefcase size={18} /> View Job Matches
            </button>
            <button
              onClick={() => { setAnalysis(null); }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Run New Analysis
            </button>
          </div>

        </div>
      )}

      {/* Empty state — no analysis yet */}
      {!loading && !analysis && resumes.length > 0 && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Ready to analyse your resume?</h3>
          <p className="text-gray-500 text-sm mb-5">Select a resume from the dropdown above and click <strong>Run Analysis</strong>.</p>
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            Run Analysis Now
          </button>
        </div>
      )}

    </div>
  );
};

export default Analysis;
