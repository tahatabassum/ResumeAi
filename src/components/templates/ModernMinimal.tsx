import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function ModernMinimal({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;
  const accent = '#0d9488'; // Teal Accent

  return (
    <div
      style={{
        fontFamily: '"Inter", sans-serif',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        padding: '36px',
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${accent}`, paddingBottom: '16px' }}>
        <div style={{ flex: '1' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0', letterSpacing: '-0.025em' }}>
            {personal.fullName || 'John Doe'}
          </h1>
          <p style={{ fontSize: '14px', fontWeight: '600', color: accent, margin: '4px 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {personal.profession || 'Professional Title'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#64748b' }}>
            {personal.email && <a href={`mailto:${personal.email}`} style={{ color: '#64748b', textDecoration: 'none' }}>✉ {personal.email}</a>}
            {personal.phone && <span>• ☎ {personal.phone}</span>}
            {personal.location && <span>• 📍 {personal.location}</span>}
            {personal.linkedin && (() => {
              const link = formatLinkedin(personal.linkedin);
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Linkedin size={11} style={{ flexShrink: 0 }} />
                    <span>{link.displayText}</span>
                  </a>
                </span>
              );
            })()}
            {personal.github && (() => {
              const link = formatGithub(personal.github);
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Github size={11} style={{ flexShrink: 0 }} />
                    <span>{link.displayText}</span>
                  </a>
                </span>
              );
            })()}
            {personal.portfolio && (() => {
              const link = formatPortfolio(personal.portfolio);
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={11} style={{ flexShrink: 0 }} />
                    <span>{link.displayText}</span>
                  </a>
                </span>
              );
            })()}
          </div>
        </div>
        {/* Optional Base64 Photo */}
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '75px', height: '75px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${accent}`, marginLeft: '16px', flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Two-Column split */}
      <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: '24px', flex: '1' }}>
        {/* Left column (Main content) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {summary.text && (
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Profile Summary
              </h2>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0' }}>{summary.text}</p>
            </div>
          )}

          {experience && experience.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Professional Experience
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{exp.jobTitle}</span>
                      <span style={{ fontSize: '11px', color: accent, fontWeight: '500' }}>
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', margin: '0', whiteSpace: 'pre-line' }}>
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Key Projects
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{proj.name}</span>
                      <div style={{ fontSize: '10px', display: 'flex', gap: '8px' }}>
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline' }}>
                            Live Demo ↗
                          </a>
                        )}
                        {proj.sourceUrl && (
                          <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline' }}>
                            Source Code ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0 4px 0', lineHeight: '1.4' }}>
                      {proj.description}
                    </p>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {proj.techStack.map((tech) => (
                          <span key={tech} style={{ fontSize: '9px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column (Sidebar details) */}
        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Education
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {education.map((edu) => (
                  <div key={edu.id} style={{ fontSize: '11px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{edu.degree}</div>
                    <div style={{ color: '#475569' }}>{edu.institution}</div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>{edu.startYear} – {edu.endYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Skills
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {skills.map((skill) => (
                  <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ color: '#475569' }}>{skill.name}</span>
                    <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor={accent} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Certifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{cert.name}</div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>{cert.issuer} {cert.date && `• ${cert.date}`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Languages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                {languages.map((lang) => (
                  <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#475569' }}>{lang.language}</span>
                    <span style={{ color: '#64748b', fontSize: '10px' }}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Interests
              </h3>
              <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {interests.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
