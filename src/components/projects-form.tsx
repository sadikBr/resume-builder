"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "@/types/resume"
import { Plus, Trash2 } from "lucide-react"

interface ProjectsFormProps {
  data: Project[]
  updateData: (data: Project[]) => void
}

export default function ProjectsForm({ data, updateData }: ProjectsFormProps) {
  const [projectsList, setProjectsList] = useState<Project[]>(
    data.length
      ? data
      : [
        {
          name: "",
          url: "",
          description: "",
          technologies: "",
        },
      ],
  )

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const list = [...projectsList]
    list[index] = { ...list[index], [name]: value }
    setProjectsList(list)
    updateData(list)
  }

  const handleAddProject = () => {
    setProjectsList([
      ...projectsList,
      {
        name: "",
        url: "",
        description: "",
        technologies: "",
      },
    ])
  }

  const handleRemoveProject = (index: number) => {
    const list = [...projectsList]
    list.splice(index, 1)
    setProjectsList(list)
    updateData(list)
  }

  return (
    <div className="space-y-4">
      {projectsList.map((project, index) => (
        <Card key={index} className="relative">
          {projectsList.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveProject(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>Project Name</Label>
                <Input
                  id={`name-${index}`}
                  name="name"
                  placeholder="My Awesome Project"
                  value={project.name}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`url-${index}`}>Project URL</Label>
                <Input
                  id={`url-${index}`}
                  name="url"
                  placeholder="https://github.com/username/project"
                  value={project.url}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`technologies-${index}`}>Technologies Used</Label>
                <Input
                  id={`technologies-${index}`}
                  name="technologies"
                  placeholder="React, Node.js, MongoDB"
                  value={project.technologies}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  name="description"
                  placeholder="Describe your project, its purpose, and your role..."
                  rows={3}
                  value={project.description}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={handleAddProject}>
        <Plus className="mr-2 h-4 w-4" /> Add Project
      </Button>
    </div>
  )
}

