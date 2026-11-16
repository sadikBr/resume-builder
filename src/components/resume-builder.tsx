"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoForm from "@/components/personal-info-form";
import EducationForm from "@/components/education-form";
import ExperienceForm from "@/components/experience-form";
import SkillsForm from "@/components/skills-form";
import ProjectsForm from "@/components/projects-form";
import LanguagesForm from "@/components/languages-form";
import LayoutForm from "@/components/layout-form";
import ResumePreview from "@/components/resume-preview";
import A4PageScaler from "@/components/a4-page-scaler";
import ExportMenu from "@/components/export-menu";
import {
  Briefcase,
  Eye,
  FolderGit2,
  GraduationCap,
  Languages as LanguagesIcon,
  LayoutTemplate,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ResumeData } from "@/types/resume";
import { useResumeStore } from "@/components/resume-store";
import { useLanguage } from "@/components/language-provider";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export default function ResumeBuilder() {
  const { resumeData, setResumeData, layout, setLayout, ready, revision } = useResumeStore();

  const { language, setLanguage, t } = useLanguage();

  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const [pageCount, setPageCount] = useState(1);

  const updateResumeData = <K extends keyof ResumeData>(section: K, data: ResumeData[K]) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const exportPages = async (pageIndices: number[]) => {
    const root = resumePreviewRef.current;
    if (!root) return;

    try {
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true,
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (const [n, index] of pageIndices.entries()) {
        const page = root.querySelector<HTMLElement>(`[data-resume-page="${index}"]`);
        if (!page) continue;

        const canvas = await html2canvas(page, {
          scale: 4,
          logging: false,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          // The on-screen preview is scaled down to fit; render the pages at
          // their real A4 size in the cloned document used for the capture.
          onclone: (clonedDoc) => {
            const scaler = clonedDoc.querySelector<HTMLElement>("[data-a4-scaler]");
            if (!scaler) return;
            scaler.style.transform = "none";
            scaler.style.setProperty("--hairline", "1px");
            const frame = scaler.parentElement;
            if (frame) {
              frame.style.width = "auto";
              frame.style.height = "auto";
              frame.style.overflow = "visible";
            }
          },
        });

        // Each captured page is exactly 210mm x 297mm, so it fills a PDF page.
        if (n > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      }

      pdf.save("resume.pdf");

      toast(t.preview.exported, {
        description: t.preview.exportedDescription,
      });
    } catch (err) {
      toast(t.preview.exportFailed, {
        description: (err as Error).message,
      });
    }
  };

  const tabs = t.tabs;
  const sections = [
    { value: "personal", icon: User, ...tabs.personal },
    { value: "education", icon: GraduationCap, count: resumeData.education.length, ...tabs.education },
    { value: "experience", icon: Briefcase, count: resumeData.experience.length, ...tabs.experience },
    { value: "skills", icon: Sparkles, count: resumeData.skills.length, ...tabs.skills },
    { value: "projects", icon: FolderGit2, count: resumeData.projects.length, ...tabs.projects },
    { value: "languages", icon: LanguagesIcon, count: resumeData.languages.length, ...tabs.languages },
    { value: "layout", icon: LayoutTemplate, ...tabs.layout },
  ] as const;

  const renderForm = (section: (typeof sections)[number]["value"]) => {
    switch (section) {
      case "personal":
        return <PersonalInfoForm data={resumeData.personalInfo} updateData={(data) => updateResumeData("personalInfo", data)} />;
      case "education":
        return <EducationForm data={resumeData.education} updateData={(data) => updateResumeData("education", data)} />;
      case "experience":
        return <ExperienceForm data={resumeData.experience} updateData={(data) => updateResumeData("experience", data)} />;
      case "skills":
        return <SkillsForm data={resumeData.skills} updateData={(data) => updateResumeData("skills", data)} />;
      case "projects":
        return <ProjectsForm data={resumeData.projects} updateData={(data) => updateResumeData("projects", data)} />;
      case "languages":
        return <LanguagesForm data={resumeData.languages} updateData={(data) => updateResumeData("languages", data)} />;
      case "layout":
        return <LayoutForm layout={layout} updateLayout={setLayout} data={resumeData} />;
    }
  };

  // Saved data loads right after mount; until then show placeholders rather
  // than flashing the sample resume.
  if (!ready) {
    return (
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2 xl:gap-8" aria-busy>
        <div className="space-y-4">
          <div className="h-[66px] animate-pulse rounded-xl border bg-background" />
          <div className="h-96 animate-pulse rounded-xl border bg-background" />
        </div>
        <div className="aspect-[210/297] animate-pulse rounded-xl border bg-background" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-8">
      <div className="min-w-0">
        {/* Forms keep their own editing state: remount them when the data is replaced (reset, other tab). */}
        <Tabs key={revision} defaultValue="personal" className="w-full gap-4">
          {/* Equal tiles (icon over label) keep the bar balanced in both languages. */}
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-xl border bg-background p-1.5 shadow-xs sm:grid-cols-7">
            {sections.map(({ value, label, icon: Icon, ...rest }) => (
              <TabsTrigger
                key={value}
                value={value}
                title={label}
                className={cn(
                  "group/tab relative h-auto min-w-0 flex-col gap-1 rounded-lg px-1 pt-2.5 pb-2 text-[12px] leading-none text-muted-foreground transition-colors",
                  "hover:bg-muted/70 hover:text-foreground",
                  "data-[state=active]:bg-primary/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  // Active indicator bar along the bottom of the tile.
                  "after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100",
                )}
              >
                <span className="relative">
                  <Icon className="size-[18px] transition-colors group-data-[state=active]/tab:text-primary" />
                  {"count" in rest && rest.count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-muted px-1 text-[9px] font-semibold tabular-nums text-muted-foreground ring-2 ring-background group-data-[state=active]/tab:bg-primary group-data-[state=active]/tab:text-primary-foreground">
                      {rest.count}
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map(({ value, label, description }) => (
            <TabsContent key={value} value={value} className="space-y-4">
              <div className="px-1">
                <h2 className="text-base font-semibold">{label}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              {renderForm(value)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="min-w-0 rounded-xl border bg-background p-4 shadow-xs sm:p-5 xl:sticky xl:top-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">{t.preview.title}</h2>
            {pageCount > 1 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {t.preview.pages(pageCount)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border bg-muted p-0.5" role="group" aria-label={t.preview.language}>
              {([["en", "EN"], ["fr", "FR"]] as const).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={language === code}
                  onClick={() => setLanguage(code)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    language === code
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <ExportMenu pageCount={pageCount} onExport={exportPages} />
          </div>
        </div>
        <div className="rounded-lg bg-muted/60 p-3 sm:p-4">
          <A4PageScaler>
            <ResumePreview
              resumePreviewRef={resumePreviewRef}
              data={resumeData}
              layout={layout}
              language={language}
              onPageCountChange={setPageCount}
            />
          </A4PageScaler>
        </div>
      </div>
    </div>
  );
}
