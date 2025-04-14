export interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  title: string
  tagline: string
  summary: string
  website: string
  linkedin: string
  github: string
  photoUrl: string
}

export interface Education {
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  location: string
  description: string
}

export interface Experience {
  company: string
  position: string
  startDate: string
  endDate: string
  location: string
  responsibilities: string
}

export interface Project {
  name: string
  url: string
  description: string
  technologies: string
}

export interface Skill {
  category: string
  items: string
}

export interface Language {
  name: string
  proficiency: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  projects: Project[]
  languages: Language[]
}
