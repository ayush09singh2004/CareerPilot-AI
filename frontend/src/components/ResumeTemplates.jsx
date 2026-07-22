import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────────────────────── */

/**
 * Normalise a description field.
 * Accepts: string (legacy) | string[] (current) | undefined
 * Returns: string[]  — always an array of non-empty bullet strings
 */
export const toLines = (desc) => {
  if (!desc) return [];
  if (Array.isArray(desc)) return desc.filter(l => l && l.trim());
  // Legacy plain-text: split on newlines
  return desc.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
};

/** Inline-style bullet list — renders correctly in html2canvas / PDF */
const BulletList = ({ items, style = {} }) => {
  const lines = toLines(items);
  if (!lines.length) return null;
  return (
    <ul style={{ paddingLeft: '1.25em', marginTop: '4px', marginBottom: 0, listStyleType: 'disc', ...style }}>
      {lines.map((line, i) => (
        <li key={i} style={{ marginBottom: '2px', paddingLeft: '2px' }}>{line}</li>
      ))}
    </ul>
  );
};

/* ─────────────────────────────────────────────────────────────
   1. Classic ATS-Friendly Template
───────────────────────────────────────────────────────────── */
export const ClassicTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certificates = [], achievements = [] } = data;

  const sectionTitle = (text) => (
    <h2 style={{
      fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', borderBottom: '1.5px solid #374151',
      paddingBottom: '3px', marginBottom: '8px', marginTop: '16px', color: '#111827'
    }}>{text}</h2>
  );

  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: '10.5pt', lineHeight: 1.5, color: '#1f2937', padding: '18mm 20mm', backgroundColor: 'white' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '10px', marginBottom: '12px' }}>
        <div style={{ fontSize: '22pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#111827' }}>
          {personalInfo.fullName || 'YOUR NAME'}
        </div>
        <div style={{ fontSize: '9pt', marginTop: '5px', color: '#4b5563', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.address && <span>• {personalInfo.address}</span>}
          {personalInfo.linkedIn && <span>• <a href={personalInfo.linkedIn} style={{ color: '#2563eb' }}>LinkedIn</a></span>}
          {personalInfo.github && <span>• <a href={personalInfo.github} style={{ color: '#2563eb' }}>GitHub</a></span>}
          {personalInfo.portfolio && <span>• <a href={personalInfo.portfolio} style={{ color: '#2563eb' }}>Portfolio</a></span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <>
          {sectionTitle('Summary')}
          <p style={{ fontSize: '10pt', color: '#374151', textAlign: 'justify', marginBottom: '4px' }}>{personalInfo.summary}</p>
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          {sectionTitle('Education')}
          <div>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '10pt' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>{edu.college || 'College Name'}</span>
                  <span>{edu.startYear}{edu.startYear && edu.endYear ? ' – ' : ''}{edu.endYear}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', color: '#374151' }}>
                  <span>{edu.degree}{edu.branch ? ` in ${edu.branch}` : ''}</span>
                  {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          {sectionTitle('Experience')}
          <div>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '10px', fontSize: '10pt' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>{exp.company || 'Company'}</span>
                  <span>{exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}</span>
                </div>
                <div style={{ fontStyle: 'italic', color: '#374151', marginBottom: '3px' }}>{exp.role || 'Role'}</div>
                <BulletList items={exp.description} style={{ color: '#374151', fontSize: '10pt' }} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          {sectionTitle('Projects')}
          <div>
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px', fontSize: '10pt' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  {proj.projectName || 'Project Name'}
                  {proj.githubLink && <a href={proj.githubLink} style={{ fontSize: '8.5pt', color: '#2563eb', fontWeight: 400 }}>[GitHub]</a>}
                  {proj.liveLink && <a href={proj.liveLink} style={{ fontSize: '8.5pt', color: '#2563eb', fontWeight: 400 }}>[Live]</a>}
                </div>
                {proj.technologies && (
                  <div style={{ fontStyle: 'italic', color: '#4b5563', fontSize: '9.5pt', marginBottom: '2px' }}>
                    Tech Stack: {proj.technologies}
                  </div>
                )}
                <BulletList items={proj.description} style={{ color: '#374151', fontSize: '10pt' }} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && skills.some(s => s && s.trim()) && (
        <>
          {sectionTitle('Technical Skills')}
          <ul style={{ paddingLeft: '1.25em', listStyleType: 'disc', fontSize: '10pt', color: '#374151', margin: 0 }}>
            {skills.filter(s => s && s.trim()).map((s, i) => {
              // Bold the category label if format is "Label: skills"
              const colonIdx = s.indexOf(':');
              if (colonIdx > 0) {
                const label = s.slice(0, colonIdx);
                const rest  = s.slice(colonIdx);
                return <li key={i} style={{ marginBottom: '2px' }}><strong>{label}</strong>{rest}</li>;
              }
              return <li key={i} style={{ marginBottom: '2px' }}>{s}</li>;
            })}
          </ul>
        </>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <>
          {sectionTitle('Certifications')}
          <ul style={{ paddingLeft: '1.25em', listStyleType: 'disc', fontSize: '10pt', color: '#374151' }}>
            {certificates.map((cert, i) => (
              <li key={i} style={{ marginBottom: '3px' }}>
                <span style={{ fontWeight: 600 }}>{cert.name}</span>
                {cert.issuer && <span style={{ color: '#6b7280' }}> — {cert.issuer}</span>}
                {cert.date && <span style={{ color: '#9ca3af' }}> ({cert.date})</span>}
                {cert.link && <span> <a href={cert.link} style={{ color: '#2563eb', fontSize: '9pt' }}>[View]</a></span>}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Achievements */}
      {achievements.length > 0 && achievements.some(a => a && a.trim()) && (
        <>
          {sectionTitle('Achievements')}
          <ul style={{ paddingLeft: '1.25em', listStyleType: 'disc', fontSize: '10pt', color: '#374151' }}>
            {achievements.filter(a => a && a.trim()).map((ach, i) => (
              <li key={i} style={{ marginBottom: '3px' }}>{ach}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   2. Modern Professional Template
───────────────────────────────────────────────────────────── */
export const ModernTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certificates = [], achievements = [] } = data;

  const sideHead = (text) => (
    <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280', marginBottom: '6px', marginTop: '16px' }}>{text}</div>
  );

  const mainHead = (text) => (
    <div style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1f2937', borderBottom: '2px solid #60a5fa', paddingBottom: '3px', marginBottom: '10px', marginTop: '0' }}>{text}</div>
  );

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10pt', color: '#1f2937', display: 'flex', backgroundColor: 'white' }}>

      {/* Sidebar */}
      <div style={{ width: '33%', backgroundColor: '#111827', color: '#e5e7eb', padding: '24px 18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '20pt', fontWeight: 700, color: '#93c5fd', lineHeight: 1.2 }}>
          {personalInfo.fullName || 'YOUR NAME'}
        </div>

        {sideHead('Contact')}
        <div style={{ fontSize: '9pt', lineHeight: 1.7 }}>
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.address && <div>{personalInfo.address}</div>}
        </div>

        {(personalInfo.linkedIn || personalInfo.github || personalInfo.portfolio) && (
          <>
            {sideHead('Links')}
            <div style={{ fontSize: '9pt', lineHeight: 1.7 }}>
              {personalInfo.linkedIn && <div><a href={personalInfo.linkedIn} style={{ color: '#93c5fd' }}>LinkedIn</a></div>}
              {personalInfo.github && <div><a href={personalInfo.github} style={{ color: '#93c5fd' }}>GitHub</a></div>}
              {personalInfo.portfolio && <div><a href={personalInfo.portfolio} style={{ color: '#93c5fd' }}>Portfolio</a></div>}
            </div>
          </>
        )}

        {skills.length > 0 && skills.some(s => s && s.trim()) && (
          <>
            {sideHead('Skills')}
            <ul style={{ paddingLeft: '1em', listStyleType: 'disc', fontSize: '8.5pt', color: '#d1d5db', margin: 0 }}>
              {skills.filter(s => s && s.trim()).map((s, i) => {
                const colonIdx = s.indexOf(':');
                if (colonIdx > 0) {
                  const label = s.slice(0, colonIdx);
                  const rest  = s.slice(colonIdx);
                  return <li key={i} style={{ marginBottom: '3px' }}><span style={{ color: '#93c5fd', fontWeight: 600 }}>{label}</span>{rest}</li>;
                }
                return <li key={i} style={{ marginBottom: '3px' }}>{s}</li>;
              })}
            </ul>
          </>
        )}

        {certificates.length > 0 && (
          <>
            {sideHead('Certifications')}
            {certificates.map((cert, i) => (
              <div key={i} style={{ fontSize: '8.5pt', marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, color: '#f9fafb' }}>{cert.name}</div>
                <div style={{ color: '#9ca3af', fontSize: '8pt' }}>{cert.issuer}{cert.date ? ` (${cert.date})` : ''}</div>
              </div>
            ))}
          </>
        )}

        {achievements.length > 0 && achievements.some(a => a && a.trim()) && (
          <>
            {sideHead('Achievements')}
            <ul style={{ paddingLeft: '1.1em', listStyleType: 'disc', fontSize: '8.5pt', color: '#d1d5db' }}>
              {achievements.filter(a => a && a.trim()).map((ach, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>{ach}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ width: '67%', padding: '24px 22px', boxSizing: 'border-box' }}>

        {personalInfo.summary && (
          <div style={{ marginBottom: '16px' }}>
            {mainHead('Profile')}
            <p style={{ fontSize: '9.5pt', color: '#4b5563', lineHeight: 1.6 }}>{personalInfo.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {mainHead('Experience')}
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px', fontSize: '9.5pt' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '10.5pt', color: '#111827' }}>{exp.role || 'Role'}</span>
                  <span style={{ fontSize: '8.5pt', backgroundColor: '#eff6ff', color: '#2563eb', padding: '1px 7px', borderRadius: '4px', fontWeight: 600 }}>
                    {exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}
                  </span>
                </div>
                <div style={{ color: '#4b5563', fontWeight: 600, marginBottom: '4px' }}>{exp.company}</div>
                <BulletList items={exp.description} style={{ color: '#4b5563', fontSize: '9pt' }} />
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {mainHead('Education')}
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '9.5pt' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#111827' }}>
                  <span>{edu.degree}{edu.branch ? ` in ${edu.branch}` : ''}</span>
                  <span style={{ color: '#6b7280', fontSize: '9pt', fontWeight: 400 }}>{edu.startYear}{edu.startYear && edu.endYear ? ' – ' : ''}{edu.endYear}</span>
                </div>
                <div style={{ color: '#4b5563' }}>{edu.college}</div>
                {edu.cgpa && <div style={{ fontSize: '9pt', color: '#6b7280' }}>CGPA: {edu.cgpa}</div>}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {mainHead('Projects')}
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px', fontSize: '9.5pt' }}>
                <div style={{ fontWeight: 700, color: '#111827', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  {proj.projectName}
                  {proj.githubLink && <a href={proj.githubLink} style={{ fontSize: '8pt', color: '#2563eb', fontWeight: 400 }}>[GitHub]</a>}
                  {proj.liveLink && <a href={proj.liveLink} style={{ fontSize: '8pt', color: '#2563eb', fontWeight: 400 }}>[Live]</a>}
                </div>
                {proj.technologies && (
                  <div style={{ color: '#2563eb', fontSize: '8.5pt', fontWeight: 500, marginBottom: '2px' }}>{proj.technologies}</div>
                )}
                <BulletList items={proj.description} style={{ color: '#4b5563', fontSize: '9pt' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. Minimal Elegant Template
───────────────────────────────────────────────────────────── */
export const MinimalTemplate = ({ data }) => {
  const { personalInfo = {}, education = [], experience = [], projects = [], skills = [], certificates = [], achievements = [] } = data;

  const sectionTitle = (text) => (
    <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#9ca3af', textAlign: 'center', marginBottom: '14px' }}>{text}</div>
  );

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10pt', color: '#374151', padding: '20mm', backgroundColor: 'white', lineHeight: 1.55 }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '26pt', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#111827', marginBottom: '8px' }}>
          {personalInfo.fullName || 'YOUR NAME'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
          {personalInfo.linkedIn && <a href={personalInfo.linkedIn} style={{ color: '#6b7280' }}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={{ color: '#6b7280' }}>GitHub</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={{ color: '#6b7280' }}>Portfolio</a>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '0 30px' }}>
          <p style={{ fontStyle: 'italic', color: '#6b7280', lineHeight: 1.7 }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {sectionTitle('Work Experience')}
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                <span style={{ fontWeight: 500, color: '#111827', fontSize: '10.5pt' }}>
                  {exp.role} <span style={{ color: '#9ca3af', fontWeight: 300, margin: '0 6px' }}>|</span> {exp.company}
                </span>
                <span style={{ fontSize: '8pt', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}
                </span>
              </div>
              <BulletList items={exp.description} style={{ color: '#6b7280', fontSize: '9.5pt' }} />
            </div>
          ))}
        </div>
      )}

      {/* Two-column: Education + Skills/Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        <div>
          {education.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {sectionTitle('Education')}
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{edu.college}</div>
                  <div style={{ color: '#6b7280', fontSize: '9.5pt' }}>{edu.degree}{edu.branch ? ` — ${edu.branch}` : ''}</div>
                  {edu.cgpa && <div style={{ fontSize: '9pt', color: '#9ca3af' }}>CGPA: {edu.cgpa}</div>}
                  <div style={{ fontSize: '8.5pt', color: '#9ca3af', marginTop: '2px' }}>{edu.startYear}{edu.startYear && edu.endYear ? ' – ' : ''}{edu.endYear}</div>
                </div>
              ))}
            </div>
          )}

          {certificates.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {sectionTitle('Certifications')}
              <ul style={{ paddingLeft: '1.2em', listStyleType: 'disc', fontSize: '9.5pt', color: '#6b7280' }}>
                {certificates.map((cert, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{cert.name}</span>
                    {cert.issuer && <span> — {cert.issuer}</span>}
                    {cert.date && <span style={{ color: '#9ca3af' }}> ({cert.date})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {achievements.length > 0 && achievements.some(a => a && a.trim()) && (
            <div style={{ marginBottom: '20px' }}>
              {sectionTitle('Achievements')}
              <ul style={{ paddingLeft: '1.2em', listStyleType: 'disc', fontSize: '9.5pt', color: '#6b7280' }}>
                {achievements.filter(a => a && a.trim()).map((ach, i) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{ach}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          {skills.length > 0 && skills.some(s => s && s.trim()) && (
            <div style={{ marginBottom: '20px' }}>
              {sectionTitle('Core Competencies')}
              <ul style={{ paddingLeft: '1.2em', listStyleType: 'disc', fontSize: '9.5pt', color: '#6b7280', margin: 0 }}>
                {skills.filter(s => s && s.trim()).map((s, i) => {
                  const colonIdx = s.indexOf(':');
                  if (colonIdx > 0) {
                    const label = s.slice(0, colonIdx);
                    const rest  = s.slice(colonIdx);
                    return <li key={i} style={{ marginBottom: '2px' }}><span style={{ fontWeight: 600, color: '#374151' }}>{label}</span>{rest}</li>;
                  }
                  return <li key={i} style={{ marginBottom: '2px' }}>{s}</li>;
                })}
              </ul>
            </div>
          )}

          {projects.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {sectionTitle('Projects')}
              {projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 500, color: '#111827', display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                    {proj.projectName}
                    {proj.githubLink && <a href={proj.githubLink} style={{ fontSize: '8pt', color: '#6b7280' }}>[GitHub]</a>}
                    {proj.liveLink && <a href={proj.liveLink} style={{ fontSize: '8pt', color: '#6b7280' }}>[Live]</a>}
                  </div>
                  {proj.technologies && <div style={{ fontSize: '8.5pt', color: '#9ca3af', marginBottom: '2px' }}>{proj.technologies}</div>}
                  <BulletList items={proj.description} style={{ color: '#6b7280', fontSize: '9.5pt' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
