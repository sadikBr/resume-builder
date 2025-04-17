"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalInfo } from "@/types/resume";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  updateData: (data: PersonalInfo) => void;
}

export default function PersonalInfoForm({
  data,
  updateData,
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<PersonalInfo>(data);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    updateData(updatedData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Software Engineer"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea
              id="tagline"
              name="tagline"
              placeholder="Dynamic and motivated. I am a junior engineer..."
              value={formData.tagline}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                placeholder="https://linkedin.com/in/johndoe"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(123) 456-7890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://yourportfolio.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                name="github"
                placeholder="https://github.com/johndoe"
                value={formData.github}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">Profile Photo URL</Label>
            <Input
              id="photoUrl"
              name="photoUrl"
              placeholder="https://example.com/your-photo.jpg"
              value={formData.photoUrl}
              onChange={handleChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
