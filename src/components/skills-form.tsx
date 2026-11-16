"use client"

import { Input } from "@/components/ui/input"
import FormField from "@/components/form-field"
import SortableEntryList from "@/components/sortable-entry-list"
import TagInput from "@/components/tag-input"
import type { Skill } from "@/types/resume"
import { useLanguage } from "@/components/language-provider"

interface SkillsFormProps {
  data: Skill[]
  updateData: (data: Skill[]) => void
}

export default function SkillsForm({ data, updateData }: SkillsFormProps) {
  const { t: ui } = useLanguage()
  const t = ui.skills
  return (
    <SortableEntryList
      data={data}
      updateData={updateData}
      fallback={[{ category: "Programming Languages", items: "JavaScript, TypeScript, Python" }]}
      createEmpty={() => ({ category: "", items: "" })}
      addLabel={t.add}
      emptyTitle={t.empty}
      getTitle={(skill) => skill.category}
      getSubtitle={(skill) => skill.items}
      renderFields={(skill, { id, handleChange, setField }) => (
        <div className="grid gap-4">
          <FormField id={`${id}-category`} label={t.category}>
            <Input
              id={`${id}-category`}
              name="category"
              placeholder={t.categoryPlaceholder}
              value={skill.category}
              onChange={handleChange}
            />
          </FormField>
          <FormField id={`${id}-items`} label={t.items} hint={ui.inputs.tagHint}>
            <TagInput
              id={`${id}-items`}
              placeholder={t.itemsPlaceholder}
              value={skill.items}
              onChange={(value) => setField("items", value)}
            />
          </FormField>
        </div>
      )}
    />
  )
}
