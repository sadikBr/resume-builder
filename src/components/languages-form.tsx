"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FormField from "@/components/form-field"
import SortableEntryList from "@/components/sortable-entry-list"
import type { Language } from "@/types/resume"
import { useLanguage } from "@/components/language-provider"
import { resumeTranslations } from "@/lib/i18n"

// Stored values stay in English; only the labels are translated.
const PROFICIENCY_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Beginner", "mother tongue"]

interface LanguagesFormProps {
  data: Language[]
  updateData: (data: Language[]) => void
}

const emptyLanguage = (): Language => ({ name: "", proficiency: "" })

export default function LanguagesForm({ data, updateData }: LanguagesFormProps) {
  const { t: ui, language: uiLanguage } = useLanguage()
  const t = ui.languages
  return (
    <SortableEntryList
      data={data}
      updateData={updateData}
      fallback={[emptyLanguage()]}
      createEmpty={emptyLanguage}
      addLabel={t.add}
      emptyTitle={t.empty}
      getTitle={(language) => language.name}
      getSubtitle={(language) => language.proficiency}
      renderFields={(language, { id, handleChange, setField }) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={`${id}-name`} label={t.name}>
            <Input id={`${id}-name`} name="name" placeholder={t.namePlaceholder} value={language.name} onChange={handleChange} />
          </FormField>
          <FormField id={`${id}-proficiency`} label={t.proficiency}>
            <Select value={language.proficiency} onValueChange={(value) => setField("proficiency", value)}>
              <SelectTrigger id={`${id}-proficiency`} className="w-full">
                <SelectValue placeholder={t.proficiencyPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {resumeTranslations[uiLanguage].proficiency[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      )}
    />
  )
}
