import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function ExecutiveTemplate({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;
  const primaryColor = '#374151'; // Charcoal
  const goldColor = '#d97706'; // Executive gold

  return (
    <div
      style={{
        fontFamily: '"Georgia", serif',
        color: '#1f2937',
        backgroundColor: '#ffffff',
        padding: '36px',
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        lineHeight: '1.45',
      }}
    >
      {/* Executive Header block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${goldColor}`, paddingBottom: '16px' }}>
        <div style={{ flex: '1', textAlign: 'left' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: primaryColor, margin: '0', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {personal.fullName || 'John Doe'}
          </h1>
          <p style={{ fontSize: '13px', color: goldColor, fontWeight: '600', textTransform: 'uppercase', margin: '4px 0 8px 0', letterSpacing: '0.1em' }}>
            {personal.profession || 'Professional Title'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '10px', color: '#4b5563', fontFamily: '"Inter", sans-serif' }}>
            {personal.email && (
              <a href={`mailto:${personal.email}`} style={{ color: '#4b5563', textDecoration: 'none' }}>
                ✉ {personal.email}
              </a>
            )}
            {personal.phone && <span>• ☎ {personal.phone}</span>}
            {personal.location && <span>• 📍 {personal.location}</span>}
            {personal.linkedin && (() => {
              const link = formatLinkedin(personal.linkedin);
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: goldColor, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: goldColor, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: goldColor, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={11} style={{ flexShrink: 0 }} />
                    <span>{link.displayText}</span>
                  </a>
                </span>
              );
            })()}
          </div>
        </div>
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: `2px solid ${goldColor}`, marginLeft: '16px', flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Summary */}
      {summary.text && (
        <div style={{ textAlign: 'center', margin: '0 auto', maxWidth: '90%' }}>
          <p style={{ fontSize: '12.5px', fontStyle: 'italic', color: '#374151', lineHeight: '1.6', margin: '0' }}>
            "{summary.text}"
          </p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: goldColor, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '10px' }}>
            Professional Background
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '12px', color: primaryColor }}>{exp.jobTitle}</span>
                  <span style={{ fontSize: '10px', color: '#4b5563', fontFamily: '"Inter", sans-serif' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: goldColor, marginBottom: '3px', fontWeight: '500' }}>
                  {exp.company} {exp.location && `• ${exp.location}`}
                </div>
                <p style={{ fontSize: '11px', color: '#374151', margin: '0', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Projects */}
      {projects && projects.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: goldColor, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '10px' }}>
            Key Projects & Product Builds
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '12px', color: primaryColor }}>{proj.name} ({proj.type})</span>
                  <div style={{ fontSize: '10px', display: 'flex', gap: '8px', fontFamily: '"Inter", sans-serif' }}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: goldColor, textDecoration: 'underline' }}>
                        Live Demo ↗
                      </a>
                    )}
                    {proj.sourceUrl && (
                      <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: goldColor, textDecoration: 'underline' }}>
                        Source Code ↗
                      </a>
                    )}
                  </div>
                </div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{ fontSize: '10px', color: goldColor, fontFamily: '"Inter", sans-serif', margin: '2px 0' }}>
                    Tech Stack: {proj.techStack.join(', ')}
                  </div>
                )}
                <p style={{ fontSize: '11px', color: '#374151', margin: '0', lineHeight: '1.5' }}>
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Education + Key Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Education column */}
        {education && education.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: goldColor, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '8px' }}>
              Academic Preparation
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', color: primaryColor }}>{edu.degree}</div>
                  <div style={{ color: '#4b5563' }}>{edu.institution} // {edu.startYear} - {edu.endYear}</div>
                  {edu.gpa && <div style={{ color: goldColor, fontSize: '10px' }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills column */}
        {skills && skills.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: goldColor, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '8px' }}>
              Core Capabilities
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: '"Inter", sans-serif' }}>
                  <span style={{ color: '#374151' }}>{skill.name}</span>
                  <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor={goldColor} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Certifications and Additional Details */}
      {certifications && certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: goldColor, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '8px' }}>
            Certifications & Affiliations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
            {certifications.map((cert) => (
              <div key={cert.id}>
                <span style={{ fontWeight: 'bold', color: primaryColor }}>{cert.name}</span> — <span style={{ color: '#4b5563' }}>{cert.issuer}</span> {cert.date && `• ${cert.date}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages & Interests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {languages && languages.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: goldColor, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '8px' }}>
              Languages Spoken
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: primaryColor }}>{lang.language}</span>
                  <span style={{ color: '#4b5563', textTransform: 'capitalize' }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interests && interests.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: goldColor, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '8px' }}>
              Personal Interests
            </h2>
            <p style={{ fontSize: '11px', color: '#374151', margin: '0' }}>
              {interests.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
