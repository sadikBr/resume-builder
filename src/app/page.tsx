import ResumeBuilder from "@/components/resume-builder"
import AppHeader from "@/components/app-header"
import { LanguageProvider } from "@/components/language-provider"
import { ResumeStoreProvider } from "@/components/resume-store"

export default function Home() {
  return (
    <LanguageProvider>
      <ResumeStoreProvider>
        <div className="min-h-screen bg-muted/40">
          <AppHeader />
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
            <ResumeBuilder />
          </div>
        </div>
      </ResumeStoreProvider>
    </LanguageProvider>
  )
}
