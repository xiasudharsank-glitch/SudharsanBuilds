# CLAUDE.md - AI Assistant Guide for SudharsanBuilds Portfolio

> **Last Updated:** 2025-11-17
> **Project:** SudharsanBuilds - Professional Portfolio Website
> **Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Tech Stack & Dependencies](#tech-stack--dependencies)
4. [Development Workflows](#development-workflows)
5. [Code Conventions & Patterns](#code-conventions--patterns)
6. [Component Architecture](#component-architecture)
7. [TypeScript Guidelines](#typescript-guidelines)
8. [Styling Guidelines](#styling-guidelines)
9. [API Integrations](#api-integrations)
10. [Git Workflow](#git-workflow)
11. [Common Tasks](#common-tasks)
12. [Design Principles](#design-principles)
13. [File Reference Guide](#file-reference-guide)

---

## Project Overview

**SudharsanBuilds** is a modern, production-quality portfolio website showcasing web development services and projects. It's a single-page application (SPA) with sophisticated 3D animations, interactive UI elements, and professional design.

### Key Features
- **3D Interactive Elements**: Bot mascot, profile card with mouse-tracking effects
- **Project Portfolio**: Filterable projects with modal details and live previews
- **Contact Form**: Integrated with Formspree for email submissions
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimized**: Built with Vite for fast HMR and optimized builds

### Project Type
This is a **portfolio/showcase website** for a web developer, built as a static single-page application with no backend server (except third-party APIs).

---

## Directory Structure

```
/home/user/SudharsanBuilds/
├── .bolt/                          # Bolt.new configuration
│   ├── config.json                # Template metadata
│   └── prompt                     # Design guidelines for AI
│
├── src/                           # Source code directory
│   ├── components/                # React components (flat structure)
│   │   ├── Navigation.tsx        # Fixed navigation bar with mobile menu
│   │   ├── Hero.tsx              # Landing section with 3D bot animation
│   │   ├── About.tsx             # About section with 3D profile card
│   │   ├── Projects.tsx          # Portfolio projects with filtering
│   │   ├── Process.tsx           # Work process visualization
│   │   ├── Services.tsx          # Services grid
│   │   ├── Testimonials.tsx      # Client testimonials
│   │   ├── Contact.tsx           # Contact form (Formspree)
│   │   └── Footer.tsx            # Site footer
│   │
│   ├── assets/                    # Static assets
│   │   └── [images]              # Profile photos, etc.
│   │
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles + custom animations
│   └── vite-env.d.ts             # Vite type definitions
│
├── Configuration Files
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Dependencies and scripts
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript base config
│   ├── tsconfig.app.json         # App-specific TS config
│   ├── tsconfig.node.json        # Node-specific TS config
│   ├── tailwind.config.js        # Tailwind customization
│   ├── postcss.config.js         # PostCSS plugins
│   ├── eslint.config.js          # ESLint rules
│   └── .gitignore                # Git ignore patterns
│
└── README.md                      # Project README
```

### Key Characteristics
- **Flat Component Structure**: All components at the same level, no subdirectories
- **No Routing Library**: Uses hash-based anchor navigation (`#home`, `#about`, etc.)
- **Self-Contained Components**: Each component manages its own state and logic
- **No Global State**: No Redux, Zustand, or Context API needed

---

## Tech Stack & Dependencies

### Core Framework
- **React**: 18.3.1 - Modern React with hooks
- **TypeScript**: 5.5.3 - Type safety throughout
- **Vite**: 5.4.2 - Ultra-fast build tool with HMR

### UI & Styling
- **Tailwind CSS**: 3.4.1 - Utility-first CSS framework
- **Framer Motion**: 12.23.24 - Animation library for 3D effects
- **Lucide React**: 0.344.0 - Icon library (preferred over other icon sets)
- **PostCSS**: 8.4.35 - CSS transformations
- **Autoprefixer**: 10.4.18 - Browser compatibility

### Code Quality
- **ESLint**: 9.9.1 - Linting with flat config system
- **TypeScript ESLint**: 8.3.0 - TypeScript-specific linting
- **React Hooks Plugin**: Enforces React hooks rules
- **React Refresh Plugin**: Fast refresh during development

### Backend Services (Client-Side APIs)
- **Supabase**: 2.57.4 - Installed but not currently used (ready for future integration)
- **Formspree**: Contact form email service (hardcoded endpoint)
- **Microlink API**: Website screenshot previews for projects

---

## Development Workflows

### Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint checks
npm run lint

# Run TypeScript type checking (separate from build)
npm run typecheck
```

### Development Server
- **Port**: Default Vite port (usually 5173)
- **HMR**: Instant hot module replacement
- **Fast Refresh**: React components update without losing state

### Build Process
1. TypeScript compilation (check with `npm run typecheck`)
2. Vite bundling with optimizations
3. Tailwind CSS purging (removes unused styles)
4. Output to `dist/` directory

### Pre-Deployment Checklist
```bash
# Run all checks before committing
npm run typecheck  # Verify no TypeScript errors
npm run lint       # Fix linting issues
npm run build      # Ensure production build succeeds
```

---

## Code Conventions & Patterns

### File Naming
- **Components**: PascalCase (e.g., `Navigation.tsx`, `Hero.tsx`)
- **TypeScript**: Always use `.tsx` for components with JSX
- **No barrel exports**: Direct imports from component files

### Import Order Convention
```typescript
// 1. React and hooks
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// 3. Local components (if any)
import ComponentName from './ComponentName';

// 4. Types (can be inline or separate)
type MyType = { ... };
```

### Component Structure Pattern
```typescript
// 1. Imports
import { useState } from 'react';
import { motion } from 'framer-motion';

// 2. Types/Interfaces (if needed)
type Props = {
  // ...
};

type LocalState = {
  // ...
};

// 3. Constants/Data (if needed)
const SOME_CONFIG = [ ... ];

// 4. Component Definition
export default function ComponentName() {
  // 4a. State declarations
  const [state, setState] = useState(...);

  // 4b. Effects
  useEffect(() => {
    // ...
  }, []);

  // 4c. Event handlers
  const handleEvent = () => {
    // ...
  };

  // 4d. Render helpers (if any)
  const renderHelper = () => { ... };

  // 4e. Return JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### State Management
- **Local State Only**: Use `useState` for all state management
- **No Global State**: Components are independent, no prop drilling needed
- **Effect Cleanup**: Always return cleanup functions in `useEffect`

```typescript
// Example: Event listener with cleanup
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Custom Hooks Pattern
Located inline within components, not in separate files:

```typescript
// Example from Hero.tsx
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
};
```

---

## Component Architecture

### Navigation Pattern
**Hash-based smooth scrolling**, not React Router:

```typescript
const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
```

### Section IDs (used in navigation)
- `#home` → Hero section
- `#about` → About section
- `#projects` → Projects section
- `#services` → Services section
- `#contact` → Contact section

### Component Communication
- **No props between sections**: All sections are independent
- **App.tsx composition**: Simply stacks all components vertically
- **Self-contained logic**: Each component handles its own data and state

### Animation Patterns (Framer Motion)

**Scroll-triggered animations:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  {/* Content */}
</motion.div>
```

**Stagger animations:**
```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
    >
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

**Modal animations (AnimatePresence):**
```typescript
<AnimatePresence>
  {showModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## TypeScript Guidelines

### Configuration Details

**Strict Mode Enabled** (`tsconfig.app.json`):
- `strict: true` - All strict type-checking options
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused function parameters
- `noFallthroughCasesInSwitch: true` - Error on switch fallthrough

### Type Definitions

**Component Props:**
```typescript
type Props = {
  title: string;
  description?: string; // Optional
  onClick: () => void;
};

export default function Component({ title, description, onClick }: Props) {
  // ...
}
```

**Data Models (see Projects.tsx):**
```typescript
type ProjectStatus = 'completed' | 'in-progress' | 'on-hold';
type ProjectType = 'client' | 'personal' | 'open-source' | 'freelance';

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  image?: string;
  type: ProjectType;
  status: ProjectStatus;
  techStack: TechStack[];
  tags: string[];
  startDate: string;
  endDate?: string;
  // ... more fields
};
```

**Event Handlers:**
```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### No `any` Types
Always provide explicit types. If type is complex, define it:

```typescript
// Bad
const data: any = fetchData();

// Good
type FetchResponse = {
  success: boolean;
  data: ProjectData[];
};

const data: FetchResponse = fetchData();
```

---

## Styling Guidelines

### Tailwind CSS Approach

**Utility-First Pattern:**
```tsx
<div className="flex items-center justify-between p-6 bg-slate-900">
  {/* Content */}
</div>
```

**Color Palette:**
- **Background**: `slate-900`, `slate-800` (dark theme)
- **Text**: `slate-300`, `white`
- **Accent**: `cyan-400`, `cyan-500` (primary brand color)
- **Gradients**: `from-blue-600 to-cyan-600`

**Responsive Breakpoints:**
```tsx
// Mobile-first approach
<div className="flex-col md:flex-row lg:gap-8">
  {/* Stacks vertically on mobile, row on medium+ screens */}
</div>
```

**Common Patterns:**

1. **Container:**
```tsx
<div className="container mx-auto px-6">
  {/* Content */}
</div>
```

2. **Section:**
```tsx
<section id="section-name" className="py-20 bg-slate-900">
  {/* Section content */}
</section>
```

3. **Card:**
```tsx
<div className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-700 transition">
  {/* Card content */}
</div>
```

4. **Button:**
```tsx
<button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition">
  Click Me
</button>
```

### Custom Animations (index.css)

**3D Profile Card Effect:**
```css
.profile-card-3d {
  perspective: 1000px;
  transform-style: preserve-3d;
}
```

**Slow Spin Animation:**
```css
@keyframes slow-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-slow-spin {
  animation: slow-spin 12s linear infinite;
}
```

### Icon Usage (Lucide React)

**Always use Lucide React for icons** (per `.bolt/prompt`):
```typescript
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';

<Mail className="w-6 h-6 text-cyan-400" />
```

**Do NOT install:**
- React Icons
- Font Awesome
- Hero Icons
- Other icon libraries (unless absolutely necessary)

---

## API Integrations

### 1. Formspree (Contact Form)

**File:** `src/components/Contact.tsx`

**Endpoint:** `https://formspree.io/f/xldpowyp`

**Implementation:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('sending');

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('message', message);

  const response = await fetch('https://formspree.io/f/xldpowyp', {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' }
  });

  if (response.ok) {
    setStatus('success');
    // Reset form
  } else {
    setStatus('error');
  }
};
```

**Form States:**
- `idle` - Initial state
- `sending` - Submission in progress
- `success` - Form submitted successfully
- `error` - Submission failed

### 2. Microlink API (Project Previews)

**File:** `src/components/Projects.tsx`

**Purpose:** Generate live website screenshots for project cards

**Implementation:**
```typescript
const getWebsitePreview = (url: string) => {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
};

// Usage in component
<img
  src={getWebsitePreview(project.link)}
  alt={project.title}
  className="w-full h-48 object-cover"
/>
```

**Features:**
- Auto-generates screenshots of live websites
- Falls back gracefully if API fails
- Cached in component state to reduce API calls

### 3. Supabase (Not Currently Implemented)

**Package:** Installed (`@supabase/supabase-js` v2.57.4) but not configured

**Future Use Cases:**
- Database for projects/testimonials
- User authentication
- Real-time features
- File storage for images

**To implement:**
1. Create Supabase project
2. Add environment variables for API keys
3. Initialize client in a separate file
4. Replace static data with database queries

---

## Git Workflow

### Branch Strategy

**Current Branch:** `claude/claude-md-mi2mymox90mns0gw-01Dif1fFQmvoo33Xe7kwFQin`

**Important Rules:**
1. All development happens on designated feature branches starting with `claude/`
2. Branch names must match the session ID pattern
3. Always use `git push -u origin <branch-name>` for first push
4. Never push to `main` or `master` without explicit permission

### Commit Message Style

Based on recent commits, follow this pattern:

```
<action> <description>

Examples:
- fixed duplicate project details and testimonial with real ones
- made project section more applealing and professional
- fixed automatic preview on project section for each project or websites
- added package.json file
```

**Actions:** `fixed`, `added`, `updated`, `removed`, `made`, `improved`

### Commit Workflow

```bash
# 1. Check status
git status

# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "fixed navigation mobile menu overlap issue"

# 4. Push to feature branch
git push -u origin claude/claude-md-mi2mymox90mns0gw-01Dif1fFQmvoo33Xe7kwFQin
```

### Pre-Commit Checklist
- [ ] TypeScript type checking passes (`npm run typecheck`)
- [ ] ESLint checks pass (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors in development
- [ ] Tested on mobile viewport

---

## Common Tasks

### Adding a New Component

1. Create file in `src/components/`:
```typescript
// src/components/NewSection.tsx
import { motion } from 'framer-motion';

export default function NewSection() {
  return (
    <section id="new-section" className="py-20 bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white mb-8"
        >
          New Section
        </motion.h2>
      </div>
    </section>
  );
}
```

2. Add to `App.tsx`:
```typescript
import NewSection from './components/NewSection';

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      {/* ... other sections ... */}
      <NewSection />  {/* Add here */}
      <Footer />
    </div>
  );
}
```

3. Update navigation if needed:
```typescript
// src/components/Navigation.tsx
const navLinks = [
  // ... existing links ...
  { href: '#new-section', label: 'New Section' }
];
```

### Adding a New Project

Edit `src/components/Projects.tsx`:

```typescript
const PROJECTS: Project[] = [
  // ... existing projects ...
  {
    id: 'unique-project-id',
    title: 'Project Title',
    type: 'client', // or 'personal', 'open-source', 'freelance'
    status: 'completed', // or 'in-progress', 'on-hold'
    role: 'Full-stack Developer',
    description: 'Detailed project description...',
    link: 'https://project-url.com',
    techStack: [
      { name: 'React' },
      { name: 'TypeScript' },
      // ... more tech
    ],
    tags: ['Tag1', 'Tag2'],
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    featured: true,
    keyAchievements: [
      'Achievement 1',
      'Achievement 2',
    ],
    githubUrl: 'https://github.com/...',
    clientTestimonial: {
      text: 'Testimonial text...',
      name: 'Client Name',
      role: 'Client Title'
    }
  }
];
```

### Updating Styles

**Global styles:** Edit `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .custom-class {
    @apply bg-slate-900 rounded-lg p-6;
  }
}
```

**Tailwind config:** Edit `tailwind.config.js`
```javascript
export default {
  theme: {
    extend: {
      colors: {
        'custom-color': '#hexcode',
      },
      animation: {
        'custom-animation': 'custom 3s ease-in-out infinite',
      },
    },
  },
};
```

### Debugging Common Issues

**TypeScript Errors:**
```bash
npm run typecheck
# Fix errors shown, then rerun
```

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**HMR Not Working:**
```bash
# Restart dev server
# Ctrl+C to stop, then:
npm run dev
```

**Styles Not Applying:**
- Check Tailwind class names for typos
- Ensure Tailwind directives are in `index.css`
- Restart dev server after `tailwind.config.js` changes

---

## Design Principles

From `.bolt/prompt`:

> **"For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production."**

### Guidelines for AI Assistants

1. **Prioritize Beauty:** Don't create generic, template-looking designs
2. **Production-Ready:** All code should be production-quality, not prototypes
3. **Use Existing Stack:** Prefer Tailwind + Lucide React over new dependencies
4. **Avoid Unnecessary Packages:** Don't install UI libraries, icon packs, or themes unless absolutely necessary
5. **Maintain Consistency:** Follow existing patterns in the codebase

### When Adding Features

- **Check existing components first** - Reuse patterns before creating new ones
- **Use Tailwind utilities** - Avoid writing custom CSS unless necessary
- **Add Framer Motion animations** - Keep the interactive, polished feel
- **Test responsiveness** - Always check mobile, tablet, and desktop views
- **Maintain dark theme** - Stick with slate-900 backgrounds and cyan accents

---

## File Reference Guide

### Critical Files (Read Before Editing)

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/App.tsx` | Root component composition | Adding/removing sections |
| `src/components/Navigation.tsx` | Nav bar and menu | Updating nav links |
| `src/components/Projects.tsx` | Project portfolio | Adding/editing projects |
| `src/components/Contact.tsx` | Contact form | Changing form fields or API |
| `tailwind.config.js` | Tailwind customization | Adding custom colors/animations |
| `src/index.css` | Global styles | Adding custom animations |
| `package.json` | Dependencies and scripts | Adding new packages |
| `vite.config.ts` | Build configuration | Optimizations, plugins |
| `tsconfig.app.json` | TypeScript rules | Compiler settings |

### Configuration Files

| File | Purpose | Rarely Modified |
|------|---------|-----------------|
| `eslint.config.js` | Linting rules | ✓ |
| `postcss.config.js` | PostCSS plugins | ✓ |
| `tsconfig.json` | TS base config | ✓ |
| `tsconfig.node.json` | Node TS config | ✓ |
| `.gitignore` | Git ignore patterns | ✓ |

### Build Artifacts (Never Commit)

- `dist/` - Production build output
- `node_modules/` - Dependencies
- `.bolt/` - May contain temporary files

---

## Quick Reference

### Component Import Template
```typescript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconName } from 'lucide-react';

export default function ComponentName() {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-20 bg-slate-900"
    >
      {/* Content */}
    </motion.section>
  );
}
```

### Responsive Grid Template
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <div key={item.id} className="bg-slate-800 rounded-lg p-6">
      {/* Item content */}
    </div>
  ))}
</div>
```

### Form Template
```tsx
const [formData, setFormData] = useState({ field: '' });
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('loading');
  try {
    // API call
    setStatus('success');
  } catch (error) {
    setStatus('error');
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      value={formData.field}
      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
      className="w-full px-4 py-3 bg-slate-700 rounded-lg"
    />
    <button
      type="submit"
      disabled={status === 'loading'}
      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg"
    >
      {status === 'loading' ? 'Sending...' : 'Submit'}
    </button>
  </form>
);
```

---

## Support & Resources

### Documentation
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion
- **Lucide Icons**: https://lucide.dev

### Project-Specific
- **Formspree Docs**: https://help.formspree.io
- **Microlink API**: https://microlink.io/docs

### Quick Commands
```bash
npm run dev        # Start development
npm run build      # Production build
npm run typecheck  # Type checking
npm run lint       # Linting
npm run preview    # Preview build
```

---

**End of CLAUDE.md**

*This document is maintained for AI assistants working on the SudharsanBuilds codebase. Keep it updated when significant architectural changes occur.*
