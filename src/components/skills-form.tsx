"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Skill } from "@/types/resume"
import { Plus, Trash2 } from "lucide-react"

interface SkillsFormProps {
  data: Skill[]
  updateData: (data: Skill[]) => void
}

export default function SkillsForm({ data, updateData }: SkillsFormProps) {
  const [skillsList, setSkillsList] = useState<Skill[]>(
    data.length
      ? data
      : [
        {
          category: "Programming Languages",
          items: "JavaScript, TypeScript, Python",
        },
      ],
  )

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const list = [...skillsList]
    list[index] = { ...list[index], [name]: value }
    setSkillsList(list)
    updateData(list)
  }

  const handleAddSkill = () => {
    setSkillsList([
      ...skillsList,
      {
        category: "",
        items: "",
      },
    ])
  }

  const handleRemoveSkill = (index: number) => {
    const list = [...skillsList]
    list.splice(index, 1)
    setSkillsList(list)
    updateData(list)
  }

  return (
    <div className="space-y-4">
      {skillsList.map((skill, index) => (
        <Card key={index} className="relative">
          {skillsList.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveSkill(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`category-${index}`}>Skill Category</Label>
                <Input
                  id={`category-${index}`}
                  name="category"
                  placeholder="Programming Languages"
                  value={skill.category}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`items-${index}`}>Skills</Label>
                <Textarea
                  id={`items-${index}`}
                  name="items"
                  placeholder="JavaScript, TypeScript, Python"
                  rows={3}
                  value={skill.items}
                  onChange={(e) => handleChange(index, e)}
                />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={handleAddSkill}>
        <Plus className="mr-2 h-4 w-4" /> Add Skill Category
      </Button>
    </div>
  )
}

