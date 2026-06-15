import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, ExternalHyperlink, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.SECRET_KEY || 'resumeai_secret_super_secure';

// Database Path and Helper - kept at workspace root process.cwd() for durable persistence
const DB_PATH = path.join(process.cwd(), 'server_db.json');

interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

interface ResumeRecord {
  id: string;
  userId: string;
  name: string;
  data: any;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

interface DbSchema {
  users: UserRecord[];
  resumes: ResumeRecord[];
}

function loadDb(): DbSchema {
  if (!fs.existsSync(DB_PATH)) {
    const initDb: DbSchema = { users: [], resumes: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initDb, null, 2));
    return initDb;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], resumes: [] };
  }
}

function saveDb(db: DbSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Password Hash helper
function hashPassword(password: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(password).digest('hex');
}

// Lazy load Gemini AI to prevent startup crashes when key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

app.use(express.json({ limit: '10mb' }));

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Auth token missing' });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

// --- AUTH API ROUTES ---

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Parameters missing' });
  }

  const db = loadDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);
  const newUser: UserRecord = { id, email, name, passwordHash };

  db.users.push(newUser);
  saveDb(db);

  const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, email, name } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = loadDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// --- RESUMES API ROUTES ---

app.get('/api/resumes', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const userResumes = db.resumes
    .filter((r) => r.userId === req.user.id)
    .map((r) => ({
      id: r.id,
      name: r.name,
      templateId: r.templateId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  res.json({ resumes: userResumes });
});

app.post('/api/resumes', authenticateToken, (req: any, res) => {
  const { name, data } = req.body;
  const db = loadDb();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const newResume: ResumeRecord = {
    id,
    userId: req.user.id,
    name: name || 'Untitled Resume',
    data: data || {},
    templateId: data?.meta?.templateId || 'modern-sidebar',
    createdAt: now,
    updatedAt: now,
  };

  db.resumes.push(newResume);
  saveDb(db);

  res.json({ resume: newResume });
});

app.get('/api/resumes/:id', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const resume = db.resumes.find((r) => r.id === req.params.id && r.userId === req.user.id);

  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  res.json({ resume });
});

app.put('/api/resumes/:id', authenticateToken, (req: any, res) => {
  const { name, data } = req.body;
  const db = loadDb();
  const index = db.resumes.findIndex((r) => r.id === req.params.id && r.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  const existing = db.resumes[index];
  const now = new Date().toISOString();

  db.resumes[index] = {
    ...existing,
    name: name || existing.name,
    data: data || existing.data,
    templateId: data?.meta?.templateId || existing.templateId,
    updatedAt: now,
  };

  saveDb(db);
  res.json({ resume: db.resumes[index] });
});

app.delete('/api/resumes/:id', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const index = db.resumes.findIndex((r) => r.id === req.params.id && r.userId === req.user.id);

  if (index === -1) {
    return res.status(4404).json({ error: 'Resume not found' });
  }

  db.resumes.splice(index, 1);
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/resumes/:id/duplicate', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const original = db.resumes.find((r) => r.id === req.params.id && r.userId === req.user.id);

  if (!original) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const duplicated: ResumeRecord = {
    id,
    userId: req.user.id,
    name: `${original.name} Copy`,
    data: {
      ...original.data,
      meta: {
        ...original.data.meta,
        id,
        name: `${original.name} Copy`,
      },
    },
    templateId: original.templateId,
    createdAt: now,
    updatedAt: now,
  };

  db.resumes.push(duplicated);
  saveDb(db);

  res.json({ resume: duplicated });
});

// --- AI FEATURE ROTUES ---

app.post('/api/ai/generate-summary', async (req, res) => {
  const { name, profession, skills, experience, tone } = req.body;
  if (!name || !profession) {
    return res.status(400).json({ error: 'Name and profession are required.' });
  }

  try {
    const ai = getAI();
    const skillsList = skills && skills.length > 0 ? skills.join(', ') : 'General skill set';
    const parsedExp = experience && experience.length > 0 
      ? experience.map((e: any) => `${e.jobTitle} at ${e.company}`).join(', ') 
      : 'various roles';

    const prompt = `Write a professional resume summary for ${name}, a ${profession}.
Skills: ${skillsList}. Experience: ${parsedExp}.
Tone: ${tone || 'professional'}. Length: exactly 3 sentences.
Start with a strong opening line. Do not use first person (no "I"). Return only the summary text, no extra commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    res.json({ summary: text });
  } catch (err: any) {
    console.error('Error generating summary:', err.message);
    res.status(500).json({ error: 'Could not generate summary, check API key or prompt config.' });
  }
});

app.post('/api/ai/improve-bullets', async (req, res) => {
  const { job_title, company, raw_description } = req.body;
  if (!job_title || !raw_description) {
    return res.status(400).json({ error: 'Job title and description are required.' });
  }

  try {
    const ai = getAI();
    const prompt = `You are a professional resume writer. Convert this job description into 4-5 strong, impact-driven bullet points.
Job Title: ${job_title} at ${company || 'Confidential'}
Raw description: ${raw_description}

Rules:
- Start each bullet with a strong action verb (e.g. Developed, Led, Architected, Implemented, Designed, Optimized)
- Include measurable impact where possible (%, time saved, users impacted)
- Be concise, max 15 words per bullet
- No filler words
Return ONLY a valid JSON stringified array of strings like: ["Bullet 1", "Bullet 2", ...]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsedArr = JSON.parse(response.text?.trim() || '[]');
      res.json({ bullets: parsedArr });
    } catch {
      // Fallback line split if JSON parsing failed
      const lines = (response.text || '')
        .split('\n')
        .map((l) => l.replace(/^[-*•\s\d.]*/, '').trim())
        .filter(Boolean);
      res.json({ bullets: lines });
    }
  } catch (err: any) {
    console.error('Error improving bullets:', err.message);
    res.status(500).json({ error: 'Could not generate improved bullets.' });
  }
});

app.post('/api/ai/improve-project', async (req, res) => {
  const { project_name, tech_stack, raw_description } = req.body;
  if (!project_name || !raw_description) {
    return res.status(400).json({ error: 'Project name and raw description are required.' });
  }

  try {
    const ai = getAI();
    const techStr = tech_stack && tech_stack.length > 0 ? tech_stack.join(', ') : 'Modern technology';

    const prompt = `Improve this project description for a resume. Project: ${project_name}. Tech: ${techStr}.
Raw: ${raw_description}
Return a polished 3-line description that explains what it does, what problem it solves, and what tech was used.
No bullet points. Plain paragraph. Max 60 words. Return only the description text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ description: response.text?.trim() });
  } catch (err: any) {
    console.error('Error improving project description:', err.message);
    res.status(500).json({ error: 'Could not improve project description.' });
  }
});



app.post('/api/ai/skill-suggestions', async (req, res) => {
  const { current_skills, profession } = req.body;
  if (!profession) {
    return res.status(400).json({ error: 'Profession is required.' });
  }

  try {
    const ai = getAI();
    const skillsList = current_skills && current_skills.length > 0 ? current_skills.join(', ') : 'None yet';

    const prompt = `Given a ${profession} with these current skills: ${skillsList}, suggest 8 additional relevant skills they should add to their resume. Return ONLY a valid JSON string array of skill name strings, like: ["React", "TypeScript", ...]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const suggestions = JSON.parse(response.text?.trim() || '[]');
    res.json({ suggestions });
  } catch (err: any) {
    console.error('Error suggesting skills:', err.message);
    res.status(500).json({ error: 'Could not fetch skill suggestions.' });
  }
});

// --- DOCX EXPORT ENDPOINT ---
app.post('/api/export/docx', (req, res) => {
  const data = req.body;
  if (!data || !data.personal) {
    return res.status(400).json({ error: 'Invalid resume data object' });
  }

  try {
    const { personal, summary, experience, education, skills, projects, certifications, languages, interests, meta } = data;

    // Create DOCX document representation
    const docChildren: any[] = [];

    // Extract template ID and set layout parameters
    const templateId = meta?.templateId || 'modern-sidebar';

    const serifTemplates = ['classic-professional', 'elegant-serif', 'executive', 'academic-formal'];
    const docFont = templateId === 'tech-dark' ? 'Courier New' : (serifTemplates.includes(templateId) ? 'Georgia' : 'Arial');

    // Shading/accent colors (ensure valid HEX without #)
    let primaryColorHex = '0284c7';
    let textColorHex = '1e293b';
    let headingColorHex = '0f172a';
    let docBgHex = 'ffffff';
    let isDarkMode = false;
    let isDoubleBorder = false;

    if (templateId === 'classic-professional') {
      primaryColorHex = '1e3a5f';
      textColorHex = '0f172a';
      headingColorHex = '1e3a5f';
    } else if (templateId === 'modern-sidebar') {
      primaryColorHex = '0d9488';
      textColorHex = '1e293b';
      headingColorHex = '0f172a';
    } else if (templateId === 'creative-bold') {
      primaryColorHex = '581c87';
      textColorHex = '1e293b';
      headingColorHex = '581c87';
    } else if (templateId === 'tech-dark') {
      primaryColorHex = '4ade80';
      textColorHex = 'cbd5e1';
      headingColorHex = '4ade80';
      docBgHex = '1a1a2e';
      isDarkMode = true;
    } else if (templateId === 'executive') {
      primaryColorHex = 'd97706'; // Gold
      textColorHex = '1f2937';    // Charcoal text
      headingColorHex = '374151'; // Charcoal headings
    } else if (templateId === 'elegant-serif') {
      primaryColorHex = '7f1d1d'; // Burgundy
      textColorHex = '0f172a';
      headingColorHex = '7f1d1d';
    } else if (templateId === 'startup-fresh') {
      primaryColorHex = 'f43f5e'; // Coral
      textColorHex = '1e293b';
      headingColorHex = 'f43f5e';
    } else if (templateId === 'academic-formal') {
      primaryColorHex = '064e3b'; // Academic Green
      textColorHex = '0f172a';
      headingColorHex = '064e3b';
      isDoubleBorder = true;
    }

    // Borderless tables style helpers
    const borderlessStyle = { style: BorderStyle.NONE, size: 0, color: 'auto' };
    const borderlessBorders = {
      top: borderlessStyle,
      bottom: borderlessStyle,
      left: borderlessStyle,
      right: borderlessStyle,
      insideHorizontal: borderlessStyle,
      insideVertical: borderlessStyle,
    };
    const cellBorderless = {
      borders: {
        top: borderlessStyle,
        bottom: borderlessStyle,
        left: borderlessStyle,
        right: borderlessStyle,
      }
    };

    // Parse photo buffer if uploaded
    let photoBuffer: Buffer | null = null;
    let photoType: 'jpg' | 'png' | 'gif' | 'bmp' = 'png';
    if (meta?.showPhoto && personal.photo && personal.photo.startsWith('data:image')) {
      try {
        const matches = personal.photo.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1].toLowerCase();
          if (ext === 'jpeg' || ext === 'jpg') {
            photoType = 'jpg';
          } else if (ext === 'gif') {
            photoType = 'gif';
          } else if (ext === 'bmp') {
            photoType = 'bmp';
          } else {
            photoType = 'png';
          }
          photoBuffer = Buffer.from(matches[2], 'base64');
        }
      } catch (err: any) {
        console.error('Error parsing photo for DOCX:', err.message);
      }
    }

    // Link helper
    const createLinkRun = (text: string, url: string, color: string = '0284c7') => {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      return new ExternalHyperlink({
        children: [
          new TextRun({
            text,
            color,
            underline: {},
            font: docFont,
            size: 18,
          })
        ],
        link: cleanUrl,
      });
    };

    // Helper to create Section Headings matching template rules
    const createSectionHeading = (title: string, sidebarContext = false): Paragraph => {
      let headingText = title.toUpperCase();
      if (templateId === 'tech-dark') {
        headingText = `>_ ${title.toUpperCase().replace(/\s+/g, '_')}`;
      }

      // Sidebar sections color override for creative-bold
      let textRunColor = headingColorHex;
      if (templateId === 'creative-bold' && sidebarContext) {
        textRunColor = 'facc15'; // yellow accent
      }

      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: headingText,
            bold: true,
            color: textRunColor,
            font: docFont,
            size: 22,
          }),
        ],
        border: templateId === 'tech-dark' ? undefined : {
          bottom: {
            color: templateId === 'creative-bold' && sidebarContext ? 'facc15' : primaryColorHex,
            space: 6,
            style: isDoubleBorder ? BorderStyle.DOUBLE : BorderStyle.SINGLE,
            size: isDoubleBorder ? 18 : 12,
          },
        },
        spacing: { before: 180, after: 80 },
      });
    };

    // Dashed line for tech-dark separators
    const createDashedSeparator = () => {
      return new Paragraph({
        children: [
          new TextRun({
            text: '--------------------------------------------------------------------------------',
            color: primaryColorHex,
            font: 'Courier New',
            size: 16,
          })
        ],
        spacing: { before: 120, after: 120 },
      });
    };

    // Helper to append bullet list description formatting
    const appendDescriptionLines = (container: any[], descriptionText: string) => {
      if (!descriptionText) return;
      const descLines = descriptionText.split('\n').filter((l: string) => l.trim().length > 0);
      descLines.forEach((line: string) => {
        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•');
        let cleanLine = line.replace(/^[-*•\s\d.]*/, '').trim();
        if (templateId === 'tech-dark') {
          cleanLine = `> ${cleanLine}`;
        }

        if (isBullet) {
          container.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanLine,
                  font: docFont,
                  size: 19,
                  color: textColorHex,
                })
              ],
              bullet: templateId === 'tech-dark' ? undefined : { level: 0 },
              spacing: { before: 20, after: 40 },
            })
          );
        } else {
          container.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: docFont,
                  size: 19,
                  color: textColorHex,
                })
              ],
              spacing: { before: 20, after: 60 },
            })
          );
        }
      });
    };

    // Helper to append standard main content sections
    const appendMainContent = (container: any[]) => {
      // 1. Summary
      if (summary && summary.text) {
        container.push(createSectionHeading('Professional Summary'));
        container.push(
          new Paragraph({
            children: [
              new TextRun({
                text: summary.text,
                font: docFont,
                size: 20,
                color: textColorHex,
              })
            ],
            spacing: { after: 120 },
          })
        );
      }

      // 2. Experience
      if (experience && experience.length > 0) {
        container.push(createSectionHeading('Work Experience'));
        experience.forEach((exp: any) => {
          const expRow = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderlessBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: exp.jobTitle, bold: true, size: 20, font: docFont, color: headingColorHex }),
                          new TextRun({ text: `  •  ${exp.company}`, bold: true, size: 20, font: docFont, color: '475569' }),
                          exp.location ? new TextRun({ text: `  •  ${exp.location}`, italics: true, size: 18, font: docFont, color: '64748b' }) : new TextRun({ text: '' }),
                        ]
                      })
                    ],
                    ...cellBorderless,
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`,
                            bold: true,
                            color: primaryColorHex,
                            size: 18,
                            font: docFont,
                          })
                        ]
                      })
                    ],
                    ...cellBorderless,
                  })
                ]
              })
            ]
          });
          container.push(expRow);
          appendDescriptionLines(container, exp.description);
          container.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      // 3. Projects
      if (projects && projects.length > 0) {
        container.push(createSectionHeading('Projects'));
        projects.forEach((proj: any) => {
          const projectLinks: any[] = [];
          if (proj.liveUrl) {
            projectLinks.push(createLinkRun('Live Demo ↗', proj.liveUrl, primaryColorHex));
          }
          if (proj.sourceUrl) {
            if (projectLinks.length > 0) projectLinks.push(new TextRun({ text: '  |  ', color: '94a3b8', font: docFont, size: 18 }));
            projectLinks.push(createLinkRun('Source Code ↗', proj.sourceUrl, '4f46e5'));
          }

          const projRow = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderlessBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: proj.name, bold: true, size: 20, font: docFont, color: headingColorHex }),
                          new TextRun({ text: `  (${proj.type || 'Personal'})`, italics: true, size: 18, font: docFont, color: '64748b' }),
                        ]
                      })
                    ],
                    ...cellBorderless,
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: projectLinks.length > 0 ? projectLinks : [new TextRun({ text: '' })],
                      })
                    ],
                    ...cellBorderless,
                  })
                ]
              })
            ]
          });
          container.push(projRow);

          if (proj.techStack && proj.techStack.length > 0) {
            container.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Tech Stack: ', bold: true, size: 18, font: docFont, color: '475569' }),
                  new TextRun({ text: proj.techStack.join(', '), italics: true, size: 18, font: docFont, color: '64748b' }),
                ],
                spacing: { before: 20, after: 40 },
              })
            );
          }

          appendDescriptionLines(container, proj.description);
          container.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      // 4. Education
      if (education && education.length > 0) {
        container.push(createSectionHeading('Education'));
        education.forEach((edu: any) => {
          const eduRow = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderlessBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: edu.degree, bold: true, size: 20, font: docFont, color: headingColorHex }),
                          new TextRun({ text: `  •  ${edu.institution}`, bold: true, size: 20, font: docFont, color: '475569' }),
                          edu.location ? new TextRun({ text: `  •  ${edu.location}`, italics: true, size: 18, font: docFont, color: '64748b' }) : new TextRun({ text: '' }),
                        ]
                      })
                    ],
                    ...cellBorderless,
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `${edu.startYear} – ${edu.endYear}`,
                            bold: true,
                            color: '475569',
                            size: 18,
                            font: docFont,
                          })
                        ]
                      })
                    ],
                    ...cellBorderless,
                  })
                ]
              })
            ]
          });
          container.push(eduRow);

          if (edu.gpa) {
            container.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'GPA/Academics: ', bold: true, size: 18, font: docFont, color: '475569' }),
                  new TextRun({ text: edu.gpa, size: 18, font: docFont, color: textColorHex }),
                ],
                spacing: { before: 20, after: 40 },
              })
            );
          }
          if (edu.achievements) {
            container.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Key Achievements: ', bold: true, font: docFont, size: 18, color: '475569' }),
                  new TextRun({ text: edu.achievements, size: 18, font: docFont, color: textColorHex }),
                ],
                spacing: { before: 20, after: 60 },
              })
            );
          }
          container.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      // 5. Certifications (Only if NO sidebar templates, else they go to the sidebar)
      const hasSidebar = ['modern-sidebar', 'creative-bold'].includes(templateId);
      if (!hasSidebar && certifications && certifications.length > 0) {
        container.push(createSectionHeading('Certifications'));
        certifications.forEach((cert: any) => {
          const certChildren: any[] = [
            new TextRun({ text: cert.name, bold: true, font: docFont, size: 20, color: headingColorHex }),
            new TextRun({ text: ` — ${cert.issuer}`, font: docFont, size: 20, color: '475569' }),
          ];
          if (cert.date) {
            certChildren.push(new TextRun({ text: ` (${cert.date})`, italics: true, font: docFont, size: 18, color: '64748b' }));
          }

          if (cert.url) {
            certChildren.push(new TextRun({ text: '  •  ', color: '94a3b8' }));
            certChildren.push(createLinkRun('View Certificate ↗', cert.url, primaryColorHex));
          }
          container.push(
            new Paragraph({
              children: certChildren,
              spacing: { after: 60 },
            })
          );
        });
      }
    };

    // ==========================================
    // 1. MODERN SIDEBAR (MODERN MINIMAL) LAYOUT
    // ==========================================
    if (templateId === 'modern-sidebar') {
      const headerLeftElements: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: personal.fullName || 'John Doe', bold: true, size: 32, color: primaryColorHex, font: docFont })],
          spacing: { after: 40 },
        })
      ];
      if (personal.profession) {
        headerLeftElements.push(
          new Paragraph({
            children: [new TextRun({ text: personal.profession.toUpperCase(), bold: true, size: 20, color: '64748b', font: docFont })],
            spacing: { after: 80 },
          })
        );
      }

      const contactRuns: any[] = [];
      if (personal.email) contactRuns.push(createLinkRun(personal.email, `mailto:${personal.email}`, primaryColorHex));
      if (personal.phone) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(new TextRun({ text: personal.phone, color: '475569', font: docFont, size: 18 }));
      }
      if (personal.location) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(new TextRun({ text: personal.location, color: '475569', font: docFont, size: 18 }));
      }
      if (personal.linkedin) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun('LinkedIn', personal.linkedin, primaryColorHex));
      }
      if (personal.github) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun('GitHub', personal.github, '4f46e5'));
      }
      if (personal.portfolio) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun('Portfolio', personal.portfolio, '059669'));
      }
      if (contactRuns.length > 0) {
        headerLeftElements.push(new Paragraph({ children: contactRuns, spacing: { after: 120 } }));
      }

      if (photoBuffer) {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderlessBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 80, type: WidthType.PERCENTAGE },
                    children: headerLeftElements,
                    ...cellBorderless,
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new ImageRun({
                            data: photoBuffer,
                            type: photoType,
                            transformation: { width: 75, height: 75 },
                          })
                        ]
                      })
                    ],
                    ...cellBorderless,
                  })
                ]
              })
            ]
          })
        );
      } else {
        docChildren.push(...headerLeftElements);
      }

      docChildren.push(
        new Paragraph({
          border: {
            bottom: { color: primaryColorHex, space: 8, style: BorderStyle.SINGLE, size: 18 }
          },
          spacing: { after: 180 }
        })
      );

      const leftColChildren: any[] = [];
      const rightColChildren: any[] = [];

      if (summary && summary.text) {
        leftColChildren.push(createSectionHeading('Profile Summary'));
        leftColChildren.push(
          new Paragraph({
            children: [new TextRun({ text: summary.text, font: docFont, size: 20, color: textColorHex })],
            spacing: { after: 120 }
          })
        );
      }

      if (experience && experience.length > 0) {
        leftColChildren.push(createSectionHeading('Professional Experience'));
        experience.forEach((exp: any) => {
          leftColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.jobTitle, bold: true, size: 20, font: docFont, color: headingColorHex }),
                new TextRun({ text: `  •  ${exp.company}`, bold: true, size: 20, font: docFont, color: '475569' }),
              ]
            })
          );
          leftColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`, bold: true, color: primaryColorHex, size: 18, font: docFont }),
                exp.location ? new TextRun({ text: `  |  ${exp.location}`, italics: true, size: 18, font: docFont, color: '64748b' }) : new TextRun({ text: '' }),
              ]
            })
          );
          appendDescriptionLines(leftColChildren, exp.description);
          leftColChildren.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      if (projects && projects.length > 0) {
        leftColChildren.push(createSectionHeading('Key Projects'));
        projects.forEach((proj: any) => {
          leftColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: proj.name, bold: true, size: 20, font: docFont, color: headingColorHex }),
                new TextRun({ text: `  (${proj.type || 'Personal'})`, italics: true, size: 18, font: docFont, color: '64748b' }),
              ]
            })
          );
          const links: any[] = [];
          if (proj.liveUrl) links.push(createLinkRun('Live Demo ↗', proj.liveUrl, primaryColorHex));
          if (proj.sourceUrl) {
            if (links.length > 0) links.push(new TextRun({ text: '  |  ', color: '94a3b8', size: 18 }));
            links.push(createLinkRun('Source Code ↗', proj.sourceUrl, '4f46e5'));
          }
          if (links.length > 0) {
            leftColChildren.push(new Paragraph({ children: links }));
          }
          if (proj.techStack && proj.techStack.length > 0) {
            leftColChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Tech Stack: ', bold: true, size: 18, font: docFont, color: '475569' }),
                  new TextRun({ text: proj.techStack.join(', '), italics: true, size: 18, font: docFont, color: '64748b' }),
                ],
                spacing: { before: 20, after: 40 },
              })
            );
          }
          appendDescriptionLines(leftColChildren, proj.description);
          leftColChildren.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      if (education && education.length > 0) {
        rightColChildren.push(createSectionHeading('Education', true));
        education.forEach((edu: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [new TextRun({ text: edu.degree, bold: true, size: 20, font: docFont, color: headingColorHex })]
            })
          );
          rightColChildren.push(
            new Paragraph({
              children: [new TextRun({ text: edu.institution, size: 18, font: docFont, color: '475569' })]
            })
          );
          rightColChildren.push(
            new Paragraph({
              children: [new TextRun({ text: `${edu.startYear} – ${edu.endYear}`, size: 18, font: docFont, color: '64748b' })],
              spacing: { after: 80 }
            })
          );
        });
      }

      if (skills && skills.length > 0) {
        rightColChildren.push(createSectionHeading('Skills', true));
        skills.forEach((sk: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: sk.name, bold: true, size: 18, font: docFont, color: '475569' }),
                new TextRun({ text: ` (${sk.level || 'Intermediate'})`, size: 16, font: docFont, color: '64748b' }),
              ],
              spacing: { after: 40 }
            })
          );
        });
      }

      if (certifications && certifications.length > 0) {
        rightColChildren.push(createSectionHeading('Certifications', true));
        certifications.forEach((cert: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [new TextRun({ text: cert.name, bold: true, size: 18, font: docFont, color: headingColorHex })]
            })
          );
          const certDetails = [
            new TextRun({ text: cert.issuer, size: 16, font: docFont, color: '64748b' })
          ];
          if (cert.date) certDetails.push(new TextRun({ text: `  (${cert.date})`, size: 16, font: docFont, color: '64748b' }));
          rightColChildren.push(new Paragraph({ children: certDetails }));
          if (cert.url) {
            rightColChildren.push(new Paragraph({ children: [createLinkRun('View Certificate ↗', cert.url, primaryColorHex)] }));
          }
          rightColChildren.push(new Paragraph({ text: '', spacing: { after: 40 } }));
        });
      }

      if (languages && languages.length > 0) {
        rightColChildren.push(createSectionHeading('Languages', true));
        languages.forEach((lang: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: lang.language, bold: true, size: 18, font: docFont, color: '475569' }),
                new TextRun({ text: ` (${lang.proficiency || 'Native'})`, size: 16, font: docFont, color: '64748b' }),
              ],
              spacing: { after: 40 }
            })
          );
        });
      }

      if (interests && interests.length > 0) {
        rightColChildren.push(createSectionHeading('Interests', true));
        rightColChildren.push(
          new Paragraph({
            children: [new TextRun({ text: interests.join(', '), font: docFont, size: 18, color: '475569' })]
          })
        );
      }

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: borderlessBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 68, type: WidthType.PERCENTAGE },
                  margins: { top: 180, bottom: 180, left: 120, right: 240 },
                  children: leftColChildren,
                  ...cellBorderless,
                }),
                new TableCell({
                  width: { size: 32, type: WidthType.PERCENTAGE },
                  borders: {
                    top: borderlessStyle,
                    bottom: borderlessStyle,
                    right: borderlessStyle,
                    left: { style: BorderStyle.SINGLE, size: 12, color: 'e2e8f0' },
                  },
                  margins: { top: 180, bottom: 180, left: 240, right: 120 },
                  children: rightColChildren,
                })
              ]
            })
          ]
        })
      );
    }
    // ==========================================
    // 2. CREATIVE BOLD LAYOUT
    // ==========================================
    else if (templateId === 'creative-bold') {
      const leftColChildren: any[] = [];
      const rightColChildren: any[] = [];
      const headingYellow = 'facc15';

      if (photoBuffer) {
        leftColChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: photoBuffer,
                type: photoType,
                transformation: { width: 75, height: 75 },
              })
            ],
            spacing: { after: 120 },
          })
        );
      }

      leftColChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: personal.fullName || 'John Doe',
              bold: true,
              size: 26,
              color: headingYellow,
              font: docFont,
            })
          ],
          spacing: { after: 40 },
        })
      );

      if (personal.profession) {
        leftColChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: personal.profession.toUpperCase(),
                bold: true,
                size: 16,
                color: 'dbadef',
                font: docFont,
              })
            ],
            spacing: { after: 160 },
          })
        );
      }

      const addContactRow = (label: string, value: string, linkUrl?: string) => {
        const contactRuns: any[] = [
          new TextRun({ text: `${label} `, bold: true, size: 16, color: headingYellow, font: docFont })
        ];
        if (linkUrl) {
          contactRuns.push(
            new ExternalHyperlink({
              children: [new TextRun({ text: value, color: 'ffffff', underline: {}, font: docFont, size: 16 })],
              link: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
            })
          );
        } else {
          contactRuns.push(new TextRun({ text: value, size: 16, color: 'ffffff', font: docFont }));
        }
        leftColChildren.push(new Paragraph({ children: contactRuns, spacing: { after: 60 } }));
      };

      leftColChildren.push(createSectionHeading('Contact', true));
      if (personal.email) addContactRow('✉', personal.email, `mailto:${personal.email}`);
      if (personal.phone) addContactRow('☎', personal.phone);
      if (personal.location) addContactRow('📍', personal.location);
      if (personal.linkedin) addContactRow('👔', 'LinkedIn', personal.linkedin);
      if (personal.github) addContactRow('💻', 'GitHub', personal.github);
      if (personal.portfolio) addContactRow('🌐', 'Portfolio', personal.portfolio);

      if (skills && skills.length > 0) {
        leftColChildren.push(createSectionHeading('Skills', true));
        skills.forEach((sk: any) => {
          leftColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: sk.name, bold: true, size: 18, color: 'ffffff', font: docFont }),
                new TextRun({ text: ` (${sk.level || 'Intermediate'})`, size: 16, color: 'dbadef', font: docFont }),
              ],
              spacing: { after: 40 }
            })
          );
        });
      }

      if (languages && languages.length > 0) {
        leftColChildren.push(createSectionHeading('Languages', true));
        languages.forEach((lang: any) => {
          leftColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: lang.language, bold: true, size: 18, color: 'ffffff', font: docFont }),
                new TextRun({ text: ` (${lang.proficiency || 'Native'})`, size: 16, color: 'dbadef', font: docFont }),
              ],
              spacing: { after: 40 }
            })
          );
        });
      }

      if (interests && interests.length > 0) {
        leftColChildren.push(createSectionHeading('Interests', true));
        leftColChildren.push(
          new Paragraph({
            children: [new TextRun({ text: interests.join(', '), color: 'ffffff', font: docFont, size: 18 })],
            spacing: { after: 60 }
          })
        );
      }

      if (summary && summary.text) {
        rightColChildren.push(createSectionHeading('Profile Summary'));
        rightColChildren.push(
          new Paragraph({
            children: [new TextRun({ text: summary.text, font: docFont, size: 20, color: textColorHex })],
            spacing: { after: 120 }
          })
        );
      }

      if (experience && experience.length > 0) {
        rightColChildren.push(createSectionHeading('Work Experience'));
        experience.forEach((exp: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.jobTitle, bold: true, size: 20, font: docFont, color: headingColorHex }),
                new TextRun({ text: `  •  ${exp.company}`, bold: true, size: 20, font: docFont, color: '475569' }),
              ]
            })
          );
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`, bold: true, color: primaryColorHex, size: 18, font: docFont }),
                exp.location ? new TextRun({ text: `  |  ${exp.location}`, italics: true, size: 18, font: docFont, color: '64748b' }) : new TextRun({ text: '' }),
              ]
            })
          );
          appendDescriptionLines(rightColChildren, exp.description);
          rightColChildren.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      if (projects && projects.length > 0) {
        rightColChildren.push(createSectionHeading('Projects'));
        projects.forEach((proj: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: proj.name, bold: true, size: 20, font: docFont, color: headingColorHex }),
                new TextRun({ text: `  (${proj.type || 'Personal'})`, italics: true, size: 18, font: docFont, color: '64748b' }),
              ]
            })
          );
          const links: any[] = [];
          if (proj.liveUrl) links.push(createLinkRun('Live Demo ↗', proj.liveUrl, primaryColorHex));
          if (proj.sourceUrl) {
            if (links.length > 0) links.push(new TextRun({ text: '  |  ', color: '94a3b8', size: 18 }));
            links.push(createLinkRun('Source Code ↗', proj.sourceUrl, '4f46e5'));
          }
          if (links.length > 0) {
            rightColChildren.push(new Paragraph({ children: links }));
          }
          if (proj.techStack && proj.techStack.length > 0) {
            rightColChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Tech Stack: ', bold: true, size: 18, font: docFont, color: '475569' }),
                  new TextRun({ text: proj.techStack.join(', '), italics: true, size: 18, font: docFont, color: '64748b' }),
                ],
                spacing: { before: 20, after: 40 },
              })
            );
          }
          appendDescriptionLines(rightColChildren, proj.description);
          rightColChildren.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      if (education && education.length > 0) {
        rightColChildren.push(createSectionHeading('Education'));
        education.forEach((edu: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree, bold: true, size: 20, font: docFont, color: headingColorHex }),
                new TextRun({ text: `  •  ${edu.institution}`, bold: true, size: 18, font: docFont, color: '475569' }),
              ]
            })
          );
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${edu.startYear} – ${edu.endYear}`, size: 18, font: docFont, color: '64748b' }),
                edu.location ? new TextRun({ text: `  |  ${edu.location}`, italics: true, size: 18, font: docFont, color: '64748b' }) : new TextRun({ text: '' }),
              ],
              spacing: { after: 60 }
            })
          );
        });
      }

      if (certifications && certifications.length > 0) {
        rightColChildren.push(createSectionHeading('Certifications'));
        certifications.forEach((cert: any) => {
          rightColChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: cert.name, bold: true, size: 18, font: docFont, color: headingColorHex }),
                new TextRun({ text: ` — ${cert.issuer}`, font: docFont, size: 18, color: '475569' }),
              ]
            })
          );
          if (cert.date || cert.url) {
            const certInfoRuns: any[] = [];
            if (cert.date) certInfoRuns.push(new TextRun({ text: `Date: ${cert.date}`, size: 16, font: docFont, color: '64748b' }));
            if (cert.url) {
              if (certInfoRuns.length > 0) certInfoRuns.push(new TextRun({ text: '  |  ', color: '94a3b8', size: 16 }));
              certInfoRuns.push(createLinkRun('View Certificate ↗', cert.url, primaryColorHex));
            }
            rightColChildren.push(new Paragraph({ children: certInfoRuns }));
          }
          rightColChildren.push(new Paragraph({ text: '', spacing: { after: 40 } }));
        });
      }

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: borderlessBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 32, type: WidthType.PERCENTAGE },
                  shading: { fill: '581c87' },
                  margins: { top: 360, bottom: 360, left: 240, right: 240 },
                  children: leftColChildren,
                  ...cellBorderless,
                }),
                new TableCell({
                  width: { size: 68, type: WidthType.PERCENTAGE },
                  shading: { fill: 'ffffff' },
                  margins: { top: 360, bottom: 360, left: 360, right: 240 },
                  children: rightColChildren,
                  ...cellBorderless,
                })
              ]
            })
          ]
        })
      );
    }
    // ==========================================
    // 3. TECH DARK LAYOUT
    // ==========================================
    else if (templateId === 'tech-dark') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: '>_ USER_PROFILE', bold: true, size: 24, color: primaryColorHex, font: docFont })],
          spacing: { after: 80 }
        })
      );

      const headerLeftElements: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: (personal.fullName || 'JOHN_DOE').toUpperCase(), bold: true, size: 32, color: 'ffffff', font: docFont })],
          spacing: { after: 40 }
        })
      ];

      if (personal.profession) {
        headerLeftElements.push(
          new Paragraph({
            children: [new TextRun({ text: personal.profession.toUpperCase().replace(/\s+/g, '_'), bold: true, size: 20, color: primaryColorHex, font: docFont })],
            spacing: { after: 80 }
          })
        );
      }

      if (photoBuffer) {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderlessBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 80, type: WidthType.PERCENTAGE },
                    children: headerLeftElements,
                    ...cellBorderless,
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new ImageRun({
                            data: photoBuffer,
                            type: photoType,
                            transformation: { width: 70, height: 70 },
                          })
                        ]
                      })
                    ],
                    ...cellBorderless,
                  })
                ]
              })
            ]
          })
        );
      } else {
        docChildren.push(...headerLeftElements);
      }

      docChildren.push(createDashedSeparator());

      const contactRuns: any[] = [];
      if (personal.email) {
        contactRuns.push(new TextRun({ text: `email: `, color: '94a3b8', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun(`"${personal.email}"`, `mailto:${personal.email}`, primaryColorHex));
      }
      if (personal.phone) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', color: '94a3b8', size: 18 }));
        contactRuns.push(new TextRun({ text: `phone: "${personal.phone}"`, color: 'cbd5e1', font: docFont, size: 18 }));
      }
      if (personal.location) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', color: '94a3b8', size: 18 }));
        contactRuns.push(new TextRun({ text: `location: "${personal.location}"`, color: 'cbd5e1', font: docFont, size: 18 }));
      }
      if (personal.linkedin) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', color: '94a3b8', size: 18 }));
        contactRuns.push(new TextRun({ text: `linkedin: `, color: '94a3b8', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun(`"${personal.linkedin}"`, personal.linkedin, primaryColorHex));
      }
      if (personal.github) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', color: '94a3b8', size: 18 }));
        contactRuns.push(new TextRun({ text: `github: `, color: '94a3b8', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun(`"${personal.github}"`, personal.github, primaryColorHex));
      }
      if (personal.portfolio) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', color: '94a3b8', size: 18 }));
        contactRuns.push(new TextRun({ text: `portfolio: `, color: '94a3b8', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun(`"${personal.portfolio}"`, personal.portfolio, primaryColorHex));
      }
      if (contactRuns.length > 0) {
        docChildren.push(new Paragraph({ children: contactRuns, spacing: { after: 120 } }));
      }

      docChildren.push(createDashedSeparator());

      if (summary && summary.text) {
        docChildren.push(createSectionHeading('Summary'));
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: summary.text, font: docFont, size: 20, color: textColorHex })],
            spacing: { after: 120 }
          })
        );
      }

      if (experience && experience.length > 0) {
        docChildren.push(createSectionHeading('Recent Experience'));
        experience.forEach((exp: any) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `[${exp.jobTitle.toUpperCase().replace(/\s+/g, '_')}]`, bold: true, size: 20, font: docFont, color: 'ffffff' }),
                new TextRun({ text: ` - ${exp.startDate.toUpperCase()} - ${exp.current ? 'PRESENT' : exp.endDate.toUpperCase()}`, bold: true, color: primaryColorHex, size: 18, font: docFont }),
              ]
            })
          );
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `company: "${exp.company}"`, font: docFont, size: 18, color: '94a3b8' }),
                exp.location ? new TextRun({ text: ` | location: "${exp.location}"`, font: docFont, size: 18, color: '94a3b8' }) : new TextRun({ text: '' }),
              ],
              spacing: { after: 40 }
            })
          );
          appendDescriptionLines(docChildren, exp.description);
          docChildren.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      if (projects && projects.length > 0) {
        docChildren.push(createSectionHeading('Projects'));
        projects.forEach((proj: any) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `[${proj.name.toUpperCase().replace(/\s+/g, '_')}]`, bold: true, size: 20, font: docFont, color: 'ffffff' }),
                new TextRun({ text: ` (${proj.type.toUpperCase()})`, italics: true, size: 18, font: docFont, color: '94a3b8' }),
              ]
            })
          );
          const links: any[] = [];
          if (proj.liveUrl) {
            links.push(new TextRun({ text: 'demo: ', color: '94a3b8', font: docFont, size: 18 }));
            links.push(createLinkRun(`"${proj.liveUrl}"`, proj.liveUrl, primaryColorHex));
          }
          if (proj.sourceUrl) {
            if (links.length > 0) links.push(new TextRun({ text: ' | ', color: '94a3b8', size: 18 }));
            links.push(new TextRun({ text: 'src: ', color: '94a3b8', font: docFont, size: 18 }));
            links.push(createLinkRun(`"${proj.sourceUrl}"`, proj.sourceUrl, primaryColorHex));
          }
          if (links.length > 0) {
            docChildren.push(new Paragraph({ children: links }));
          }
          if (proj.techStack && proj.techStack.length > 0) {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'tech_stack: [', font: docFont, size: 18, color: '94a3b8' }),
                  new TextRun({ text: proj.techStack.map((t: string) => `"${t}"`).join(', '), font: docFont, size: 18, color: 'cbd5e1' }),
                  new TextRun({ text: ']', font: docFont, size: 18, color: '94a3b8' }),
                ],
                spacing: { before: 20, after: 40 },
              })
            );
          }
          appendDescriptionLines(docChildren, proj.description);
          docChildren.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }

      if (education && education.length > 0) {
        docChildren.push(createSectionHeading('Education'));
        education.forEach((edu: any) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `[${edu.degree.toUpperCase().replace(/\s+/g, '_')}]`, bold: true, size: 20, font: docFont, color: 'ffffff' }),
                new TextRun({ text: ` - ${edu.startYear} - ${edu.endYear}`, color: '94a3b8', font: docFont, size: 18 }),
              ]
            })
          );
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `institution: "${edu.institution}"`, font: docFont, size: 18, color: 'cbd5e1' }),
                edu.gpa ? new TextRun({ text: ` | gpa: "${edu.gpa}"`, font: docFont, size: 18, color: 'cbd5e1' }) : new TextRun({ text: '' }),
              ],
              spacing: { after: 60 }
            })
          );
        });
      }

      if (skills && skills.length > 0) {
        docChildren.push(createSectionHeading('Skills'));
        skills.forEach((sk: any) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${sk.name.toLowerCase().replace(/\s+/g, '_')}: `, bold: true, size: 18, color: primaryColorHex, font: docFont }),
                new TextRun({ text: `"${sk.level || 'intermediate'}"`, size: 18, color: 'cbd5e1', font: docFont }),
              ],
              spacing: { after: 40 }
            })
          );
        });
      }

      if (certifications && certifications.length > 0) {
        docChildren.push(createSectionHeading('Certifications'));
        certifications.forEach((cert: any) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `* ${cert.name}`, bold: true, size: 18, color: 'ffffff', font: docFont }),
                new TextRun({ text: ` (${cert.issuer})`, size: 18, color: '94a3b8', font: docFont }),
              ]
            })
          );
          if (cert.url) {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: '  link: ', color: '94a3b8', font: docFont, size: 16 }),
                  createLinkRun(`"${cert.url}"`, cert.url, primaryColorHex)
                ]
              })
            );
          }
          docChildren.push(new Paragraph({ text: '', spacing: { after: 40 } }));
        });
      }

      if (languages && languages.length > 0) {
        docChildren.push(createSectionHeading('Languages'));
        languages.forEach((lang: any) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${lang.language.toLowerCase()}: `, bold: true, size: 18, color: primaryColorHex, font: docFont }),
                new TextRun({ text: `"${lang.proficiency}"`, size: 18, color: 'cbd5e1', font: docFont }),
              ],
              spacing: { after: 40 }
            })
          );
        });
      }

      if (interests && interests.length > 0) {
        docChildren.push(createSectionHeading('Interests'));
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `interests = [${interests.map((t: string) => `"${t.toLowerCase()}"`).join(', ')}]`, color: 'cbd5e1', font: docFont, size: 18 })
            ]
          })
        );
      }
    }
    // ==========================================
    // 4. STARTUP FRESH LAYOUT
    // ==========================================
    else if (templateId === 'startup-fresh') {
      const bannerChildren: any[] = [
        new Paragraph({
          children: [new TextRun({ text: personal.fullName || 'John Doe', bold: true, size: 32, color: 'ffffff', font: docFont })],
          spacing: { after: 40 }
        })
      ];
      if (personal.profession) {
        bannerChildren.push(
          new Paragraph({
            children: [new TextRun({ text: personal.profession.toUpperCase(), bold: true, size: 20, color: 'ffe4e6', font: docFont })],
            spacing: { after: 80 }
          })
        );
      }

      const bannerTableCells = [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          children: bannerChildren,
          ...cellBorderless,
        })
      ];

      if (photoBuffer) {
        bannerTableCells.push(
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new ImageRun({
                    data: photoBuffer,
                    type: photoType,
                    transformation: { width: 70, height: 70 },
                  })
                ]
              })
            ],
            ...cellBorderless,
          })
        );
      }

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: borderlessBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { fill: 'f43f5e' },
                  margins: { top: 360, bottom: 360, left: 360, right: 360 },
                  children: [
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      borders: borderlessBorders,
                      rows: [new TableRow({ children: bannerTableCells })]
                    })
                  ],
                  ...cellBorderless,
                })
              ]
            })
          ]
        })
      );

      docChildren.push(new Paragraph({ text: '', spacing: { after: 120 } }));

      const contactRuns: any[] = [];
      if (personal.email) contactRuns.push(createLinkRun(personal.email, `mailto:${personal.email}`, primaryColorHex));
      if (personal.phone) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(new TextRun({ text: personal.phone, color: '475569', font: docFont, size: 18 }));
      }
      if (personal.location) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(new TextRun({ text: personal.location, color: '475569', font: docFont, size: 18 }));
      }
      if (personal.linkedin) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun('LinkedIn', personal.linkedin, '0284c7'));
      }
      if (personal.github) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun('GitHub', personal.github, '4f46e5'));
      }
      if (personal.portfolio) {
        if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactRuns.push(createLinkRun('Portfolio', personal.portfolio, '059669'));
      }
      if (contactRuns.length > 0) {
        docChildren.push(new Paragraph({ children: contactRuns, spacing: { after: 180 } }));
      }

      appendMainContent(docChildren);

      if (skills && skills.length > 0) {
        docChildren.push(createSectionHeading('Skills'));
        const groupedSkills: Record<string, string[]> = {};
        skills.forEach((s: any) => {
          const categoryName = s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : 'Technical';
          if (!groupedSkills[categoryName]) groupedSkills[categoryName] = [];
          groupedSkills[categoryName].push(`${s.name} (${s.level || 'Intermediate'})`);
        });
        Object.entries(groupedSkills).forEach(([category, list]) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${category}: `, bold: true, font: docFont, size: 20, color: headingColorHex }),
                new TextRun({ text: list.join(', '), font: docFont, size: 20, color: textColorHex }),
              ],
              spacing: { after: 60 },
            })
          );
        });
      }

      if (languages && languages.length > 0) {
        docChildren.push(createSectionHeading('Languages'));
        const langRuns: any[] = [];
        languages.forEach((lang: any, index: number) => {
          if (index > 0) langRuns.push(new TextRun({ text: '   |   ', color: 'cbd5e1', font: docFont, size: 20 }));
          langRuns.push(new TextRun({ text: lang.language, bold: true, font: docFont, size: 20, color: headingColorHex }));
          langRuns.push(new TextRun({ text: ` (${lang.proficiency || 'Native'})`, italics: true, font: docFont, size: 18, color: '64748b' }));
        });
        docChildren.push(new Paragraph({ children: langRuns, spacing: { after: 60 } }));
      }

      if (interests && interests.length > 0) {
        docChildren.push(createSectionHeading('Interests'));
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: interests.join(', '), font: docFont, size: 20, color: '475569' })],
            spacing: { after: 60 }
          })
        );
      }
    }
    // ==========================================
    // 5. STANDARD LAYOUT (CLASSIC, EXECUTIVE, ELEGANT, ACADEMIC)
    // ==========================================
    else {
      const isCenteredHeader = templateId === 'classic-professional';
      const headerLeftChildren: Paragraph[] = [];

      headerLeftChildren.push(
        new Paragraph({
          alignment: isCenteredHeader ? AlignmentType.CENTER : undefined,
          children: [
            new TextRun({
              text: personal.fullName || 'John Doe',
              bold: true,
              size: 32,
              color: primaryColorHex,
              font: docFont,
            })
          ],
          spacing: { after: 40 },
        })
      );

      if (personal.profession) {
        headerLeftChildren.push(
          new Paragraph({
            alignment: isCenteredHeader ? AlignmentType.CENTER : undefined,
            children: [
              new TextRun({
                text: personal.profession.toUpperCase(),
                bold: true,
                size: 20,
                color: '475569',
                font: docFont,
              })
            ],
            spacing: { after: 100 },
          })
        );
      }

      const contactChildren: any[] = [];
      if (personal.email) contactChildren.push(createLinkRun(personal.email, `mailto:${personal.email}`, primaryColorHex));
      if (personal.phone) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactChildren.push(new TextRun({ text: personal.phone, color: '475569', font: docFont, size: 18 }));
      }
      if (personal.location) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactChildren.push(new TextRun({ text: personal.location, color: '475569', font: docFont, size: 18 }));
      }
      if (personal.linkedin) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactChildren.push(createLinkRun('LinkedIn', personal.linkedin, primaryColorHex));
      }
      if (personal.github) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactChildren.push(createLinkRun('GitHub', personal.github, '4f46e5'));
      }
      if (personal.portfolio) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', color: 'cbd5e1', font: docFont, size: 18 }));
        contactChildren.push(createLinkRun('Portfolio', personal.portfolio, '059669'));
      }

      if (contactChildren.length > 0) {
        headerLeftChildren.push(
          new Paragraph({
            alignment: isCenteredHeader ? AlignmentType.CENTER : undefined,
            children: contactChildren,
            spacing: { after: 120 },
          })
        );
      }

      const headerBorderColor = templateId === 'executive' ? 'd97706' : primaryColorHex;
      const headerBorderSize = templateId === 'academic-formal' ? 18 : 12;
      const headerBorderStyle = templateId === 'academic-formal' ? BorderStyle.DOUBLE : BorderStyle.SINGLE;
      headerLeftChildren.push(
        new Paragraph({
          border: {
            bottom: {
              color: headerBorderColor,
              space: 8,
              style: headerBorderStyle,
              size: headerBorderSize,
            }
          },
          spacing: { after: 180 }
        })
      );

      if (photoBuffer && !isCenteredHeader) {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderlessBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 80, type: WidthType.PERCENTAGE },
                    children: headerLeftChildren,
                    ...cellBorderless,
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new ImageRun({
                            data: photoBuffer,
                            type: photoType,
                            transformation: { width: 75, height: 75 },
                          })
                        ]
                      })
                    ],
                    ...cellBorderless,
                  })
                ]
              })
            ]
          })
        );
      } else {
        if (photoBuffer && isCenteredHeader) {
          docChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: photoBuffer,
                  type: photoType,
                  transformation: { width: 75, height: 75 },
                })
              ],
              spacing: { after: 100 }
            })
          );
        }
        docChildren.push(...headerLeftChildren);
      }

      appendMainContent(docChildren);

      if (skills && skills.length > 0) {
        docChildren.push(createSectionHeading('Skills'));
        const groupedSkills: Record<string, string[]> = {};
        skills.forEach((s: any) => {
          const categoryName = s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : 'Technical';
          if (!groupedSkills[categoryName]) {
            groupedSkills[categoryName] = [];
          }
          groupedSkills[categoryName].push(`${s.name} (${s.level || 'Intermediate'})`);
        });

        Object.entries(groupedSkills).forEach(([category, list]) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${category}: `, bold: true, font: docFont, size: 20, color: headingColorHex }),
                new TextRun({ text: list.join(', '), font: docFont, size: 20, color: textColorHex }),
              ],
              spacing: { after: 60 },
            })
          );
        });
      }

      if (languages && languages.length > 0) {
        docChildren.push(createSectionHeading('Languages'));
        const langRuns: any[] = [];
        languages.forEach((lang: any, index: number) => {
          if (index > 0) {
            langRuns.push(new TextRun({ text: '   |   ', color: 'cbd5e1', font: docFont, size: 20 }));
          }
          langRuns.push(new TextRun({ text: lang.language, bold: true, font: docFont, size: 20, color: headingColorHex }));
          langRuns.push(new TextRun({ text: ` (${lang.proficiency || 'Native'})`, italics: true, font: docFont, size: 18, color: '64748b' }));
        });
        docChildren.push(new Paragraph({ children: langRuns, spacing: { after: 60 } }));
      }

      if (interests && interests.length > 0) {
        docChildren.push(createSectionHeading('Interests'));
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: interests.join(', '),
                font: docFont,
                size: 20,
                color: '475569',
              })
            ],
            spacing: { after: 60 },
          })
        );
      }
    }

    // Initialize document configurations
    const doc = new Document({
      background: isDarkMode ? { color: '1a1a2e' } : undefined,
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1080, // 0.75 in
                bottom: 1080,
                left: 1080,
                right: 1080,
              }
            }
          },
          children: docChildren,
        },
      ],
    });

    Packer.toBuffer(doc).then((buffer) => {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${personal.fullName || 'Resume'}_Resume.docx"`);
      res.send(buffer);
    });
  } catch (err: any) {
    console.error('Error generating document:', err.message);
    res.status(500).json({ error: 'Could not export Word Doc' });
  }
});

// Setup Vite Dev server or Client Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
