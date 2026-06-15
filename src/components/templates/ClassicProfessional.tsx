import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function ClassicProfessional({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;

  const fontStyle = {
    fontFamily: '"Georgia", "Times New Roman", serif',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    lineHeight: '1.4',
    padding: '40px',
    boxSizing: 'border-box' as const,
    width: '100%',
    minHeight: '100%',
  };

  const headerStyle = {
    textAlign: 'center' as const,
    borderBottom: '2px solid #1e3a5f',
    paddingBottom: '16px',
    marginBottom: '20px',
  };

  const nameStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1e3a5f',
    margin: '0 0 4px 0',
    letterSpacing: '-0.02em',
  };

  const titleStyle = {
    fontSize: '16px',
    fontStyle: 'italic',
    color: '#475569',
    margin: '0 0 12px 0',
  };

  const contactRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    gap: '12px',
    fontSize: '11px',
    color: '#64748b',
    fontFamily: '"Inter", sans-serif',
  };

  const sectionHeaderStyle = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#1e3a5f',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #cbd5e1',
    paddingBottom: '4px',
    marginTop: '20px',
    marginBottom: '10px',
  };

  const summaryStyle = {
    fontSize: '12px',
    color: '#334155',
    lineHeight: '1.6',
    marginBottom: '15px',
  };

  return (
    <div style={fontStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e3a5f', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ flex: '1', textAlign: 'left' }}>
          <h1 style={nameStyle}>{personal.fullName || 'John Doe'}</h1>
          <div style={titleStyle}>{personal.profession || 'Professional Title'}</div>
          <div style={{ ...contactRowStyle, justifyContent: 'flex-start' }}>
            {personal.email && <a href={`mailto:${personal.email}`} style={{ color: '#64748b', textDecoration: 'none' }}>✉ {personal.email}</a>}
            {personal.phone && <span>• ☎ {personal.phone}</span>}
            {personal.location && <span>• 📍 {personal.location}</span>}
            {personal.linkedin && (() => {
              const link = formatLinkedin(personal.linkedin);
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={11} style={{ flexShrink: 0 }} />
                    <span>{link.displayText}</span>
                  </a>
                </span>
              );
            })()}
          </div>
        </div>
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #1e3a5f', marginLeft: '16px', flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Summary */}
      {summary.text && (
        <div>
          <div style={sectionHeaderStyle}>Professional Summary</div>
          <p style={summaryStyle}>{summary.text}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div>
          <div style={sectionHeaderStyle}>Work Experience</div>
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', color: '#1e3a5f' }}>
                <span>{exp.jobTitle}</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', marginBottom: '4px', color: '#475569' }}>
                {exp.company} {exp.location && `• ${exp.location}`}
              </div>
              <p style={{ fontSize: '11px', color: '#334155', margin: '0', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div>
          <div style={sectionHeaderStyle}>Education</div>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', color: '#1e3a5f' }}>
                <span>{edu.degree}</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                  {edu.startYear} - {edu.current ? 'Present' : edu.endYear}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {edu.institution} {edu.location && `• ${edu.location}`} {edu.gpa && `• GPA: ${edu.gpa}`}
              </div>
              {edu.achievements && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {edu.achievements}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div>
          <div style={sectionHeaderStyle}>Key Projects</div>
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', color: '#1e3a5f' }}>
                <span>{proj.name} ({proj.type})</span>
                <div style={{ fontSize: '10px', display: 'flex', gap: '8px' }}>
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                      Live Demo ↗
                    </a>
                  )}
                  {proj.sourceUrl && (
                    <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                      Source Code ↗
                    </a>
                  )}
                </div>
              </div>
              {proj.techStack && proj.techStack.length > 0 && (
                <div style={{ fontSize: '10px', color: '#2563eb', fontFamily: '"Inter", sans-serif', marginTop: '1px', marginBottom: '3px' }}>
                  Tech Stack: {proj.techStack.join(', ')}
                </div>
              )}
              <p style={{ fontSize: '11px', color: '#334155', margin: '0', lineHeight: '1.5' }}>
                {proj.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <div style={sectionHeaderStyle}>Skills</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px', fontFamily: '"Inter", sans-serif' }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
                <span style={{ fontWeight: 500, color: '#334155' }}>
                  {skill.name} <span style={{ fontSize: '9px', color: '#64748b' }}>({skill.category})</span>
                </span>
                <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor="#1e3a5f" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid for Languages / Certifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <div style={sectionHeaderStyle}>Certifications</div>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ fontSize: '11px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: '#1e3a5f' }}>{cert.name}</span>
                <div style={{ color: '#64748b' }}>{cert.issuer} {cert.date && `• ${cert.date}`}</div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div>
            <div style={sectionHeaderStyle}>Languages</div>
            {languages.map((lang) => (
              <div key={lang.id} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>{lang.language}</span>
                <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interests */}
      {interests && interests.length > 0 && (
        <div>
          <div style={sectionHeaderStyle}>Interests</div>
          <p style={{ fontSize: '11px', color: '#475569', margin: '0', fontFamily: '"Inter", sans-serif' }}>
            {interests.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
