import ResumeBuilder from "@/components/resume-builder"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Professional Resume Builder</h1>
      <p className="text-center text-muted-foreground mb-8">
        Create a professional resume in minutes. Fill in your details, see a real-time preview, and export to PDF.
      </p>
      <ResumeBuilder />
    </main>
  )
}
