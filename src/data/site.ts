// All page copy outside the featured projects lives here. Facts come from the résumé; prose I drafted
// from it is marked `// DRAFT` so it can be reviewed (`grep -rn DRAFT src`).
import type { ImageMetadata } from 'astro';
import portraitImage from '../assets/portrait.jpg';
import spruceMeadowsPhoto from '../assets/experience/spruce-meadows.jpg';
import wooferShot from '../assets/more-projects/woofer.jpg';
import classroomShot from '../assets/more-projects/classroom.jpg';
import musicShot from '../assets/more-projects/music.jpg';

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
  experience: {
    role: string;
    org: string;
    place: string;
    dates: string;
    bullets: string[];
    photo?: { image: ImageMetadata; alt: string; credit?: string };
  }[];
  skills: { group: string; items: string[] }[];
  moreProjects: { title: string; year: string; tech: string; text: string; href?: string; image?: { src: ImageMetadata; alt: string } }[];
  beyond: { title: string; text: string }[];
  contact: {
    blurb: string;
    email: string;
    links: (Link & { kind: 'email' | 'phone' | 'linkedin' | 'github' })[];
  };
}

export const site: SiteConfig = {
  name: 'Joseph Mills',
  initials: 'JM',
  tagline: 'Software Engineer · AI/ML · Calgary',
  status: 'Open to Winter 2027 co-ops', // switch to 'Open to junior roles' after graduation
  summary: 'I build software end to end, from a custom Chromium browser to LLM apps and open-source ML research.', // DRAFT wording
  portrait: portraitImage, // remove this line to fall back to the monogram placeholder
  location: 'Calgary, AB',
  resume: '/resume.pdf',
  about: [
    "I'm a fourth-year Computer Science student at Mount Royal University, looking for a Winter 2027 co-op in software engineering, with machine learning as a strong second interest.", // DRAFT wording
    "Right now I'm a software engineer and machine learning research assistant at Mount Royal. I built SplitBench, an open-source Python framework for training AI across many devices without sharing their data, and co-authored a paper accepted at IEEE IRI 2026.", // DRAFT wording
    'I like owning a project from the first commit to something people can use: shipping a browser with signed automatic updates, deploying a translation app on a 512 MB server, or building an agent that ranks which city water mains to inspect first.', // DRAFT wording
    'Before software I was a biathlete on Team Alberta and later coached junior athletes. It taught me to work well under pressure and to explain technical things clearly.', // DRAFT wording
  ],
  glance: [
    { label: 'Education', value: 'BSc Computer Science, Mount Royal University (expected Dec 2027), CGPA 3.59' },
    { label: 'Awards', value: 'NSERC Undergraduate Student Research Award, Dean’s Honour Roll' },
    { label: 'Based in', value: 'Calgary, AB' },
    { label: 'Focus', value: 'Software engineering, machine learning' },
    { label: 'GitHub', value: 'JD-D3V', href: 'https://github.com/JD-D3V' },
    { label: 'LinkedIn', value: 'joseph-mills317', href: 'https://www.linkedin.com/in/joseph-mills317' },
  ],
  experience: [
    {
      role: 'Software Engineer and Machine Learning Research Assistant',
      org: 'Mount Royal University',
      place: 'Calgary, AB',
      dates: 'Jan 2026 – Present',
      bullets: [
        'Built SplitBench, an open-source Python framework for training AI across many devices without sharing their data, comparing 7 methods on 7 datasets.',
        'Co-authored a paper accepted at IEEE IRI 2026 and took part in regular code reviews with the research supervisor.',
        'Built a Python scheduler that splits AI training across devices based on their hardware and network speed, predicting training time within 2%.',
        'Simulated slow machines and networks in 27 Docker setups so any experiment reruns with one command, and automated 80+ unattended PowerShell runs.',
        'Nearly doubled results on rare classes in medical image data (28% → 52% F1) using PyTorch.',
      ],
    },
    {
      role: 'Data Science Intern',
      org: 'Miistakis Institute',
      place: 'Calgary, AB',
      dates: 'Jan 2026 – Mar 2026',
      bullets: [
        'Fixed mapping errors across a 260,000-polygon geodatabase with GeoPandas so data from different sources lined up.',
        'Interviewed staff to find their slowest manual task, then replaced their multi-day Excel process with a Python pipeline that runs in minutes.',
        'Wrote the report used to brief external stakeholders, translating biodiversity statistics (SciPy) into plain-language findings.',
      ],
    },
    {
      role: 'Jump Crew and Signage Team',
      org: 'Spruce Meadows',
      place: 'Calgary, AB',
      dates: 'May 2023 – Sep 2025',
      bullets: [
        'Completed full course changes in 5-minute commercial breaks at live televised events by coordinating the crew.',
        'Planned weekly signage tasks with upper management and trained the incoming summer manager the next season.',
      ],
      photo: {
        image: spruceMeadowsPhoto,
        alt: 'Joseph running across the grass at a Spruce Meadows show-jumping event carrying a jump pole',
      },
    },
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'Java', 'Go', 'TypeScript', 'JavaScript', 'SQL', 'C++', 'Rust', 'C', 'Haskell', 'R', 'C#'] },
    {
      group: 'ML, AI & Data',
      items: ['PyTorch', 'ONNX', 'TensorFlow Lite', 'LangGraph', 'Gemini', 'RAG', 'Qdrant', 'pandas', 'GeoPandas', 'SciPy', 'Power BI', 'Databricks'],
    },
    { group: 'Web & Backend', items: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'REST APIs', 'Postgres', 'SQLite', 'Redis'] },
    {
      group: 'DevOps & Tools',
      items: ['Docker', 'CI/CD', 'GitHub Actions', 'Linux', 'Git', 'PowerShell', 'Playwright', 'AWS', 'Azure', 'Vercel', 'Supabase', 'Kubernetes', 'Agile/Scrum'],
    },
  ],
  moreProjects: [
    {
      title: 'Woofer',
      year: '2026',
      tech: 'JavaScript · TypeScript · Go · Next.js · Postgres',
      text: 'A dog adoption app on Next.js, live on Vercel, where adopters browse dogs and shelters review applicants. The Go REST API on Postgres covers listings, matches and messaging, with login required on every endpoint.',
      href: 'https://woofer-web-ashen.vercel.app',
      image: { src: wooferShot, alt: 'Woofer home page: swipe right on your new best friend, with a cartoon golden retriever' },
    },
    {
      title: 'Classroom Finder',
      year: '2025',
      tech: 'React · TypeScript · Python · Playwright',
      text: 'A React/TypeScript web app and Telegram bot that read the university timetable to show which classrooms are free, backed by a Python REST API.',
      href: 'https://jd-d3v.github.io/Class-Finder',
      image: { src: classroomShot, alt: 'Classroom Finder (MRU Finder) listing which rooms are free now' },
    },
    {
      title: 'Music Browser',
      year: '2026',
      tech: 'JavaScript · React · Node.js · Express · SQLite',
      text: 'A music catalogue app with filtering and sorting, charts comparing 6 audio measurements per song, and a feature that finds the 3 most similar tracks.',
      href: 'https://jd-d3v.github.io/COMP4513Assign2',
      image: { src: musicShot, alt: 'Music Browser home page with a wall of artist photos and the headline Discover Music' },
    },
    {
      title: 'Multi-Threaded Web Server',
      year: '2025',
      tech: 'C · POSIX Threads · Sockets · Linux',
      text: 'The thread pool and producer-consumer request queue for an HTTP server in C, built with a team of 3. It sheds load when the queue is full and has a live dashboard of queue size and total requests.',
      href: 'https://github.com/JSenk347/web-server',
    },
  ],
  beyond: [
    {
      title: 'Biathlon, Team Alberta',
      text: 'I competed from 2013 to 2020: gold at the North American Championships, bronze at the Canadian National Championships, and 11 hours of training a week for 5 years while finishing high school.', // DRAFT wording
    },
    {
      title: 'Coaching',
      text: 'I coached junior biathletes at Bragg Creek Nordic for four seasons, running training, supervising range safety, and preparing new athletes for their first provincial races. Biathlon Alberta gave me the 2021 Ruedi Setz Memorial Award for developing the sport in the province.', // DRAFT wording
    },
    {
      title: 'Hackathons',
      text: 'My team won Best Project Built with ElevenLabs at the IEEE Southern Alberta Industry Hackathon 2026, and I built a peer-to-peer payment app in 24 hours at MRUHacks.', // DRAFT wording
    },
  ],
  contact: {
    blurb: "I'm looking for a Winter 2027 co-op. If you're hiring, or just want to talk about something I built, I'd love to hear from you.", // DRAFT wording
    email: 'jmill004@mtroyal.ca',
    links: [
      { kind: 'email', label: 'jmill004@mtroyal.ca', href: 'mailto:jmill004@mtroyal.ca' },
      { kind: 'phone', label: '403-370-8406', href: 'tel:+14033708406' },
      { kind: 'linkedin', label: 'linkedin.com/in/joseph-mills317', href: 'https://www.linkedin.com/in/joseph-mills317' },
      { kind: 'github', label: 'github.com/JD-D3V', href: 'https://github.com/JD-D3V' },
    ],
  },
};
