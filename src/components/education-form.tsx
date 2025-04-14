"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Education } from "@/types/resume"
import { Plus, Trash2 } from "lucide-react"

interface EducationFormProps {
  data: Education[]
  updateData: (data: Education[]) => void
}

export default function EducationForm({ data, updateData }: EducationFormProps) {
  const [educationList, setEducationList] = useState<Education[]>(
    data.length
      ? data
      : [
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          location: "",
          description: "",
        },
      ],
  )

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const list = [...educationList]
    list[index] = { ...list[index], [name]: value }
    setEducationList(list)
    updateData(list)
  }

  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
      },
    ])
  }

  const handleRemoveEducation = (index: number) => {
    const list = [...educationList]
    list.splice(index, 1)
    setEducationList(list)
    updateData(list)
  }

  return (
    <div className="space-y-4">
      {educationList.map((education, index) => (
        <Card key={index} className="relative">
          {educationList.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveEducation(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`institution-${index}`}>Institution</Label>
                  <Input
                    id={`institution-${index}`}
                    name="institution"
                    placeholder="University of Example"
                    value={education.institution}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`location-${index}`}>Location</Label>
                  <Input
                    id={`location-${index}`}
                    name="location"
                    placeholder="City, State"
                    value={education.location}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`degree-${index}`}>Degree</Label>
                  <Input
                    id={`degree-${index}`}
                    name="degree"
                    placeholder="Bachelor of Science"
                    value={education.degree}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`fieldOfStudy-${index}`}>Field of Study</Label>
                  <Input
                    id={`fieldOfStudy-${index}`}
                    name="fieldOfStudy"
                    placeholder="Computer Science"
                    value={education.fieldOfStudy}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                  <Input
                    id={`startDate-${index}`}
                    name="startDate"
                    placeholder="MM/YYYY"
                    value={education.startDate}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${index}`}>End Date</Label>
                  <Input
                    id={`endDate-${index}`}
                    name="endDate"
                    placeholder="MM/YYYY or Present"
                    value={education.endDate}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  name="description"
                  placeholder="Relevant coursework, achievements, etc."
                  rows={3}
                  value={education.description}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={handleAddEducation}>
        <Plus className="mr-2 h-4 w-4" /> Add Education
      </Button>
    </div>
  )
}

