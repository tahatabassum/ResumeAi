import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function StartupFresh({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;
  const coralColor = '#f43f5e'; // Fresh hot coral/pink accent

  return (
    <div
      style={{
        fontFamily: '"Inter", sans-serif',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Header - Hero layout block */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '1' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0', letterSpacing: '-0.025em', color: '#ffffff' }}>
            {personal.fullName || 'John Doe'}
          </h1>
          <p style={{ fontSize: '13px', fontWeight: '700', color: coralColor, margin: '6px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {personal.profession || 'Professional Title'}
          </p>
        </div>
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', overflow: 'hidden', border: `3px solid ${coralColor}`, marginLeft: '16px', flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Main Body - Generous margins and modern whitespace */}
      <div style={{ padding: '30px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Contact links formatted as startup metadata badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {personal.email && (
            <a href={`mailto:${personal.email}`} style={{ textDecoration: 'none', fontSize: '10px', backgroundColor: '#fff1f2', color: coralColor, padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
              ✉ {personal.email}
            </a>
          )}
          {personal.phone && (
            <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px' }}>
              ☎ {personal.phone}
            </span>
          )}
          {personal.location && (
            <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px' }}>
              📍 {personal.location}
            </span>
          )}
          {personal.linkedin && (() => {
            const link = formatLinkedin(personal.linkedin);
            return (
              <a href={link.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Linkedin size={10} style={{ flexShrink: 0 }} />
                <span>{link.displayText}</span>
              </a>
            );
          })()}
          {personal.github && (() => {
            const link = formatGithub(personal.github);
            return (
              <a href={link.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', fontSize: '10px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Github size={10} style={{ flexShrink: 0 }} />
                <span>{link.displayText}</span>
              </a>
            );
          })()}
          {personal.portfolio && (() => {
            const link = formatPortfolio(personal.portfolio);
            return (
              <a href={link.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', fontSize: '10px', backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={10} style={{ flexShrink: 0 }} />
                <span>{link.displayText}</span>
              </a>
            );
          })()}
        </div>

        {/* Summary */}
        {summary.text && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Summary
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0' }}>{summary.text}</p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Journey Log
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>{exp.jobTitle}</span>
                    <span style={{ fontSize: '10px', color: coralColor, fontWeight: 'bold' }}>
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

        {/* Projects / Tech stacks */}
        {projects && projects.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Product Builds
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {projects.map((proj) => (
                <div key={proj.id} style={{ border: '2px solid #f1f5f9', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '800', fontSize: '11.5px', color: '#0f172a' }}>{proj.name}</span>
                    <span style={{ fontSize: '9px', backgroundColor: coralColor, color: '#ffffff', padding: '2px 6px', borderRadius: '20px' }}>{proj.type}</span>
                  </div>
                  <div style={{ fontSize: '10px', display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: coralColor, textDecoration: 'underline' }}>
                        Live ↗
                      </a>
                    )}
                    {proj.sourceUrl && (
                      <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: coralColor, textDecoration: 'underline' }}>
                        Code ↗
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '10.5px', color: '#475569', margin: '0 0 6px 0', lineHeight: '1.4' }}>{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {proj.techStack.map((tech) => (
                        <span key={tech} style={{ fontSize: '8px', backgroundColor: '#ffe4e6', color: coralColor, padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
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

        {/* Grid: Education + Skills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} style={{ fontSize: '11px', marginBottom: '6px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{edu.degree}</div>
                  <div style={{ color: '#64748b' }}>{edu.institution} ({edu.startYear}-{edu.endYear})</div>
                  {edu.gpa && <div style={{ color: coralColor, fontSize: '10px' }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Stack Skills
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {skills.map((skill) => (
                  <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ color: '#475569' }}>{skill.name}</span>
                    <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor={coralColor} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grid: Certifications + Languages */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Certifications
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
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
              <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Languages
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                {languages.map((lang) => (
                  <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#475569' }}>{lang.language}</span>
                    <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'capitalize' }}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interests */}
        {interests && interests.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: '800', color: coralColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Interests
            </h2>
            <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {interests.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
