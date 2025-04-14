"use client"

import { useState, useRef } from "react"
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

  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleExportPDF = async () => {
    const element = resumePreviewRef.current

    if (element) {
      const options = {
        margin: [0, 0, 0, 0],
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 4, useCORS: true },
        jdPDF: { unit: 'px', format: 'a4', orientation: 'portrait' },
      }

      try {
        await html2pdf().set(options).from(element).save()

        toast("PDF Exported Successfuly.", {
          description: "Your pdf file has been generated successfuly."
        })
      } catch (_err) {
        toast("Export Failed", {
          description: "There was an error while generating your pdf file. Please try again later."
        })
      }
    }

    // Configure pdf options
    // const opt = {
    //   margin: [0, 0, 0, 0],
    //   filename: `${resumeData.personalInfo.name || "Resume"}_${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`,
    //   image: { type: "jpeg", quality: 0.98 },
    //   html2canvas: { scale: 2, useCORS: true },
    //   jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    // }
    //
    // try {
    //   // Generate and download PDF
    //   await html2pdf().set(opt).from(element).save()
    //
    //   toast("PDF Export Successful", {
    //     description: "Your resume has been downloaded as a PDF.",
    //   })
    // } catch (_error) {
    //   toast("Export Failed", {
    //     description: "There was an error exporting your resume. Please try again.",
    //   })
    // }
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
        <div className="bg-white">
          <ResumePreview resumePreviewRef={resumePreviewRef} data={resumeData} />
        </div>
      </div>
    </div>
  )
}

