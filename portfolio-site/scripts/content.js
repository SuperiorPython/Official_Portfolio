/*
 * content.js: single source of truth for the IDE portfolio.
 * Every file in the explorer and every Run card is generated from this data,
 * so the code view and the cards can never disagree.
 * Content mirrors the current portfolio (index.html) as of Oct 2026.
 */
window.PORTFOLIO = {
  owner: {
    name: 'Bryson A. Wingate',
    shortName: 'Bryson Wingate',
    title: 'Full-Stack Developer · Data & Systems Engineer',
    photo: 'assets/main/bryson-image.jpeg',
    logo: 'assets/main/portfolio-symbol.png',
    resume: 'assets/main/Bryson_Wingate_Resume_2026.pdf',
  },

  projects: [
    // ---------------- published ----------------
    {
      id: 'ecowatch',
      file: 'ecowatch.js',
      lang: 'js',
      status: 'published',
      name: 'EcoWatch',
      description:
        'A real-time environmental dashboard visualizing weather conditions, air quality, and atmospheric data through a clean, interactive interface.',
      skills: ['HTML', 'JavaScript', 'OpenWeather API'],
      links: {
        site: 'https://ecowatch-dashboard.netlify.app/',
        repo: 'https://github.com/SuperiorPython/EcoWatch',
      },
      image: 'assets/projects/ecowatch-image.png',
    },
    {
      id: 'playlist-dna',
      file: 'playlist_dna.py',
      lang: 'py',
      status: 'published',
      name: 'Playlist DNA',
      description:
        'An analytics tool that breaks down Spotify playlists into genre, artist, and vibe signatures using interactive visualizations.',
      skills: ['Python', 'Streamlit', 'Spotify API', 'OpenAI API'],
      links: {
        site: 'https://playlistdna.streamlit.app/',
        repo: 'https://github.com/SuperiorPython/Playlist-DNA-App',
      },
      image: 'assets/projects/playlist-dna-image.png',
    },
    {
      id: 'astrolabe',
      file: 'astrolabe.ts',
      lang: 'ts',
      status: 'published',
      name: 'Astrolabe',
      description:
        "An interactive space dashboard built on NASA's public APIs: astronomy pictures, exoplanets, space weather, live ISS tracking, and near-Earth asteroid close approaches, launched from a 3D globe in a mission-ops interface.",
      skills: ['React', 'TypeScript', 'Express', 'NASA APIs'],
      links: {
        site: 'https://orbital-astrolabe.netlify.app/',
        repo: 'https://github.com/SuperiorPython/Astrolabe',
      },
      image: 'assets/projects/astrolabe-image.png',
    },

    // ---------------- wip ----------------
    {
      id: 'kernelforge',
      file: 'kernelforge.py',
      lang: 'py',
      status: 'wip',
      name: 'KernelForge',
      description:
        'An AI-powered GPU kernel optimizer built as a four-person senior design project. As LLM Optimization Engine Lead, I build the pipeline that prompts a local LLM to generate and refine optimized CUDA/Triton kernels.',
      skills: ['Python', 'CUDA', 'Triton', 'Ollama'],
      links: { site: null, repo: null },
      image: 'assets/projects/wip-icon.png',
    },
    {
      id: 'ionfall',
      file: 'ionfall.cs',
      lang: 'cs',
      status: 'wip',
      name: 'Ionfall',
      description:
        'A 2D top-down tower defense game with roguelite scoring: defend a degrading dome with a heat-limited turret, manage an ion economy across a day/night cycle, and survive a final escalating "corporate shutdown."',
      skills: ['Unity', 'C#', 'Game Design'],
      links: { site: null, repo: null },
      image: 'assets/projects/wip-icon.png',
    },
  ],

  // Newest first, matching the current site's order.
  experience: [
    {
      id: 'codepath-2026',
      file: 'codepath_2026.yml',
      company: 'CodePath',
      role: 'Tech Fellow (Teaching Assistant) - Intro to Python',
      location: 'North Carolina A&T State University · Greensboro, NC',
      period: 'Aug 2026 - Present',
      current: true,
      bullets: [
        'Currently in progress: leading weekly labs and one-on-one debugging support for students learning Python fundamentals and algorithmic thinking.',
      ],
      logo: 'assets/companies/codepath-image.png',
    },
    {
      id: 'expedia',
      file: 'expedia.yml',
      company: 'Expedia Group',
      role: 'Cloud Engineering Intern',
      location: 'San Jose, CA',
      period: 'May 2026 - July 2026',
      current: false,
      bullets: [
        'Built and deployed a production MCP server on Kubernetes exposing 5 custom observability tools over a 23.7 billion-row OTel ClickHouse dataset, enabling natural language querying of telemetry data.',
        'Designed query guardrails blocking DDL/DML operations and multi-statement injection attempts, with automatic LIMIT injection and time-range enforcement to prevent unbounded queries against production data.',
        'Built a K6 performance test framework across 6 load scenarios (baseline, spike, soak, multi-tool) with JWT bearer auth, sustaining 133 requests/sec at 230ms p95 latency with zero errors across all scenarios.',
      ],
      logo: 'assets/companies/expedia-image.png',
    },
    {
      id: 'xplus-lab',
      file: 'xplus_lab.yml',
      company: 'X+ Intelligence Lab',
      role: 'Undergraduate Research Assistant',
      location: 'North Carolina A&T State University · Greensboro, NC',
      period: 'Spring 2026',
      current: false,
      bullets: [
        'Trained a PyTorch semantic segmentation model to detect and localize weeds in agricultural images, evaluated using pixel accuracy and IoU metrics.',
        'Built a custom data pipeline for image preprocessing, mask labeling, and train/validation evaluation.',
        'Monitored loss and performance trends to improve model generalization for autonomous farming applications.',
      ],
      logo: 'assets/companies/ncat-image.png',
    },
    {
      id: 'codepath-2025',
      file: 'codepath_2025.yml',
      company: 'CodePath',
      role: 'Tech Fellow (Teaching Assistant) - Intro to Python',
      location: 'North Carolina A&T State University · Greensboro, NC',
      period: 'Aug 2025 - Dec 2025',
      current: false,
      bullets: [
        'Led weekly labs and debugging sessions supporting students learning Python fundamentals and algorithmic thinking.',
        'Created hands-on examples, walkthroughs, and mini-lessons to guide students through loops, functions, dictionaries, and class structures.',
        'Provided one-on-one student support and contributed to improving learning outcomes across the course.',
      ],
      logo: 'assets/companies/codepath-image.png',
    },
    {
      id: 'cisco',
      file: 'cisco.yml',
      company: 'Cisco Systems',
      role: 'Software Engineering Intern',
      location: 'Durham, NC',
      period: 'May 2025 - August 2025',
      current: false,
      bullets: [
        'Developed features for an internal AI-powered Jira assistant by building and refining cloud infrastructure components.',
        'Worked extensively with AWS services including EC2, Auto Scaling Groups, Load Balancers, and Route 53 to deploy scalable backend systems.',
        'Collaborated with full-stack engineers to enhance service reliability, logging, and monitoring across cloud environments.',
      ],
      logo: 'assets/companies/cisco-image.png',
    },
  ],

  about: {
    file: 'about.json',
    school: 'North Carolina A&T State University',
    major: 'Computer Science',
    year: 'Senior',
    paragraphs: [
      'I am Bryson Wingate, a senior Computer Science student at North Carolina A&T State University with a focus on building efficient, data-driven applications, especially in Python. What began as curiosity about automation and simple scripting has grown into a passion for creating systems that simplify workflows, reveal insights, and make technology feel intuitive.',
      'I enjoy taking complex or unstructured problems and turning them into clean, maintainable solutions. Whether I am working with APIs, shaping data pipelines, or improving backend logic, I care about writing readable code, understanding how systems operate behind the scenes, and continually strengthening my technical foundation as I grow as a developer.',
      'Outside of coding, you can usually find me at the movie theater watching new sci-fi or action films, or at home building LEGO sets one piece at a time. I am drawn to anything that blends creativity, design, and imagination, and that mindset often influences the way I build and think about software.',
    ],
    interests: ['sci-fi and action films', 'LEGO'],
  },

  skills: {
    file: 'skills.yml',
    subtitle: 'A snapshot of the languages, frameworks, and tools I rely on most.',
    items: [
      { name: 'Python', icon: 'assets/skills/python-icon.png' },
      { name: 'Java', icon: 'assets/skills/java-icon.png' },
      { name: 'C++', icon: 'assets/skills/cplus-icon.png' },
      { name: 'JavaScript', icon: 'assets/skills/jscript-icon.png' },
      { name: 'HTML & CSS', icon: 'assets/skills/html-icon.png' },
      { name: 'React', icon: 'assets/skills/react-icon.png' },
      { name: 'Node.js', icon: 'assets/skills/nodejs-icon.png' },
      { name: 'SQL', icon: 'assets/skills/sql-icon.png' },
      { name: 'APIs & REST', icon: 'assets/skills/api-icon.png' },
      { name: 'Amazon Web Services', icon: 'assets/skills/aws-icon.png' },
      { name: 'Git & GitHub', icon: 'assets/skills/git-icon.png' },
      { name: 'Streamlit', icon: 'assets/skills/streamlit-icon.png' },
      { name: 'Google Cloud', icon: 'assets/skills/gcloud-icon.png' },
    ],
  },

  contact: {
    file: 'contact.env',
    blurb:
      'Interested in collaborating, discussing ideas, or learning more about my work? Feel free to connect with me on LinkedIn, explore my projects on GitHub, or reach out directly via email.',
    email: 'bawingate@aggies.ncat.edu',
    linkedin: 'https://www.linkedin.com/in/bryson-wingate/',
    github: 'https://github.com/SuperiorPython',
    icons: {
      email: 'assets/contact/gmail-icon.png',
      linkedin: 'assets/contact/linkedin-icon.png',
      github: 'assets/contact/github-icon.png',
    },
    quote: { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  },
};
