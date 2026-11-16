"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormField from "@/components/form-field"
import SortableEntryList from "@/components/sortable-entry-list"
import type { Education } from "@/types/resume"
import { useLanguage } from "@/components/language-provider"

interface EducationFormProps {
  data: Education[]
  updateData: (data: Education[]) => void
}

const emptyEducation = (): Education => ({
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  location: "",
  description: "",
})

export default function EducationForm({ data, updateData }: EducationFormProps) {
  const { t: ui } = useLanguage()
  const t = ui.education
  const c = ui.common
  return (
    <SortableEntryList
      data={data}
      updateData={updateData}
      fallback={[emptyEducation()]}
      createEmpty={emptyEducation}
      addLabel={t.add}
      emptyTitle={t.empty}
      getTitle={(edu) => [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" · ")}
      getSubtitle={(edu) =>
        [edu.institution, [edu.startDate, edu.endDate].filter(Boolean).join(" – ")]
          .filter(Boolean)
          .join(" · ")
      }
      renderFields={(edu, { id, handleChange }) => (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-institution`} label={t.institution}>
              <Input id={`${id}-institution`} name="institution" placeholder={t.institutionPlaceholder} value={edu.institution} onChange={handleChange} />
            </FormField>
            <FormField id={`${id}-location`} label={c.location}>
              <Input id={`${id}-location`} name="location" placeholder={c.locationPlaceholder} value={edu.location} onChange={handleChange} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-degree`} label={t.degree}>
              <Input id={`${id}-degree`} name="degree" placeholder={t.degreePlaceholder} value={edu.degree} onChange={handleChange} />
            </FormField>
            <FormField id={`${id}-fieldOfStudy`} label={t.fieldOfStudy}>
              <Input id={`${id}-fieldOfStudy`} name="fieldOfStudy" placeholder={t.fieldOfStudyPlaceholder} value={edu.fieldOfStudy} onChange={handleChange} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-startDate`} label={c.startDate}>
              <Input id={`${id}-startDate`} name="startDate" placeholder={c.datePlaceholder} value={edu.startDate} onChange={handleChange} />
            </FormField>
            <FormField id={`${id}-endDate`} label={c.endDate}>
              <Input id={`${id}-endDate`} name="endDate" placeholder={c.endDatePlaceholder} value={edu.endDate} onChange={handleChange} />
            </FormField>
          </div>

          <FormField id={`${id}-description`} label={c.description}>
            <Textarea
              id={`${id}-description`}
              name="description"
              placeholder={t.descriptionPlaceholder}
              rows={3}
              value={edu.description}
              onChange={handleChange}
            />
          </FormField>
        </div>
      )}
    />
  )
}
