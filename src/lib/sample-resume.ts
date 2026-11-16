import type { ResumeData } from "@/types/resume";
import ProfileImagePlaceholder from "@/assets/profile.png";

export const PLACEHOLDER_PHOTO = ProfileImagePlaceholder.src;

/**
 * Built-in sample resume for a fictional person: what a first-time visitor
 * sees, and what "Reset" restores. Real personal data never lives in this
 * file; it is served by /api/personal-resume to holders of the unlock code.
 */
export const sampleResumeData: ResumeData = {
  personalInfo: {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 014-2398",
    title: "Full-Stack Developer",
    tagline:
      "Product-minded developer with five years of experience building fast, accessible web applications, from database design to polished interfaces.",
    website: "https://example.com",
    linkedin: "https://www.linkedin.com/in/alex-morgan-example",
    github: "https://github.com/alex-morgan-example",
    photoUrl: PLACEHOLDER_PHOTO,
  },
  education: [
    {
      institution: "Westbrook University",
      degree: "Master of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2016",
      endDate: "2018",
      location: "Portland, USA",
      description:
        "Specialised in distributed systems and human-computer interaction. Thesis on offline-first web applications.",
    },
    {
      institution: "Westbrook University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Software Engineering",
      startDate: "2013",
      endDate: "2016",
      location: "Portland, USA",
      description: "Graduated with honours. Teaching assistant for the introductory programming course.",
    },
  ],
  experience: [
    {
      company: "Northwind Labs",
      position: "Senior Full-Stack Developer",
      startDate: "March 2022",
      endDate: "Present",
      location: "Remote",
      responsibilities:
        "Lead a team of four developers building a scheduling platform used by 2,000+ clinics\nCut page load times by 45% by moving rendering to the server and trimming client bundles\nDesigned the public REST API and its documentation, now used by 30 partner integrations\nMentor junior developers through code reviews and weekly pairing sessions",
    },
    {
      company: "Brightpath Software",
      position: "Full-Stack Developer",
      startDate: "July 2019",
      endDate: "February 2022",
      location: "Seattle, USA",
      responsibilities:
        "Built customer-facing dashboards in React and TypeScript for an analytics product\nMigrated a legacy PHP service to Node.js with zero downtime\nIntroduced end-to-end tests that reduced production incidents by a third",
    },
    {
      company: "Cobalt Systems",
      position: "Software Engineering Intern",
      startDate: "June 2018",
      endDate: "December 2018",
      location: "Portland, USA",
      responsibilities:
        "Developed internal tooling to automate weekly reporting\nImproved accessibility of the main web app to meet WCAG 2.1 AA",
    },
  ],
  skills: [
    { category: "Languages", items: "TypeScript, JavaScript, Python, SQL, Go" },
    { category: "Front-end", items: "React, Next.js, Tailwind CSS, Vue.js, Accessibility" },
    { category: "Back-end", items: "Node.js, Express, PostgreSQL, Redis, REST, GraphQL" },
    { category: "Tooling & Cloud", items: "Docker, GitHub Actions, AWS, Vercel, Playwright" },
    { category: "Soft Skills", items: "Mentoring, Technical Writing, Communication, Ownership" },
  ],
  projects: [
    {
      name: "Open Recipes",
      url: "https://github.com/alex-morgan-example/open-recipes",
      description: "Open-source recipe manager with offline support and shareable shopping lists.",
      technologies: "Next.js, TypeScript, IndexedDB",
    },
    {
      name: "Trailmarks",
      url: "https://example.com/trailmarks",
      description: "Mobile-friendly map app for logging hikes, with GPX import and elevation charts.",
      technologies: "React, Leaflet, Node.js, PostgreSQL",
    },
  ],
  languages: [
    { name: "English", proficiency: "Native" },
    { name: "French", proficiency: "Intermediate" },
    { name: "Spanish", proficiency: "Beginner" },
  ],
};
