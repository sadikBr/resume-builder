"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormField from "@/components/form-field"
import SortableEntryList from "@/components/sortable-entry-list"
import TagInput from "@/components/tag-input"
import type { Project } from "@/types/resume"
import { useLanguage } from "@/components/language-provider"

interface ProjectsFormProps {
  data: Project[]
  updateData: (data: Project[]) => void
}

const emptyProject = (): Project => ({ name: "", url: "", description: "", technologies: "" })

export default function ProjectsForm({ data, updateData }: ProjectsFormProps) {
  const { t: ui } = useLanguage()
  const t = ui.projects
  const c = ui.common
  return (
    <SortableEntryList
      data={data}
      updateData={updateData}
      fallback={[emptyProject()]}
      createEmpty={emptyProject}
      addLabel={t.add}
      emptyTitle={t.empty}
      getTitle={(project) => project.name}
      getSubtitle={(project) => project.technologies || project.url}
      renderFields={(project, { id, handleChange, setField }) => (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-name`} label={t.name}>
              <Input id={`${id}-name`} name="name" placeholder={t.namePlaceholder} value={project.name} onChange={handleChange} />
            </FormField>
            <FormField id={`${id}-url`} label={t.url}>
              <Input id={`${id}-url`} name="url" placeholder="https://github.com/username/project" value={project.url} onChange={handleChange} />
            </FormField>
          </div>

          <FormField id={`${id}-technologies`} label={t.technologies} hint={ui.inputs.tagHint}>
            <TagInput
              id={`${id}-technologies`}
              placeholder={t.technologiesPlaceholder}
              value={project.technologies}
              onChange={(value) => setField("technologies", value)}
            />
          </FormField>

          <FormField id={`${id}-description`} label={c.description}>
            <Textarea
              id={`${id}-description`}
              name="description"
              placeholder={t.descriptionPlaceholder}
              rows={3}
              value={project.description}
              onChange={handleChange}
            />
          </FormField>
        </div>
      )}
    />
  )
}
