import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function AcademicFormal({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;
  const darkGreen = '#064e3b'; // Forest academic green

  return (
    <div
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        color: '#0f172a',
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
      {/* Formal Header block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px double ${darkGreen}`, paddingBottom: '12px' }}>
        <div style={{ flex: '1', textAlign: 'left' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: darkGreen, margin: '0', letterSpacing: '0.02em' }}>
            {personal.fullName || 'John Doe'}
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', margin: '4px 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {personal.profession || 'Academic Scholar'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#334155', fontFamily: 'serif' }}>
            {personal.email && (
              <a href={`mailto:${personal.email}`} style={{ color: '#334155', textDecoration: 'none' }}>
                Email: {personal.email}
              </a>
            )}
            {personal.phone && <span>• Tel: {personal.phone}</span>}
            {personal.location && <span>• Location: {personal.location}</span>}
            {personal.linkedin && (() => {
              const link = formatLinkedin(personal.linkedin);
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: darkGreen, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: darkGreen, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: darkGreen, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={11} style={{ flexShrink: 0 }} />
                    <span>{link.displayText}</span>
                  </a>
                </span>
              );
            })()}
          </div>
        </div>
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '75px', height: '75px', borderRadius: '50%', overflow: 'hidden', border: `2px double ${darkGreen}`, marginLeft: '16px', flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Summary */}
      {summary.text && (
        <div style={{ marginBottom: '10px' }}>
          <p style={{ fontSize: '11.5px', color: '#1e293b', fontStyle: 'italic', margin: '0', textAlign: 'justify' }}>
            {summary.text}
          </p>
        </div>
      )}

      {/* Primary: Academic & Professional Postings */}
      {experience && experience.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: darkGreen, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '8px' }}>
            Professional Background
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11.5px' }}>
                  <span>{exp.jobTitle} — {exp.company}</span>
                  <span style={{ fontWeight: 'normal', fontStyle: 'italic', color: '#475569' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.location && <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', marginBottom: '2px' }}>{exp.location}</div>}
                <p style={{ fontSize: '11px', color: '#334155', margin: '0', textAlign: 'justify' }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research & Engineering Projects */}
      {projects && projects.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: darkGreen, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '8px' }}>
            Research & Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11.5px' }}>
                  <span>{proj.name} // <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '10.5px' }}>{proj.type}</span></span>
                  <div style={{ fontSize: '10px', display: 'flex', gap: '8px', fontWeight: 'normal' }}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: darkGreen, textDecoration: 'underline' }}>
                        Live Demo ↗
                      </a>
                    )}
                    {proj.sourceUrl && (
                      <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: darkGreen, textDecoration: 'underline' }}>
                        Source Code ↗
                      </a>
                    )}
                  </div>
                </div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{ fontSize: '10px', color: '#64748b', margin: '2px 0' }}>
                    Tech Stack: {proj.techStack.join(', ')}
                  </div>
                )}
                <p style={{ fontSize: '11px', color: '#334155', margin: '0', textAlign: 'justify' }}>
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education - Academic Section */}
      {education && education.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: darkGreen, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '8px' }}>
            Academic Credentials
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {education.map((edu) => (
              <div key={edu.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 'bold' }}>
                  <span>{edu.degree} // {edu.institution}</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 'normal', color: '#475569' }}>{edu.startYear} - {edu.endYear}</span>
                </div>
                {edu.location && <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>{edu.location}</div>}
                {edu.gpa && <div style={{ fontSize: '10.5px', color: darkGreen }}>Academics: GPA {edu.gpa}</div>}
                {edu.achievements && <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '2px' }}>{edu.achievements}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill List */}
      {skills && skills.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: darkGreen, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '8px' }}>
            Methods & Competencies
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '10.5px', fontFamily: '"Times New Roman", Times, serif' }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{skill.name}</span>
                <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor={darkGreen} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications / Certifications */}
      {certifications && certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: darkGreen, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '8px' }}>
            Certifications & Affiliations
          </h2>
          {certifications.map((cert) => (
            <div key={cert.id} style={{ fontSize: '11px', marginBottom: '4px' }}>
              • <span style={{ fontWeight: 'bold' }}>{cert.name}</span> — <span>{cert.issuer}</span> {cert.date && `(${cert.date})`}
            </div>
          ))}
        </div>
      )}

      {/* Grid: Languages + Interests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {languages && languages.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: darkGreen, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '8px' }}>
              Languages Spoken
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{lang.language}</span>
                  <span style={{ color: '#475569', textTransform: 'capitalize' }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interests && interests.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: darkGreen, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '8px' }}>
              Interests & Research Areas
            </h2>
            <p style={{ fontSize: '11px', color: '#334155', margin: '0' }}>
              {interests.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
