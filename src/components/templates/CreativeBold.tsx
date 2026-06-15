import React from 'react';
import { ResumeData } from '../../types';
import SkillLevelDisplay from '../ui/SkillLevelDisplay';
import { Github, Linkedin, Globe } from 'lucide-react';
import { formatGithub, formatLinkedin, formatPortfolio } from '../../utils/format';

interface TemplateProps {
  data: ResumeData;
}

export default function CreativeBold({ data }: TemplateProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;
  const sidebarBg = '#581c87'; // Deep purple
  const accentYellow = '#facc15'; // Accent yellow

  return (
    <div
      style={{
        fontFamily: '"Inter", sans-serif',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        width: '100%',
        minHeight: '100%',
        flex: 1,
        display: 'flex',
        boxSizing: 'border-box',
      }}
    >
      {/* Sidebar - left */}
      <div style={{ width: '32%', backgroundColor: sidebarBg, color: '#ffffff', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Profile Image if requested */}
        {meta.showPhoto && personal.photo && (
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentYellow}`, margin: '0 auto 10px auto', flexShrink: 0 }}>
            <img src={personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
        )}

        {/* Name and Professional Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            {personal.fullName || 'John Doe'}
          </h1>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: accentYellow, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0' }}>
            {personal.profession || 'Professional Title'}
          </p>
        </div>

        {/* Contact info */}
        <div>
          <h2 style={{ fontSize: '11px', fontWeight: '800', color: accentYellow, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #7c3aed', paddingBottom: '4px', marginBottom: '8px' }}>
            Contact
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#e2d5f1', wordBreak: 'break-word' }}>
            {personal.email && (
              <a href={`mailto:${personal.email}`} style={{ color: '#e2d5f1', textDecoration: 'none' }}>
                ✉ {personal.email}
              </a>
            )}
            {personal.phone && <div>☎ {personal.phone}</div>}
            {personal.location && <div>📍 {personal.location}</div>}
            {personal.linkedin && (() => {
              const link = formatLinkedin(personal.linkedin);
              return (
                <a href={link.href} target="_blank" rel="noreferrer" style={{ color: accentYellow, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Linkedin size={11} style={{ flexShrink: 0 }} />
                  <span>{link.displayText}</span>
                </a>
              );
            })()}
            {personal.github && (() => {
              const link = formatGithub(personal.github);
              return (
                <a href={link.href} target="_blank" rel="noreferrer" style={{ color: accentYellow, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Github size={11} style={{ flexShrink: 0 }} />
                  <span>{link.displayText}</span>
                </a>
              );
            })()}
            {personal.portfolio && (() => {
              const link = formatPortfolio(personal.portfolio);
              return (
                <a href={link.href} target="_blank" rel="noreferrer" style={{ color: accentYellow, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={11} style={{ flexShrink: 0 }} />
                  <span>{link.displayText}</span>
                </a>
              );
            })()}
          </div>
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: '800', color: accentYellow, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #7c3aed', paddingBottom: '4px', marginBottom: '8px' }}>
              Skills
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span>{skill.name}</span>
                  <SkillLevelDisplay level={skill.level} mode={meta.skillDisplayMode} accentColor={accentYellow} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: '800', color: accentYellow, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #7c3aed', paddingBottom: '4px', marginBottom: '8px' }}>
              Languages
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{lang.language}</span>
                  <span style={{ color: '#dbadef', fontSize: '10px' }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: '800', color: accentYellow, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #7c3aed', paddingBottom: '4px', marginBottom: '8px' }}>
              Certifications
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#e2d5f1' }}>
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{cert.name}</div>
                  <div style={{ color: '#dbadef', fontSize: '10px' }}>{cert.issuer} {cert.date && `(${cert.date})`}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests && interests.length > 0 && (
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: '800', color: accentYellow, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #7c3aed', paddingBottom: '4px', marginBottom: '8px' }}>
              Interests
            </h2>
            <p style={{ fontSize: '11.5px', color: '#dbadef', margin: '0' }}>
              {interests.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Main Bar (Creative Right) */}
      <div
        style={{
          flex: '1',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Profile Summary */}
        {summary.text && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: '950', color: sidebarBg, textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: `4px solid ${accentYellow}`, paddingLeft: '8px', marginBottom: '10px' }}>
              About Me
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0' }}>{summary.text}</p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: '950', color: sidebarBg, textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: `4px solid ${accentYellow}`, paddingLeft: '8px', marginBottom: '12px' }}>
              Work Experience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: sidebarBg }}>{exp.jobTitle}</span>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
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

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: '950', color: sidebarBg, textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: `4px solid ${accentYellow}`, paddingLeft: '8px', marginBottom: '12px' }}>
              Education
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>{edu.degree}</span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{edu.startYear} – {edu.endYear}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {edu.institution} {edu.gpa && `• GPA: ${edu.gpa}`}
                  </div>
                  {edu.achievements && (
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{edu.achievements}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: '950', color: sidebarBg, textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: `4px solid ${accentYellow}`, paddingLeft: '8px', marginBottom: '12px' }}>
              Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map((proj) => (
                <div key={proj.id} style={{ border: '1px solid #f1f5f9', padding: '10px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: sidebarBg }}>{proj.name}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '10px' }}>
                          Live Demo ↗
                        </a>
                      )}
                      {proj.sourceUrl && (
                        <a href={proj.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '10px' }}>
                          Source Code ↗
                        </a>
                      )}
                      <span style={{ fontSize: '9px', backgroundColor: sidebarBg, color: '#ffffff', padding: '2px 6px', borderRadius: '20px' }}>{proj.type}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 6px 0', lineHeight: '1.4' }}>{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {proj.techStack.map((tech) => (
                        <span key={tech} style={{ fontSize: '8px', border: `1px solid ${sidebarBg}`, padding: '1px 5px', borderRadius: '4px', color: sidebarBg, fontWeight: 'bold' }}>
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
    </div>
  );
}
