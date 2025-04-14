"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Language } from "@/types/resume"
import { Plus, Trash2 } from "lucide-react"

interface LanguagesFormProps {
  data: Language[]
  updateData: (data: Language[]) => void
}

export default function LanguagesForm({ data, updateData }: LanguagesFormProps) {
  const [languagesList, setLanguagesList] = useState<Language[]>(
    data.length
      ? data
      : [
        {
          name: "",
          proficiency: "",
        },
      ],
  )

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const list = [...languagesList]
    list[index] = { ...list[index], [name]: value }
    setLanguagesList(list)
    updateData(list)
  }

  const handleSelectChange = (index: number, name: string, value: string) => {
    const list = [...languagesList]
    list[index] = { ...list[index], [name]: value }
    setLanguagesList(list)
    updateData(list)
  }

  const handleAddLanguage = () => {
    setLanguagesList([
      ...languagesList,
      {
        name: "",
        proficiency: "",
      },
    ])
  }

  const handleRemoveLanguage = (index: number) => {
    const list = [...languagesList]
    list.splice(index, 1)
    setLanguagesList(list)
    updateData(list)
  }

  return (
    <div className="space-y-4">
      {languagesList.map((language, index) => (
        <Card key={index} className="relative">
          {languagesList.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveLanguage(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>Language</Label>
                <Input
                  id={`name-${index}`}
                  name="name"
                  placeholder="English"
                  value={language.name}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`proficiency-${index}`}>Proficiency</Label>
                <Select
                  value={language.proficiency}
                  onValueChange={(value) => handleSelectChange(index, "proficiency", value)}
                >
                  <SelectTrigger id={`proficiency-${index}`}>
                    <SelectValue placeholder="Select proficiency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Native">Native</SelectItem>
                    <SelectItem value="Fluent">Fluent</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="mother tongue">Mother Tongue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={handleAddLanguage}>
        <Plus className="mr-2 h-4 w-4" /> Add Language
      </Button>
    </div>
  )
}

