import type { ResumeData } from "@/types/resume";
import { ExternalLink, Mail, Github, Linkedin } from "lucide-react";
import Image from "next/image";
import { Ref } from "react";

interface ResumePreviewProps {
  resumePreviewRef: Ref<HTMLDivElement>;
  data: ResumeData;
}

export default function ResumePreview({
  data,
  resumePreviewRef,
}: ResumePreviewProps) {
  const { personalInfo, education, experience, skills, projects, languages } =
    data;

  return (
    <div
      ref={resumePreviewRef}
      className="font-sans text-sm p-4 w-[210mm] h-[297mm] mx-auto shadow-sm bg-white"
    >
      {/* Header with photo */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          {personalInfo.name && (
            <div className="text-destructive">
              <span className="text-2xl font-bold text-gray-700 mr-4">
                {personalInfo.name}
              </span>{" "}
              {personalInfo.title}
            </div>
          )}
          {personalInfo.tagline && (
            <p className="text-gray-600">{personalInfo.tagline}</p>
          )}

          {/* Contact Info */}
          <div className="my-1 text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-4">
              {personalInfo.email && (
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="hover:underline"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center">
                  <Linkedin className="h-3 w-3 mr-1" />
                  <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {personalInfo.linkedin.replace(
                      /^https?:\/\/(www\.)?linkedin\.com\//,
                      "",
                    )}
                  </a>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <a
                    href={`tele:${personalInfo.phone}`}
                    className="hover:underline"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {personalInfo.website && (
                <div className="flex items-center">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <a
                    href={personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center">
                  <Github className="h-3 w-3 mr-1" />
                  <a
                    href={personalInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {personalInfo.github.replace(
                      /^https?:\/\/(www\.)?github\.com\//,
                      "",
                    )}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        {personalInfo.photoUrl && (
          <div className="ml-4">
            <div className="w-30 aspect-square rounded-full overflow-hidden">
              <Image
                src={personalInfo.photoUrl}
                alt="Profile"
                width={136}
                height={136}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Column */}
        <div className="flex-1 space-y-2">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2 uppercase">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu, index) => (
                  <div key={index}>
                    <div className="font-medium">
                      {edu.degree} - {edu.fieldOfStudy}
                    </div>
                    <div className="text-gray-700">
                      {edu.institution} - {edu.location}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {edu.startDate} - {edu.endDate}
                    </div>
                    {edu.description && (
                      <p className="mt-1 text-xs">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2 uppercase">
                Professional Experiences
              </h2>
              <div className="space-y-2">
                {experience.map((exp, index) => (
                  <div key={index}>
                    <div className="font-medium">
                      {exp.position} | {exp.company}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {exp.startDate} - {exp.endDate} | {exp.location}
                    </div>
                    {exp.responsibilities && (
                      <ul className="list-disc ml-5 my-1 text-xs">
                        {exp.responsibilities.split("\n").map((item, i) => (
                          <li key={i}>{item.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2 uppercase">
                Projects
              </h2>
              <div className="space-y-1">
                {projects.map((project, index) => (
                  <div key={index}>
                    <div className="font-medium mb-1">
                      {project.name}
                      {" - "}
                      {project.url && (
                        <span className="text-xs text-gray-600">
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {project.url}
                          </a>
                        </span>
                      )}
                    </div>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.split(",").map((tech, i) => (
                          <span
                            key={i}
                            className="bg-white border border-blue-950 font-semibold text-blue-950 px-2 py-0.5 rounded text-xs"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.description && (
                      <p className="mt-1 text-sm">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full md:w-64 space-y-6">
          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3 uppercase">
                Skills
              </h2>
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <div className="font-medium text-sm">
                      • {skill.category}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skill.items.split(",").map((item, i) => (
                        <span
                          key={i}
                          className="bg-white border border-blue-950 font-semibold text-blue-950 px-2 py-0.5 rounded text-xs"
                        >
                          {item.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3 uppercase">
                Languages
              </h2>
              <div className="space-y-2">
                {languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="text-sm">• {language.name}</div>
                    <div className="text-xs text-gray-600">
                      ({language.proficiency})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
