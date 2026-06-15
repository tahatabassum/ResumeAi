import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function TechDark({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;
  const neonGreen = '#4ade80';

  const terminalStyle = {
    fontFamily: '"Fira Code", "Courier New", Courier, monospace',
    color: '#cbd5e1',
    backgroundColor: '#1a1a2e',
    padding: '36px',
    boxSizing: 'border-box' as const,
    width: '100%',
    minHeight: '100%',
    flex: 1,
    fontSize: '11px',
    lineHeight: '1.5',
  };

  const hrStyle = {
    border: '0',
    borderTop: '1px dashed #334155',
    margin: '16px 0',
  };

  return (
    <div style={terminalStyle}>
      {/* Header terminal style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: '1' }}>
          <div style={{ color: neonGreen, fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.025em' }}>
            &gt;_ {personal.fullName || 'John Doe'}
          </div>
          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', textTransform: 'uppercase' }}>
            // {personal.profession || 'Software Engineer'}
          </div>
        </div>
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden', border: `1px solid ${neonGreen}`, flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      <hr style={hrStyle} />

      {/* Contact info terminal style */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '10px' }}>
        {personal.email && (
          <a href={`mailto:${personal.email}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
            email: "{personal.email}"
          </a>
        )}
        {personal.phone && <span>phone: "{personal.phone}"</span>}
        {personal.location && <span>location: "{personal.location}"</span>}
        {personal.linkedin && (() => {
          const link = formatLinkedin(personal.linkedin);
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Linkedin size={10} style={{ flexShrink: 0 }} />
              <a href={link.href} target="_blank" rel="noreferrer" style={{ color: neonGreen, textDecoration: 'underline' }}>
                linkedin: "{link.displayText}"
              </a>
            </span>
          );
        })()}
        {personal.github && (() => {
          const link = formatGithub(personal.github);
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Github size={10} style={{ flexShrink: 0 }} />
              <a href={link.href} target="_blank" rel="noreferrer" style={{ color: neonGreen, textDecoration: 'underline' }}>
                github: "{link.displayText}"
              </a>
            </span>
          );
        })()}
        {personal.portfolio && (() => {
          const link = formatPortfolio(personal.portfolio);
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={10} style={{ flexShrink: 0 }} />
              <a href={link.href} target="_blank" rel="noreferrer" style={{ color: neonGreen, textDecoration: 'underline' }}>
                portfolio: "{link.displayText}"
              </a>
            </span>
          );
        })()}
      </div>

      <hr style={hrStyle} />

      {/* Summary */}
      {summary.text && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '4px' }}>&gt;_ SUMMARY</div>
          <p style={{ margin: '0', color: '#94a3b8' }}>{summary.text}</p>
        </div>
      )}

      {/* Work / Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '8px' }}>&gt;_ RECENT_EXPERIENCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ borderLeft: `1px solid ${neonGreen}`, paddingLeft: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span style={{ color: '#ffffff' }}>[{exp.jobTitle.toUpperCase().replace(/\s+/g, '_')}]</span>
                  <span style={{ color: neonGreen }}>{exp.startDate} - {exp.current ? 'PRESENT' : exp.endDate.toUpperCase()}</span>
                </div>
                <div style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '10px' }}>
                  {exp.company} {exp.location && `// ${exp.location}`}
                </div>
                <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '8px' }}>&gt;_ OUTPUT_PROJECTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ border: '1px solid #334155', padding: '8px', borderRadius: '4px', backgroundColor: '#0f172a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{proj.name}</span>
                  <div style={{ fontSize: '9px', display: 'flex', gap: '6px' }}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: neonGreen, textDecoration: 'underline' }}>
                        Demo
                      </a>
                    )}
                    {proj.sourceUrl && (
                      <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: neonGreen, textDecoration: 'underline' }}>
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '9px', color: neonGreen, margin: '2px 0' }}>stack: {proj.techStack.join(' | ')}</div>
                <p style={{ margin: '0', fontSize: '10px', color: '#94a3b8' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '8px' }}>&gt;_ LIBS_AND_SDK_SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', padding: '2px 6px', borderRadius: '4px' }}>
                <span style={{ color: '#ffffff' }}>&lt;{skill.name} /&gt;</span>
                <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor={neonGreen} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '6px' }}>&gt;_ EDUCATION_LOGS</div>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '6px', fontSize: '10px' }}>
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{edu.degree}</span> @ {edu.institution} ({edu.startYear}-{edu.endYear})
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '6px' }}>&gt;_ CERTIFICATIONS</div>
          {certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: '4px', fontSize: '10px' }}>
              • <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{cert.name}</span> // {cert.issuer} {cert.date && `(${cert.date})`}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '6px' }}>&gt;_ LANGUAGES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '10px' }}>
            {languages.map((lang) => (
              <span key={lang.id}>
                {lang.language}: "{lang.proficiency.toUpperCase()}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {interests && interests.length > 0 && (
        <div>
          <div style={{ color: neonGreen, fontWeight: 'bold', marginBottom: '6px' }}>&gt;_ SYSTEM_INTERESTS</div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>
            [{interests.join(', ')}]
          </div>
        </div>
      )}
    </div>
  );
}
