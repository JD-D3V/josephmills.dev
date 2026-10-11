// All page copy outside the projects lives here. Placeholder strings are marked
// `// DRAFT`; find them with `grep -rn DRAFT src`.
import type { ImageMetadata } from 'astro';

export interface Link {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  initials: string;
  tagline: string;
  status: string;
  summary: string;
  portrait?: ImageMetadata;
  location: string;
  resume?: string;
  about: string[];
  glance: { label: string; value: string; href?: string }[];
  skills: { group: string; items: string[] }[];
  beyond: { title: string; text: string }[];
  contact: { blurb: string; email: string; links: (Link & { kind: 'email' | 'linkedin' | 'github' })[] };
}

export const site: SiteConfig = {
  name: 'Joseph Mills',
  initials: 'JM',
  tagline: 'Software Engineer · AI/ML · Calgary',
  status: 'Open to Winter 2027 co-ops', // switch to 'Open to junior roles' after graduation
  summary:
    'I build software end to end, from a de-Googled Chromium browser to multi-agent AI systems and cellular IoT alerting.', // DRAFT
  // portrait: portraitImage, // DRAFT: import a photo from src/assets and set it here
  location: 'Calgary, AB', // DRAFT confirm
  resume: '/resume.pdf', // DRAFT placeholder PDF, replace public/resume.pdf
  about: [
    "I'm a fourth-year student looking for a Winter 2027 co-op in software engineering, with a strong second interest in AI and machine learning.", // DRAFT
    'Most of what I build starts as a problem I want solved: a browser without the tracking, a translation pipeline that keeps names consistent across a million words, a sensor that texts me before a pump house freezes.', // DRAFT
    'I like owning a project from the first commit to something people can install or rely on, including the unglamorous parts like packaging, signing updates, and alerting.', // DRAFT
  ],
  glance: [
    { label: 'Education', value: '4th-year student, Mount Royal University' }, // DRAFT confirm
    { label: 'Based in', value: 'Calgary, AB' }, // DRAFT confirm
    { label: 'Focus', value: 'Software engineering, AI/ML' }, // DRAFT
    { label: 'GitHub', value: 'JD-D3V', href: 'https://github.com/JD-D3V' },
    { label: 'LinkedIn', value: 'Add profile URL', href: 'https://www.linkedin.com/in/' }, // DRAFT replace with real profile
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Go', 'C#', 'C++', 'Rust', 'C', 'SQL'] }, // DRAFT
    { group: 'AI/ML', items: ['LangGraph', 'RAG', 'Qdrant', 'pgvector', 'Gemini API', 'PyTorch', 'ONNX'] }, // DRAFT
    { group: 'Web', items: ['Astro', 'Next.js', 'FastAPI', 'Node.js', 'HTML/CSS'] }, // DRAFT
    { group: 'Systems', items: ['Chromium builds', 'Windows packaging', 'ESP32 firmware'] }, // DRAFT
    { group: 'Cloud & Tools', items: ['AWS', 'Docker', 'Cloudflare', 'Git', 'GitHub Actions', 'PostgreSQL'] }, // DRAFT
  ],
  beyond: [
    { title: 'Reading web novels', text: 'Placeholder: the reason beyonder exists. Replace with your own hobby and a sentence about it.' }, // DRAFT
    { title: 'Tinkering with hardware', text: 'Placeholder: ESP32 boards, sensors, and the occasional soldering mishap.' }, // DRAFT
  ],
  contact: {
    blurb: "I'm looking for a Winter 2027 co-op. If you're hiring, or just want to talk about something I built, I'd love to hear from you.", // DRAFT
    email: 'hello@josephmills.dev', // DRAFT confirm the public address
    links: [
      { kind: 'email', label: 'hello@josephmills.dev', href: 'mailto:hello@josephmills.dev' }, // DRAFT
      { kind: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/' }, // DRAFT replace with real profile
      { kind: 'github', label: 'github.com/JD-D3V', href: 'https://github.com/JD-D3V' },
    ],
  },
};
