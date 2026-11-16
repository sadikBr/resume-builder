"use client"

import { Input } from "@/components/ui/input"
import BulletListInput from "@/components/bullet-list-input"
import FormField from "@/components/form-field"
import SortableEntryList from "@/components/sortable-entry-list"
import type { Experience } from "@/types/resume"
import { useLanguage } from "@/components/language-provider"

interface ExperienceFormProps {
  data: Experience[]
  updateData: (data: Experience[]) => void
}

const emptyExperience = (): Experience => ({
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  location: "",
  responsibilities: "",
})

const dateRange = (start: string, end: string) => [start, end].filter(Boolean).join(" – ")

export default function ExperienceForm({ data, updateData }: ExperienceFormProps) {
  const { t: ui } = useLanguage()
  const t = ui.experience
  const c = ui.common
  return (
    <SortableEntryList
      data={data}
      updateData={updateData}
      fallback={[emptyExperience()]}
      createEmpty={emptyExperience}
      addLabel={t.add}
      emptyTitle={t.empty}
      getTitle={(exp) => [exp.position, exp.company].filter(Boolean).join(" · ")}
      getSubtitle={(exp) => dateRange(exp.startDate, exp.endDate)}
      renderFields={(exp, { id, handleChange, setField }) => (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-company`} label={t.company}>
              <Input id={`${id}-company`} name="company" placeholder={t.companyPlaceholder} value={exp.company} onChange={handleChange} />
            </FormField>
            <FormField id={`${id}-location`} label={c.location}>
              <Input id={`${id}-location`} name="location" placeholder={c.locationPlaceholder} value={exp.location} onChange={handleChange} />
            </FormField>
          </div>

          <FormField id={`${id}-position`} label={t.position}>
            <Input id={`${id}-position`} name="position" placeholder={t.positionPlaceholder} value={exp.position} onChange={handleChange} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-startDate`} label={c.startDate}>
              <Input id={`${id}-startDate`} name="startDate" placeholder={c.datePlaceholder} value={exp.startDate} onChange={handleChange} />
            </FormField>
            <FormField id={`${id}-endDate`} label={c.endDate}>
              <Input id={`${id}-endDate`} name="endDate" placeholder={c.endDatePlaceholder} value={exp.endDate} onChange={handleChange} />
            </FormField>
          </div>

          <FormField id={`${id}-responsibilities`} label={t.responsibilities} hint={ui.inputs.bulletHint}>
            <BulletListInput
              id={`${id}-responsibilities`}
              value={exp.responsibilities}
              onChange={(value) => setField("responsibilities", value)}
            />
          </FormField>
        </div>
      )}
    />
  )
}
