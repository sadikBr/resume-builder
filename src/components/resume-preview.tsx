import type { ResumeData } from "@/types/resume"
import { ExternalLink, Mail, Github, Linkedin } from "lucide-react"
import Image from "next/image"
import { Ref } from "react"

interface ResumePreviewProps {
  resumePreviewRef: Ref<HTMLDivElement>
  data: ResumeData
}

export default function ResumePreview({ data, resumePreviewRef }: ResumePreviewProps) {
  const { personalInfo, education, experience, skills, projects, languages } = data

  return (
    <div ref={resumePreviewRef} className="font-sans text-sm p-4 w-[595px] h-[842px] mx-auto border border-gray-200 shadow-sm bg-white">
      {/* Header with photo */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          {personalInfo.name && <h1 className="text-2xl font-bold text-gray-700">{personalInfo.name}</h1>}
          {personalInfo.tagline && <p className="text-gray-600 mt-1">{personalInfo.tagline}</p>}

          {/* Contact Info */}
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            {personalInfo.website && (
              <div className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-2" />
                <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {personalInfo.email && (
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-2" />
                <a href={`mailto:${personalInfo.email}`} className="hover:underline">
                  {personalInfo.email}
                </a>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center">
                <Linkedin className="h-3 w-3 mr-2" />
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "")}
                </a>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center">
                <Github className="h-3 w-3 mr-2" />
                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                </a>
              </div>
            )}
          </div>
        </div>
        {personalInfo.photoUrl && (
          <div className="ml-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
              <Image
                src={personalInfo.photoUrl || "/placeholder.svg"}
                alt="Profile"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3 uppercase">Education</h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="mb-3">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-gray-700">{edu.institution}</div>
                    <div className="text-gray-600 text-xs">
                      {edu.startDate} - {edu.endDate}
                    </div>
                    {edu.description && <p className="mt-1 text-sm">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3 uppercase">
                Professional Experiences
              </h2>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="mb-4">
                    <div className="font-medium">
                      {exp.position} | {exp.company}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {exp.startDate} - {exp.endDate} | {exp.location}
                    </div>
                    {exp.responsibilities && (
                      <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
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
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3 uppercase">Projects</h2>
              <div className="space-y-3">
                {projects.map((project, index) => (
                  <div key={index} className="mb-3">
                    <div className="font-medium">{project.name}</div>
                    {project.url && (
                      <div className="text-xs text-gray-600">
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {project.url}
                        </a>
                      </div>
                    )}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.split(",").map((tech, i) => (
                          <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.description && <p className="mt-1 text-sm">{project.description}</p>}
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
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3 uppercase">Skills</h2>
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <div className="font-medium text-sm">• {skill.category}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skill.items.split(",").map((item, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
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
              <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3 uppercase">Languages</h2>
              <div className="space-y-2">
                {languages.map((language, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="text-sm">• {language.name}</div>
                    <div className="text-xs text-gray-600">({language.proficiency})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

