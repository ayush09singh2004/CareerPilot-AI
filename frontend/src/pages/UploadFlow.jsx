import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
import resumeService from '../services/resumeService';

/* ─────────────────────────────────────────────────────────────
   UploadFlow.jsx
   Dedicated page for Flow 1: Upload Existing Resume
   Route: /upload
   ───────────────────────────────────────────────────────────── */

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_EXT = '.pdf, .docx';

const STEPS = ['Upload', 'Parse', 'Save', 'Analyse'];

const UploadFlow = () => {
  const navigate    = useNavigate();
  const inputRef    = useRef();

  const [file,       setFile]       = useState(null);
  const [dragging,   setDragging]   = useState(false);
  const [step,       setStep]       = useState(0);   // 0 = idle, 1-4 = progress steps
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState('');
  const [resumeId,   setResumeId]   = useState(null);

  /* ── File validation ── */
  const validateFile = (f) => {
    if (!f) return 'No file selected.';
    if (!ACCEPTED.includes(f.type)) return 'Only PDF and DOCX files are supported.';
    if (f.size > 5 * 1024 * 1024) return 'File size must be under 5 MB.';
    return null;
  };

  const pickFile = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
    setStep(0);
    setDone(false);
  };

  /* ── Drag & drop handlers ── */
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); };
  const onFileInput = (e) => pickFile(e.target.files[0]);

  /* ── Main upload → parse → save → redirect flow ── */
  const handleProcess = async () => {
    if (!file) return;
    setError('');
    setStep(0);
    setDone(false);

    try {
      /* Step 1 – Upload & Parse */
      setStep(1);
      const formData = new FormData();
      formData.append('resume', file);
      const parsed = await resumeService.uploadResume(formData);

      /* Step 2 – Parse complete, build resume skeleton */
      setStep(2);

      // Derive a sensible name from the filename (e.g. "john_doe_resume.pdf" → "John Doe Resume")
      const nameFromFile = file.name
        .replace(/\.[^/.]+$/, '')          // strip extension
        .replace(/[_-]/g, ' ')             // underscores/dashes → spaces
        .replace(/\b\w/g, c => c.toUpperCase()); // Title Case

      const resumePayload = {
        title        : nameFromFile || 'Imported Resume',
        template     : 'classic',
        // Map to schema field names exactly
        originalFile : file.name,
        extractedText: parsed.extractedText || '',
        personalInfo : {
          // fullName & email are required by the schema — use parsed values or file-derived fallbacks
          fullName  : nameFromFile || 'Imported User',
          email     : parsed.prefill?.email  || 'update@youremail.com',
          phone     : parsed.prefill?.phone  || '',
          address   : '',
          linkedIn  : '',
          github    : '',
          portfolio : '',
          summary   : ''
        },
        education    : [],
        experience   : [],
        projects     : [],
        skills       : [],
        certificates : [],
        achievements : []
      };

      /* Step 3 – Save to MongoDB */
      setStep(3);
      const saved = await resumeService.createResume(resumePayload);
      setResumeId(saved._id);

      /* Step 4 – Ready for Analysis */
      setStep(4);
      setDone(true);

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStep(0);
    }
  };

  const goToAnalysis = () => navigate(`/analysis?id=${resumeId}`);
  const goToBuilder  = () => navigate(resumeId ? `/resume-builder?id=${resumeId}` : '/resume-builder');
  const reset        = () => { setFile(null); setStep(0); setDone(false); setError(''); setResumeId(null); };

  /* ── Step indicator ── */
  const StepBar = () => (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const idx      = i + 1;
        const active   = step === idx;
        const complete = step > idx || done;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                ${complete ? 'bg-success border-success text-white'
                  : active ? 'bg-primary border-primary text-white animate-pulse'
                  : 'bg-white border-gray-200 text-gray-400'}`}>
                {complete ? <CheckCircle size={16} /> : idx}
              </div>
              <span className={`text-xs mt-1 font-medium ${active || complete ? 'text-gray-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 mx-1 mb-5 rounded transition-all duration-500
                ${step > idx || done ? 'bg-success' : step === idx ? 'bg-primary/40' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Existing Resume</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Upload your PDF or DOCX resume. We'll parse it, save it, and run a full AI analysis instantly.
        </p>
      </div>

      {/* Step Bar — only show when processing */}
      {step > 0 && <StepBar />}

      {/* ── Done State ── */}
      {done ? (
        <div className="bg-white rounded-2xl shadow-soft border border-borderMain p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle size={36} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Saved!</h2>
          <p className="text-gray-500 text-sm">
            Your resume has been parsed and saved. Run an AI analysis now to get your ATS score,
            strengths, skill gaps, and a personalised learning roadmap.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-left">
            <strong>📝 Heads up:</strong> We auto-filled your name and email from the filename.
            You can update them in <strong>Resume Builder</strong> before running analysis.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={goToAnalysis}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              Run AI Analysis <ArrowRight size={18} />
            </button>
            <button
              onClick={goToBuilder}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              <FileText size={18} /> Edit in Resume Builder
            </button>
          </div>

          <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition mt-2">
            Upload a different file
          </button>
        </div>

      ) : (

        /* ── Upload Card ── */
        <div className="bg-white rounded-2xl shadow-soft border border-borderMain overflow-hidden">

          {/* Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !step && inputRef.current?.click()}
            className={`m-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-16 cursor-pointer transition-colors
              ${dragging ? 'border-primary bg-blue-50' : file ? 'border-success bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_EXT}
              onChange={onFileInput}
            />

            {file ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
                  <FileText size={28} className="text-success" />
                </div>
                <p className="font-semibold text-gray-800 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition"
                >
                  <X size={12} /> Remove
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Upload size={28} className={dragging ? 'text-primary animate-bounce' : 'text-primary'} />
                </div>
                <p className="font-semibold text-gray-700">Drag & drop your resume here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-400 mt-3">PDF or DOCX · Max 5 MB</p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-sm text-error">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Processing indicator */}
          {step > 0 && step < 4 && (
            <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {step === 1 && 'Uploading and parsing your resume…'}
                    {step === 2 && 'Extracting structured data…'}
                    {step === 3 && 'Saving to your account…'}
                  </p>
                  <p className="text-xs text-blue-500 mt-0.5">This takes just a few seconds</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleProcess}
              disabled={!file || step > 0}
              className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition shadow-sm
                ${!file || step > 0
                  ? 'bg-primary/40 cursor-not-allowed'
                  : 'bg-primary hover:bg-blue-700'}`}
            >
              {step > 0 ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload & Parse Resume
                </>
              )}
            </button>
          </div>

          {/* What happens next */}
          <div className="border-t border-borderMain px-6 py-5 bg-gray-50/60">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What happens next</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['🔍', 'ATS Score Analysis'],
                ['💪', 'Strengths & Weaknesses'],
                ['📊', 'Skill Gap Analysis'],
                ['💼', 'Recommended Jobs'],
                ['🗺️', 'Learning Roadmap'],
                ['✨', 'Resume Suggestions'],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFlow;
