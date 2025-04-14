"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PersonalInfoForm from "@/components/personal-info-form"
import EducationForm from "@/components/education-form"
import ExperienceForm from "@/components/experience-form"
import SkillsForm from "@/components/skills-form"
import ProjectsForm from "@/components/projects-form"
import LanguagesForm from "@/components/languages-form"
import ResumePreview from "@/components/resume-preview"
import { Download } from "lucide-react"
import { toast } from 'sonner';
import type { ResumeData } from "@/types/resume"

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      title: "",
      tagline: "",
      summary: "",
      website: "",
      linkedin: "",
      github: "",
      photoUrl: "/placeholder.svg?height=96&width=96",
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    languages: [],
  })

  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleExportPDF = () => {
    // In a real implementation, this would use a library like jsPDF or html2pdf
    // to convert the resume preview to a PDF document
    toast("PDF Export", {
      description: "Your resume has been exported as a PDF.",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <PersonalInfoForm
              data={resumeData.personalInfo}
              updateData={(data) => updateResumeData("personalInfo", data)}
            />
          </TabsContent>
          <TabsContent value="education">
            <EducationForm data={resumeData.education} updateData={(data) => updateResumeData("education", data)} />
          </TabsContent>
          <TabsContent value="experience">
            <ExperienceForm data={resumeData.experience} updateData={(data) => updateResumeData("experience", data)} />
          </TabsContent>
          <TabsContent value="skills">
            <SkillsForm data={resumeData.skills} updateData={(data) => updateResumeData("skills", data)} />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsForm data={resumeData.projects} updateData={(data) => updateResumeData("projects", data)} />
          </TabsContent>
          <TabsContent value="languages">
            <LanguagesForm data={resumeData.languages} updateData={(data) => updateResumeData("languages", data)} />
          </TabsContent>
        </Tabs>
        <Button onClick={handleExportPDF} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Export as PDF
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Resume Preview</h2>
        <div className="bg-white overflow-auto max-h-[800px]">
          <ResumePreview data={resumeData} />
        </div>
      </div>
    </div>
  )
}

