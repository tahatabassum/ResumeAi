# ResumeAI - Modern AI-Powered Resume Builder

ResumeAI is a premium, real-time interactive resume builder built with React, Vite, and Tailwind CSS. It leverages the Gemini API to write and improve resumes, offering real-time previews across 8 professional templates, seamless print-to-PDF formatting, and Word document export.

---

## 🚀 Features

### 1. Interactive Real-Time Builder
- Easy-to-use form editor for all standard resume sections:
  - Personal Information (Name, email, phone, location, profile photo, and social links).
  - Professional Summary.
  - Work Experience (with multiple entries, date pickers, and roles).
  - Education (degrees, GPAs, dates, and achievements).
  - Skills (categorized with beginners/intermediate/advanced ratings).
  - Projects (including Demo links, GitHub source repositories, and tech stacks).
  - Certifications, Languages, and Interests.
- Dynamic Preview updates instantly as you type.

### 2. 8 Curated Professional Styles
Choose from eight distinct layouts tailored to different industries:
- **Classic Professional**: A clean, balanced, traditional corporate layout.
- **Academic Formal**: Double-ruled, elegant layout using serif typography, suited for academic and researcher roles.
- **Creative Bold**: A stunning double-column layout with a deep purple sidebar, accent colors, and custom profile photo containers.
- **Elegant Serif**: A sophisticated, warm burgundy template.
- **Executive Template**: A bold charcoal design with premium gold highlight accents.
- **Modern Minimal**: A minimalist, high-contrast, clean layout.
- **StartupFresh**: A vibrant coral-themed startup builder layout featuring metadata badges.
- **Tech Dark**: A console-inspired monospace template (`>_`) with green highlights and terminal syntax.

### 3. Print-Ready Social & Portfolio Links
- Integrates modern **Lucide Icons** (`Linkedin`, `Github`, `Globe`) alongside user handles.
- **Smart Link Formatting**: Normalizes inputs (either raw handles or full URLs) into clean, print-friendly text labels (e.g. `github.com/username` or `linkedin.com/in/username`) while keeping the links clickable in digital PDFs.

### 4. Layout & PDF Optimizations
- **Sidebar Screen Stretch**: Sidebar elements stretch seamlessly to fill the full height of the viewport during preview.
- **Perfect A4 PDF Export**: Configured at exactly `297mm` height in print stylesheets to ensure designs like sidebars stretch to the bottom of the page without generating blank trailing pages.
- **Word (.docx) Export**: Supports saving resumes as fully editable Microsoft Word documents.

### 5. Gemini AI Assistance
- **AI Summary Generator**: Auto-writes professional summaries based on your profession and details.
- **AI Project Enhancer**: Rewrites project descriptions to highlight metrics, achievements, and impact.

---

## 🛠️ Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- A Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/))

### Getting Started

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory (or rename `.env.example` to `.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the local server & database:**
   The backend uses a local JSON server to persist resumes.
   ```bash
   npm run dev
   ```

The application will launch on [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
├── server/                 # Mock backend server & API handlers
├── src/
│   ├── components/         # Reusable UI elements & layouts
│   │   ├── templates/      # The 8 resume styles (AcademicFormal, CreativeBold, etc.)
│   │   └── ui/             # Form fields and skill indicators
│   ├── context/            # Global React Context state handlers
│   ├── pages/              # LandingPage, BuilderPage, AuthPage, DashboardPage
│   ├── utils/              # Link formatter and helper scripts
│   ├── types.ts            # Resume schema definitions
│   └── index.css           # Global stylesheet and print overrides
├── server_db.json          # Local database storage file
└── vite.config.ts          # Vite bundling configurations
```
