"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormField from "@/components/form-field";
import type { PersonalInfo } from "@/types/resume";
import { useLanguage } from "@/components/language-provider";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  updateData: (data: PersonalInfo) => void;
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export default function PersonalInfoForm({
  data,
  updateData,
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<PersonalInfo>(data);
  const { t: ui } = useLanguage();
  const t = ui.personal;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    updateData(updatedData);
  };

  return (
    <div className="space-y-3">
      <FieldGroup title={t.basics}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label={t.name}>
            <Input id="name" name="name" placeholder={t.namePlaceholder} value={formData.name} onChange={handleChange} />
          </FormField>
          <FormField id="title" label={t.title}>
            <Input id="title" name="title" placeholder={t.titlePlaceholder} value={formData.title} onChange={handleChange} />
          </FormField>
        </div>
        <FormField id="tagline" label={t.tagline}>
          <Textarea
            id="tagline"
            name="tagline"
            placeholder={t.taglinePlaceholder}
            value={formData.tagline}
            onChange={handleChange}
          />
        </FormField>
        <FormField id="photoUrl" label={t.photoUrl}>
          <Input
            id="photoUrl"
            name="photoUrl"
            placeholder="https://example.com/your-photo.jpg"
            value={formData.photoUrl}
            onChange={handleChange}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title={t.contact}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="email" label={t.email}>
            <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} />
          </FormField>
          <FormField id="phone" label={t.phone}>
            <Input id="phone" name="phone" placeholder="(123) 456-7890" value={formData.phone} onChange={handleChange} />
          </FormField>
        </div>
      </FieldGroup>

      <FieldGroup title={t.links}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="website" label={t.website}>
            <Input id="website" name="website" placeholder="https://yourportfolio.com" value={formData.website} onChange={handleChange} />
          </FormField>
          <FormField id="linkedin" label={t.linkedin}>
            <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/johndoe" value={formData.linkedin} onChange={handleChange} />
          </FormField>
          <FormField id="github" label={t.github} className="sm:col-span-2">
            <Input id="github" name="github" placeholder="https://github.com/johndoe" value={formData.github} onChange={handleChange} />
          </FormField>
        </div>
      </FieldGroup>
    </div>
  );
}
