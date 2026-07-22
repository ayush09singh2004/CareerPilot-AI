import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import resumeService from '../services/resumeService';
import html2pdf from 'html2pdf.js';
import { ClassicTemplate, ModernTemplate, MinimalTemplate, toLines } from '../components/ResumeTemplates';

/* ────────────────────────────────────────────────────────────────
   BulletEditor
   Renders a list of editable bullet items. Each item is a <div>.
   • Enter  → add new bullet below
   • Backspace on empty item → remove it and focus previous
   • "+Add Bullet" button → append a blank bullet
   Stores value as string[]  (an array of bullet strings)
──────────────────────────────────────────────────────────────── */
const BulletEditor = ({ value, onChange, placeholder = 'Add bullet point…' }) => {
  // Own normaliser — preserves empty strings so in-progress bullets aren't wiped
  // (toLines() strips empties for PDF output; we need them here for editing)
  const normalize = (v) => {
    if (!v || (Array.isArray(v) && v.length === 0)) return [''];
    if (Array.isArray(v)) return v;
    // Legacy plain-text string
    const split = v.split('\n').map(l => l.replace(/^[-•*]\s*/, ''));
    return split.length > 0 ? split : [''];
  };

  const lines = normalize(value);
  const refs  = useRef([]);

  const update = (newLines) => {
    onChange(newLines.length === 0 ? [''] : newLines);
  };

  const handleChange = (idx, text) => {
    const next = [...lines];
    next[idx] = text;
    update(next);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = [...lines];
      next.splice(idx + 1, 0, '');
      update(next);
      setTimeout(() => refs.current[idx + 1]?.focus(), 0);
    } else if (e.key === 'Backspace' && lines[idx] === '' && lines.length > 1) {
      e.preventDefault();
      const next = [...lines];
      next.splice(idx, 1);
      update(next);
      setTimeout(() => refs.current[Math.max(0, idx - 1)]?.focus(), 0);
    }
  };

  const addBullet = () => {
    const next = [...lines, ''];
    update(next);
    setTimeout(() => refs.current[next.length - 1]?.focus(), 0);
  };

  return (
    <div className="border border-borderMain rounded-lg bg-white col-span-2">
      <div className="px-3 pt-2 pb-1 space-y-1">
        {lines.map((line, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <span className="text-gray-400 shrink-0 select-none" style={{ fontSize: '8px' }}>●</span>
            <input
              ref={(el) => (refs.current[idx] = el)}
              type="text"
              value={line}
              placeholder={idx === 0 ? placeholder : 'Add another bullet…'}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="flex-1 py-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400"
            />
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const next = [...lines];
                  next.splice(idx, 1);
                  update(next.length === 0 ? [''] : next);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 text-xs transition-opacity shrink-0"
                title="Remove bullet"
              >×</button>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 px-3 py-1.5">
        <button
          type="button"
          onClick={addBullet}
          className="text-xs text-primary hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <span className="text-base leading-none">+</span> Add Bullet
        </button>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   ResumeBuilder page
──────────────────────────────────────────────────────────────── */
const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState({
    title: 'Untitled Resume',
    template: 'classic',
    personalInfo: { fullName: '', email: '', phone: '', address: '', linkedIn: '', github: '', portfolio: '', summary: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certificates: [],
    achievements: []
  });
  const [resumeId, setResumeId]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const printRef    = useRef();
  const [searchParams] = useSearchParams();
  const urlResumeId = searchParams.get('id');

  // ── Load resume ──────────────────────────────────────────────
  useEffect(() => {
    const fetchResume = async () => {
      try {
        if (urlResumeId) {
          const resume = await resumeService.getResumeById(urlResumeId);
          if (resume) applyResume(resume);
        } else {
          const resumes = await resumeService.getResumes();
          if (resumes?.length > 0) applyResume(resumes[0]);
        }
      } catch (err) {
        console.error('Failed to fetch resume', err);
      }
    };
    fetchResume();
  }, [urlResumeId]);

  const applyResume = (r) => {
    setResumeId(r._id);
    setResumeData({
      title:       r.title       || 'Untitled Resume',
      template:    r.template    || 'classic',
      personalInfo: r.personalInfo || {},
      education:   r.education   || [],
      experience:  r.experience  || [],
      projects:    r.projects    || [],
      skills:      r.skills      || [],
      certificates: r.certificates || [],
      achievements: r.achievements || []
    });
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handlePersonalInfo = (e) =>
    setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [e.target.name]: e.target.value } }));

  const handleArrayAdd = (field, empty) =>
    setResumeData(prev => ({ ...prev, [field]: [...prev[field], empty] }));

  const handleArrayRemove = (field, idx) =>
    setResumeData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));

  const handleArrayChange = (field, idx, key, value) =>
    setResumeData(prev => {
      const arr = [...prev[field]];
      if (typeof arr[idx] === 'string') arr[idx] = value;
      else arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, [field]: arr };
    });

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setError(''); setSuccess('');
    if (!resumeData.personalInfo.fullName || !resumeData.personalInfo.email)
      return setError('Full Name and Email are required.');
    setLoading(true);
    try {
      if (resumeId) {
        await resumeService.updateResume(resumeId, resumeData);
        setSuccess('Resume updated successfully!');
      } else {
        const created = await resumeService.createResume(resumeData);
        setResumeId(created._id);
        setSuccess('Resume created successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resume.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // ── PDF Download ─────────────────────────────────────────────
  const handleDownloadPdf = () => {
    const el = printRef.current;
    if (!el) return;

    // ① Temporarily clear minHeight so html2canvas captures ONLY real content
    //    (minHeight: 297mm causes blank second page due to scale-rounding in jsPDF)
    const savedMinH = el.style.minHeight;
    el.style.minHeight = 'auto';

    const opt = {
      margin:      0,
      filename:    `${resumeData.personalInfo.fullName || 'resume'}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const restore = () => { el.style.minHeight = savedMinH; };

    html2pdf()
      .set(opt)
      .from(el)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        // ② Safety net: delete trailing blank pages (e.g. Modern template footer space)
        const total = pdf.internal.getNumberOfPages();
        if (total > 1) {
          // Heuristic: last page is blank if content height < 5% of page height
          // jsPDF doesn't expose per-page content, so use element-vs-page ratio
          const elHeightMm = el.getBoundingClientRect().height * 0.264583; // px→mm
          const pageH      = pdf.internal.pageSize.getHeight(); // 297
          const extraPages = Math.max(0, Math.ceil(elHeightMm / pageH) - Math.round(elHeightMm / pageH));
          if (extraPages === 0 && total > Math.ceil(elHeightMm / pageH)) {
            pdf.deletePage(total);
          }
        }
      })
      .save()
      .then(restore)
      .catch(restore);
  };

  // ── Resume Upload (import) ───────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Only PDF and DOCX files are supported.'); return;
    }
    setUploading(true); setError(''); setSuccess('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const data = await resumeService.uploadResume(formData);
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          email: prev.personalInfo.email || data.prefill?.email || '',
          phone: prev.personalInfo.phone || data.prefill?.phone || ''
        }
      }));
      setSuccess('Resume imported! Review and fill missing fields.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse resume.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // ── Template renderer ────────────────────────────────────────
  const renderTemplate = () => {
    switch (resumeData.template) {
      case 'modern':  return <ModernTemplate  data={resumeData} />;
      case 'minimal': return <MinimalTemplate data={resumeData} />;
      default:        return <ClassicTemplate data={resumeData} />;
    }
  };

  // ── Shared form field classes ────────────────────────────────
  const inp  = 'p-2 border border-borderMain rounded-lg text-sm focus:outline-none focus:ring-2 ring-primary/20 w-full';
  const inp2 = inp + ' col-span-2';

  // ── Section header with Add button ──────────────────────────
  const SectionHeader = ({ title, onAdd }) => (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
      <h3 className="font-semibold text-textMain">{title}</h3>
      {onAdd && <button type="button" onClick={onAdd} className="text-primary text-sm font-medium hover:underline">+ Add</button>}
    </div>
  );

  // ── Card wrapper for repeating sections ─────────────────────
  const Card = ({ onRemove, children }) => (
    <div className="p-4 border border-borderMain rounded-xl relative bg-gray-50/50">
      <button type="button" onClick={onRemove} className="absolute top-2 right-2 text-red-500 text-xs font-bold hover:underline">Remove</button>
      <div className="grid grid-cols-2 gap-3 mt-2">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6" style={{ minHeight: 'calc(100vh - 10rem)' }}>

      {/* ── Editor Panel ── */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white rounded-2xl shadow-soft border border-borderMain overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 10rem)' }}>

        {/* Toolbar */}
        <div className="p-4 border-b border-borderMain bg-gray-50 flex flex-wrap justify-between items-center gap-4">
          <input
            type="text"
            value={resumeData.title}
            onChange={(e) => setResumeData(d => ({ ...d, title: e.target.value }))}
            className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-2 ring-primary/20 rounded px-2 w-48"
          />
          <div className="flex gap-2">
            <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center gap-2">
              {uploading ? 'Parsing…' : 'Import Resume'}
              <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleUpload} disabled={uploading} />
            </label>
            <button
              onClick={handleSave}
              disabled={loading || uploading}
              className={`px-4 py-2 text-white rounded-lg text-sm font-medium shadow-sm ${loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'}`}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {error   && <div className="p-3 m-4 bg-red-50   text-error   text-sm rounded-lg border border-red-100">{error}</div>}
        {success && <div className="p-3 m-4 bg-green-50 text-success text-sm rounded-lg border border-green-100">{success}</div>}

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Template selector */}
          <div className="space-y-4">
            <h3 className="font-semibold text-textMain border-b border-gray-100 pb-2">Select Template</h3>
            <div className="flex gap-3">
              {[{ id: 'classic', label: 'Classic' }, { id: 'modern', label: 'Modern' }, { id: 'minimal', label: 'Minimal' }].map(t => (
                <button
                  key={t.id}
                  onClick={() => setResumeData(d => ({ ...d, template: t.id }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${resumeData.template === t.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >{t.label}</button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text"  name="fullName"  value={resumeData.personalInfo.fullName}  onChange={handlePersonalInfo} placeholder="Full Name *"          className={inp} />
              <input type="email" name="email"     value={resumeData.personalInfo.email}     onChange={handlePersonalInfo} placeholder="Email *"              className={inp} />
              <input type="tel"   name="phone"     value={resumeData.personalInfo.phone}     onChange={handlePersonalInfo} placeholder="Phone"                 className={inp} />
              <input type="text"  name="address"   value={resumeData.personalInfo.address}   onChange={handlePersonalInfo} placeholder="Address / Location"    className={inp} />
              <input type="url"   name="linkedIn"  value={resumeData.personalInfo.linkedIn}  onChange={handlePersonalInfo} placeholder="LinkedIn URL"          className={inp} />
              <input type="url"   name="github"    value={resumeData.personalInfo.github}    onChange={handlePersonalInfo} placeholder="GitHub URL"            className={inp} />
              <input type="url"   name="portfolio" value={resumeData.personalInfo.portfolio} onChange={handlePersonalInfo} placeholder="Portfolio URL"         className={inp2} />
              <textarea name="summary" value={resumeData.personalInfo.summary} onChange={handlePersonalInfo} placeholder="Professional Summary" className={`${inp2} h-24 resize-none`} />
            </div>
          </div>

          {/* Education */}
          <div>
            <SectionHeader title="Education" onAdd={() => handleArrayAdd('education', { college: '', degree: '', branch: '', startYear: '', endYear: '', cgpa: '' })} />
            <div className="space-y-4">
              {resumeData.education.map((edu, idx) => (
                <Card key={idx} onRemove={() => handleArrayRemove('education', idx)}>
                  <input type="text" placeholder="College / University"  value={edu.college}   onChange={e => handleArrayChange('education', idx, 'college',   e.target.value)} className={inp2} />
                  <input type="text" placeholder="Degree (e.g. B.Tech)"  value={edu.degree}    onChange={e => handleArrayChange('education', idx, 'degree',    e.target.value)} className={inp} />
                  <input type="text" placeholder="Branch / Field"         value={edu.branch}    onChange={e => handleArrayChange('education', idx, 'branch',    e.target.value)} className={inp} />
                  <input type="text" placeholder="Start Year"             value={edu.startYear} onChange={e => handleArrayChange('education', idx, 'startYear', e.target.value)} className={inp} />
                  <input type="text" placeholder="End Year"               value={edu.endYear}   onChange={e => handleArrayChange('education', idx, 'endYear',   e.target.value)} className={inp} />
                  <input type="text" placeholder="CGPA / Grade"           value={edu.cgpa}      onChange={e => handleArrayChange('education', idx, 'cgpa',      e.target.value)} className={inp2} />
                </Card>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <SectionHeader title="Experience" onAdd={() => handleArrayAdd('experience', { company: '', role: '', startDate: '', endDate: '', description: [''] })} />
            <div className="space-y-4">
              {resumeData.experience.map((exp, idx) => (
                <Card key={idx} onRemove={() => handleArrayRemove('experience', idx)}>
                  <input type="text" placeholder="Company Name"           value={exp.company}   onChange={e => handleArrayChange('experience', idx, 'company',   e.target.value)} className={inp2} />
                  <input type="text" placeholder="Role / Job Title"       value={exp.role}      onChange={e => handleArrayChange('experience', idx, 'role',      e.target.value)} className={inp2} />
                  <input type="text" placeholder="Start Date (e.g. Jan 2024)" value={exp.startDate} onChange={e => handleArrayChange('experience', idx, 'startDate', e.target.value)} className={inp} />
                  <input type="text" placeholder="End Date (or Present)"  value={exp.endDate}   onChange={e => handleArrayChange('experience', idx, 'endDate',   e.target.value)} className={inp} />
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Description — bullet points</p>
                    <BulletEditor
                      value={exp.description}
                      onChange={(lines) => handleArrayChange('experience', idx, 'description', lines)}
                      placeholder="Describe your responsibilities…"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <SectionHeader title="Projects" onAdd={() => handleArrayAdd('projects', { projectName: '', technologies: '', description: [''], githubLink: '', liveLink: '' })} />
            <div className="space-y-4">
              {resumeData.projects.map((proj, idx) => (
                <Card key={idx} onRemove={() => handleArrayRemove('projects', idx)}>
                  <input type="text" placeholder="Project Name"                    value={proj.projectName}  onChange={e => handleArrayChange('projects', idx, 'projectName',  e.target.value)} className={inp2} />
                  <input type="text" placeholder="Technologies (e.g. React, Node)" value={proj.technologies} onChange={e => handleArrayChange('projects', idx, 'technologies', e.target.value)} className={inp2} />
                  <input type="url"  placeholder="GitHub Link"                     value={proj.githubLink}   onChange={e => handleArrayChange('projects', idx, 'githubLink',   e.target.value)} className={inp} />
                  <input type="url"  placeholder="Live Demo Link"                  value={proj.liveLink}     onChange={e => handleArrayChange('projects', idx, 'liveLink',     e.target.value)} className={inp} />
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Description — bullet points</p>
                    <BulletEditor
                      value={proj.description}
                      onChange={(lines) => handleArrayChange('projects', idx, 'description', lines)}
                      placeholder="What did you build / achieve?"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Skills — bullet list by category */}
          <div>
            <SectionHeader title="Skills" />
            <p className="text-xs text-gray-400 mb-2">Each bullet = one skill category (e.g. "Frontend: React, Tailwind CSS")</p>
            <BulletEditor
              value={resumeData.skills.length > 0 ? resumeData.skills : ['']}
              onChange={(lines) => setResumeData(d => ({ ...d, skills: lines }))}
              placeholder="e.g. Programming Languages: C, C++, JavaScript"
            />
          </div>

          {/* Certificates */}
          <div>
            <SectionHeader title="Certificates" onAdd={() => handleArrayAdd('certificates', { name: '', issuer: '', date: '', link: '' })} />
            <div className="space-y-4">
              {resumeData.certificates.map((cert, idx) => (
                <Card key={idx} onRemove={() => handleArrayRemove('certificates', idx)}>
                  <input type="text" placeholder="Certificate Name"     value={cert.name}   onChange={e => handleArrayChange('certificates', idx, 'name',   e.target.value)} className={inp2} />
                  <input type="text" placeholder="Issuer (e.g. Coursera)" value={cert.issuer} onChange={e => handleArrayChange('certificates', idx, 'issuer', e.target.value)} className={inp} />
                  <input type="text" placeholder="Date (e.g. 2024)"     value={cert.date}   onChange={e => handleArrayChange('certificates', idx, 'date',   e.target.value)} className={inp} />
                  <input type="url"  placeholder="Credential URL"       value={cert.link}   onChange={e => handleArrayChange('certificates', idx, 'link',   e.target.value)} className={inp2} />
                </Card>
              ))}
            </div>
          </div>

          {/* Achievements — bullet list */}
          <div>
            <SectionHeader title="Achievements" />
            <p className="text-xs text-gray-400 mb-2">Each bullet = one achievement (Enter to add new, Backspace on empty to remove)</p>
            <BulletEditor
              value={resumeData.achievements.length > 0 ? resumeData.achievements : ['']}
              onChange={(lines) => setResumeData(d => ({ ...d, achievements: lines }))}
              placeholder="e.g. Solved 180+ LeetCode problems"
            />
          </div>

        </div>
      </div>

      {/* ── Preview Panel ── */}
      <div className="w-full lg:flex-1 bg-gray-200 rounded-2xl border border-borderMain flex flex-col items-center p-4 lg:p-8 overflow-y-auto relative" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
        <div className="w-full flex justify-end mb-4 max-w-[210mm]">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium shadow-md hover:bg-black transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>

        <div className="resume-pdf-doc w-full max-w-[210mm] min-h-[297mm] shadow-xl bg-white" ref={printRef}>
          {renderTemplate()}
        </div>
      </div>

    </div>
  );
};

export default ResumeBuilder;
