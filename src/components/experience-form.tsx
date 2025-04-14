"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Experience } from "@/types/resume"
import { Plus, Trash2 } from "lucide-react"

interface ExperienceFormProps {
  data: Experience[]
  updateData: (data: Experience[]) => void
}

export default function ExperienceForm({ data, updateData }: ExperienceFormProps) {
  const [experienceList, setExperienceList] = useState<Experience[]>(
    data.length
      ? data
      : [
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          location: "",
          responsibilities: "",
        },
      ],
  )

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const list = [...experienceList]
    list[index] = { ...list[index], [name]: value }
    setExperienceList(list)
    updateData(list)
  }

  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        location: "",
        responsibilities: "",
      },
    ])
  }

  const handleRemoveExperience = (index: number) => {
    const list = [...experienceList]
    list.splice(index, 1)
    setExperienceList(list)
    updateData(list)
  }

  return (
    <div className="space-y-4">
      {experienceList.map((experience, index) => (
        <Card key={index} className="relative">
          {experienceList.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveExperience(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`company-${index}`}>Company</Label>
                  <Input
                    id={`company-${index}`}
                    name="company"
                    placeholder="Example Corp"
                    value={experience.company}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`location-${index}`}>Location</Label>
                  <Input
                    id={`location-${index}`}
                    name="location"
                    placeholder="City, State"
                    value={experience.location}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`position-${index}`}>Position</Label>
                <Input
                  id={`position-${index}`}
                  name="position"
                  placeholder="Software Engineer"
                  value={experience.position}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                  <Input
                    id={`startDate-${index}`}
                    name="startDate"
                    placeholder="MM/YYYY"
                    value={experience.startDate}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${index}`}>End Date</Label>
                  <Input
                    id={`endDate-${index}`}
                    name="endDate"
                    placeholder="MM/YYYY or Present"
                    value={experience.endDate}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`responsibilities-${index}`}>Responsibilities</Label>
                <Textarea
                  id={`responsibilities-${index}`}
                  name="responsibilities"
                  placeholder="• Developed features for the company's main product
• Collaborated with the design team
• Improved performance by 30%"
                  rows={6}
                  value={experience.responsibilities}
                  onChange={(e) => handleChange(index, e)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter each responsibility on a new line, starting with a bullet point (•)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={handleAddExperience}>
        <Plus className="mr-2 h-4 w-4" /> Add Experience
      </Button>
    </div>
  )
}

