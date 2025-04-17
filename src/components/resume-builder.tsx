"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoForm from "@/components/personal-info-form";
import EducationForm from "@/components/education-form";
import ExperienceForm from "@/components/experience-form";
import SkillsForm from "@/components/skills-form";
import ProjectsForm from "@/components/projects-form";
import LanguagesForm from "@/components/languages-form";
import ResumePreview from "@/components/resume-preview";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData } from "@/types/resume";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

import ProfileImagePlaceholder from '@/assets/profile.png';

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "Brahim SADIK",
      email: "brahimsadik98@gmail.com",
      phone: "+212 - 668424637",
      title: "Software Engineer",
      tagline:
        "Dynamic and motivated, passionate about software development and problem-solving, creating innovative solutions, and contributing to open-source projects.",
      website: "https://www.brahimsadik.com",
      linkedin: "https://www.linkedin.com/in/brahim-sadik",
      github: "https://www.github.com/sadikBr",
      photoUrl: ProfileImagePlaceholder.src,
    },
    education: [
      {
        institution: "National School of Applied Sciences",
        degree: "Engineering",
        fieldOfStudy: "Logistics and Supply Chain Management",
        startDate: "2018",
        endDate: "2021",
        location: "Marrakesh, Morocco",
        description:
          "Learned about logistics, supply chain management, and software development.",
      },
      {
        institution: "National School of Applied Sciences",
        degree: "Preparatory Classes",
        fieldOfStudy: "Core Curriculum",
        startDate: "2016",
        endDate: "2018",
        location: "Marrakesh, Morocco",
        description:
          "Learned the basics of programming languages such as C, C++, Matlab and also the engineering sciences.",
      },
      {
        institution: "Demnate Qualifying High School",
        degree: "Bachelor of Mathematics",
        fieldOfStudy: "Mathematical Sciences (A)",
        startDate: "2015",
        endDate: "2016",
        location: "Demnate, Morocco",
        description:
          "Accumulated knowledge in mathematics and statistics, developing problem-solving skills and analytical thinking.",
      },
    ],
    experience: [
      {
        company: "PercallGroup",
        position: "Technical Support Engineer",
        startDate: "01 August 2022",
        endDate: "01 April 2025",
        location: "Rabat, Morocco",
        responsibilities:
          "Providing technical support to PTC customers regarding Windchill PDMLink and Windchill ProjectLink (Administration and Functionality).\n Analyzing customer requirements and providing solutions through investigation (logs, stack traces, debugging, and analysis of the source code) and research in the KB\n Ensure solutions are provided in a timely manner and meet customer expectations\n Collaborate with the R&D teams to identify and resolve issues\n Write articles and publish them to PTC knowledge base.",
      },
      {
        company: "Capgemini Engineering",
        position: "Intern",
        startDate: "18 May 2022",
        endDate: "18 August 2022",
        location: "Casablanca, Morocco",
        responsibilities:
          "Built a fullstack application to calculate CO2 emissions related to company operations.\n Built the frontend using React and the backend using Node.js and Express and MongoDB.\n Used third party API's to get CO2 emission factors and calculate the emissions.",
      },
      {
        company: "AIC Metallurgie",
        position: "Intern",
        startDate: "01 April 2021",
        endDate: "01 August 2021",
        location: "Kenitra, Morocco",
        responsibilities:
          "Proposed a real time control method for welds.\n Studied the welding process and the control methods used in the company along with all the already existing methods.\n Planned the project using GANTT, PDCA, along with the functional analysis.\n Provided a non-destructive method for real time control using industry 4.0 concepts and AI.",
      },
    ],
    skills: [
      {
        category:
          "Strong Knowledge in Mathematics, Optimization, and Statistics",
        items:
          "Linear Algebra, Calculus, Probability, Machine Learning, Data Analysis",
      },
      {
        category: "Programming Languages",
        items: "C, C++, Python, Java SE",
      },
      {
        category: "Web Development",
        items: "HTML5, CSS3, JavaScript, TypeScript, Node.js, Deno",
      },
      {
        category: "Frameworks and Libraries",
        items:
          "React, Vue.js, Next.js, Express.js, Mongoose, Clerk, Drizzle, Prisma, Socket.io",
      },
      {
        category: "Database Management",
        items: "Oracle, MongoDB, PostgreSQL, MySQL",
      },
      {
        category: "Artificial Intelligence (Beginner)",
        items:
          "Algorithms, Supervised Learning, Linear Regression, Logistics Regression, Neural Networks",
      },
      {
        category: "Data Processing and Data Visualization",
        items:
          "Pandas, Matplotlib, Power BI (Beginner), Web Scraping, Data Cleaning, Data Transformation.",
      },
      {
        category: "Operating Systems and Tools",
        items: "Linux, Windows, Git, GitHub, Docker",
      },
      {
        category: "Soft Skills",
        items:
          "Communication, Collaboration, Time Management, Adaptability, Problem Solving, Critical Thinking",
      },
    ],
    projects: [
      {
        name: "Landing Page for my Portfolio WebSite",
        url: "https://www.brahimsadik.com",
        technologies: "Three.js, HTML5, CSS3, TypeScript",
        description: "",
      },
      {
        name: "Professional Resume Builder",
        url: "https://resume-builder.brahimsadik.com",
        description: "",
        technologies: "Next.js, TypeScript, TailwindCSS",
      },
    ],
    languages: [],
  });

  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleExportPDF = async () => {
    const element = resumePreviewRef.current;

    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 4,
        logging: false,
        useCORS: true,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
      });

      // Calculate the PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the image dimensions to fit the PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      pdf.addImage(imageData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save('resume.pdf');

      toast("PDF Exported Successfuly.", {
        description: "Your pdf file has been generated successfuly.",
      });
    } catch (err) {
      toast("Export Failed", {
        description: (err as Error).message,
      });
    }
  };

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
            <EducationForm
              data={resumeData.education}
              updateData={(data) => updateResumeData("education", data)}
            />
          </TabsContent>
          <TabsContent value="experience">
            <ExperienceForm
              data={resumeData.experience}
              updateData={(data) => updateResumeData("experience", data)}
            />
          </TabsContent>
          <TabsContent value="skills">
            <SkillsForm
              data={resumeData.skills}
              updateData={(data) => updateResumeData("skills", data)}
            />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsForm
              data={resumeData.projects}
              updateData={(data) => updateResumeData("projects", data)}
            />
          </TabsContent>
          <TabsContent value="languages">
            <LanguagesForm
              data={resumeData.languages}
              updateData={(data) => updateResumeData("languages", data)}
            />
          </TabsContent>
        </Tabs>
        <Button onClick={handleExportPDF} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Export as PDF
        </Button>
      </div>
      <div className="bg-white h-fit rounded-lg shadow-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Resume Preview</h2>
        <div className="bg-white">
          <ResumePreview
            resumePreviewRef={resumePreviewRef}
            data={resumeData}
          />
        </div>
      </div>
    </div>
  );
}
