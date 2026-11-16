export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  title: string;
  tagline: string;
  website: string;
  linkedin: string;
  github: string;
  photoUrl: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string;
}

export interface Project {
  name: string;
  url: string;
  description: string;
  technologies: string;
}

export interface Skill {
  category: string;
  items: string;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  languages: Language[];
}

export type SectionId = "education" | "experience" | "projects" | "skills" | "languages";

export type ColumnId = "main" | "side";

export interface LayoutSection {
  id: SectionId;
  column: ColumnId;
  visible: boolean;
}

/** Every piece of text on the resume whose size can be customised. */
export type TextRole =
  | "name"
  | "title"
  | "tagline"
  | "contact"
  | "sectionTitle"
  | "entryTitle"
  | "organisation"
  | "meta"
  | "body"
  | "skillCategory"
  | "tags"
  | "languages";

export interface ResumeLayout {
  /** 1 = everything stacked full-width, 2 = main column + sidebar. */
  columns: 1 | 2;
  sidebarPosition: "left" | "right";
  /** Sidebar share of the page width, in percent. */
  sidebarWidth: number;
  sidebarStyle: "plain" | "tinted";
  accent: string;
  skillStyle: "chips" | "inline";
  /** Font size of each text role, in CSS px at A4 size. */
  fontSizes: Record<TextRole, number>;
  /** Global section order; in two-column mode each column keeps the relative order. */
  sections: LayoutSection[];
}
