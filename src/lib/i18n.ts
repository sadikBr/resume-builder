export type ResumeLanguage = "en" | "fr";

export const resumeTranslations = {
  en: {
    education: "Education",
    experience: "Professional Experiences",
    projects: "Projects",
    skills: "Skills",
    languages: "Languages",
    proficiency: {
      Native: "Native",
      Fluent: "Fluent",
      Advanced: "Advanced",
      Intermediate: "Intermediate",
      Beginner: "Beginner",
      "mother tongue": "Mother Tongue",
    } as Record<string, string>,
  },
  fr: {
    education: "Formation",
    experience: "Expériences Professionnelles",
    projects: "Projets",
    skills: "Compétences",
    languages: "Langues",
    proficiency: {
      Native: "Natif",
      Fluent: "Courant",
      Advanced: "Avancé",
      Intermediate: "Intermédiaire",
      Beginner: "Débutant",
      "mother tongue": "Langue maternelle",
    } as Record<string, string>,
  },
} as const;
