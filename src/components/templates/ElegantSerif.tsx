import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function ElegantSerif({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;
  const wineBurgundy = '#722f37';

  return (
    <div
      style={{
        fontFamily: '"Georgia", "Times New Roman", serif',
        color: '#2d2525',
        backgroundColor: '#ffffff',
        padding: '40px',
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        lineHeight: '1.4',
      }}
    >
      {/* Header section with classy border */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${wineBurgundy}`, paddingBottom: '14px' }}>
        <div style={{ flex: '1', textAlign: 'left' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: wineBurgundy, margin: '0', fontFamily: '"Playfair Display", "Georgia", serif', letterSpacing: '0.02em' }}>
            {personal.fullName || 'John Doe'}
          </h1>
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#6b5151', margin: '4px 0 10px 0' }}>
            {personal.profession || 'Professional Specialist'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', fontSize: '10.5px', color: '#5c4444', fontFamily: '"Inter", sans-serif', paddingTop: '6px' }}>
            {personal.email && (
              <a href={`mailto:${personal.email}`} style={{ color: '#5c4444', textDecoration: 'none' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: wineBurgundy, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: wineBurgundy, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: wineBurgundy, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={11} style={{ flexShrink: 0 }} />
                    <span>{link.displayText}</span>
                  </a>
                </span>
              );
            })()}
          </div>
        </div>
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '75px', height: '75px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${wineBurgundy}`, marginLeft: '16px', flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Summary with indentation statement */}
      {summary.text && (
        <div style={{ borderLeft: `2px solid ${wineBurgundy}`, paddingLeft: '12px', marginLeft: '12px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', margin: '0', fontStyle: 'italic', color: '#403030' }}>
            {summary.text}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: wineBurgundy, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Career Narrative
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold', fontSize: '11.5px' }}>
                  <span style={{ color: wineBurgundy }}>{exp.jobTitle}</span>
                  <span style={{ fontSize: '10px', color: '#6b5151', fontFamily: '"Inter", sans-serif', fontWeight: 'normal' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#5c4444', marginBottom: '3px' }}>
                  {exp.company} • {exp.location}
                </div>
                <p style={{ fontSize: '11px', color: '#3d2525', margin: '0', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
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
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: wineBurgundy, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Significant Creations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold', fontSize: '11.5px' }}>
                  <span style={{ color: wineBurgundy }}>{proj.name} ({proj.type})</span>
                  <div style={{ fontSize: '10px', display: 'flex', gap: '8px', fontFamily: '"Inter", sans-serif' }}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: wineBurgundy, textDecoration: 'underline' }}>
                        Live Demo ↗
                      </a>
                    )}
                    {proj.sourceUrl && (
                      <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: wineBurgundy, textDecoration: 'underline' }}>
                        Source Code ↗
                      </a>
                    )}
                  </div>
                </div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{ fontSize: '10px', color: '#6b5151', margin: '2px 0' }}>
                    Architecture: {proj.techStack.join(', ')}
                  </div>
                )}
                <p style={{ fontSize: '11px', color: '#3d2525', margin: '0', lineHeight: '1.5' }}>
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: wineBurgundy, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: wineBurgundy }}>{edu.degree}</span> • <span>{edu.institution}</span>
                {edu.gpa && <span style={{ color: '#6b5151', fontSize: '10px' }}> • GPA {edu.gpa}</span>}
              </div>
              <div style={{ fontSize: '10px', color: '#6b5151' }}>{edu.startYear} - {edu.endYear}</div>
            </div>
          ))}
        </div>
      )}

      {/* Work / Core Skills */}
      {skills && skills.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: wineBurgundy, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Expertise & Skills
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px', fontFamily: '"Inter", sans-serif' }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#2d1414' }}>{skill.name}</span>
                <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor={wineBurgundy} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: wineBurgundy, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Certifications & Credentials
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
            {certifications.map((cert) => (
              <div key={cert.id}>
                • <span style={{ fontWeight: 'bold', color: wineBurgundy }}>{cert.name}</span> — <span>{cert.issuer}</span> {cert.date && `(${cert.date})`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages and Interests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {languages && languages.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: wineBurgundy, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Languages
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: '#5c4444' }}>{lang.language}</span>
                  <span style={{ color: '#6b5151', fontSize: '10px', textTransform: 'capitalize' }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interests && interests.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: wineBurgundy, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Interests
            </h2>
            <p style={{ fontSize: '11px', color: '#5c4444', margin: '0' }}>
              {interests.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
