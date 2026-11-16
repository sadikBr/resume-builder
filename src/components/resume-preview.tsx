"use client";

import type {
  LayoutSection,
  ResumeData,
  ResumeLayout,
  SectionId,
} from "@/types/resume";
import { ExternalLink, Mail, Github, Linkedin, Phone } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { resumeTranslations, type ResumeLanguage } from "@/lib/i18n";
import { fontSizeVariables, getAccent } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  resumePreviewRef: Ref<HTMLDivElement>;
  data: ResumeData;
  layout: ResumeLayout;
  language: ResumeLanguage;
  /** Called whenever the content flows onto a different number of pages. */
  onPageCountChange?: (count: number) => void;
}

type Translations = (typeof resumeTranslations)[ResumeLanguage];

/** Context every section needs to render itself for the column it sits in. */
interface SectionContext {
  data: ResumeData;
  t: Translations;
  /** Narrow columns stack metadata instead of aligning it to the right. */
  narrow: boolean;
  skillStyle: ResumeLayout["skillStyle"];
}

// Columns narrower than this share of the page use the stacked entry layout.
const NARROW_THRESHOLD = 45;

const accent = "text-[var(--accent)]";

/**
 * Hairline thickness. The preview is scaled down to fit the screen, which turns
 * a 1px line into a sub-pixel one that browsers may drop depending on where it
 * lands. A4PageScaler sets --hairline to cancel the scale so every rule draws
 * as one full screen pixel; it is 1px at real size (and in the PDF).
 */
const HAIRLINE = "var(--hairline, 1px)";
const hairlineBorder = (side: "top" | "left" | "right"): CSSProperties => ({
  [`border${side[0].toUpperCase()}${side.slice(1)}`]: `${HAIRLINE} solid #e2e8f0`,
});

const splitList = (value: string, separator: string | RegExp) =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

const dateRange = (start: string, end: string) =>
  [start, end].filter(Boolean).join(" – ");

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className={cn(
        "mb-2.5 flex items-center gap-2.5 text-[length:var(--fs-sectionTitle)] font-bold uppercase leading-none tracking-[0.16em]",
        accent,
      )}
    >
      <span className="shrink-0">{children}</span>
      <span className="flex-1 bg-[var(--accent-border)]" style={{ height: HAIRLINE }} />
    </h2>
  );
}

function TagList({
  items,
  style,
}: {
  items: string[];
  style: ResumeLayout["skillStyle"];
}) {
  if (style === "chips") {
    return (
      <div className="flex flex-wrap items-start gap-1">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-block rounded border-solid border-[var(--accent-border)] bg-white px-1.5 py-px text-[length:var(--fs-tags)] font-medium leading-[1.5] text-slate-800"
            style={{ borderWidth: HAIRLINE }}
          >
            {item}
          </span>
        ))}
      </div>
    );
  }
  return (
    <p className="text-[length:calc(var(--fs-tags)+1px)] leading-[1.5] text-slate-700">
      {items.map((item, i) => (
        <span key={i}>
          {/* Real spaces around the dot give the line somewhere to wrap. */}
          {i > 0 && <span className="text-slate-400"> · </span>}
          <span className="whitespace-nowrap">{item}</span>
        </span>
      ))}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-1 space-y-0.5 text-[length:var(--fs-body)] leading-[1.45] text-slate-700">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[0.55em] h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Title / organisation / date block shared by education, experience and
 * projects. Wide columns put the date on the right of the title; narrow
 * columns stack everything so nothing gets squeezed.
 */
function EntryHeader({
  title,
  titleExtra,
  organisation,
  location,
  date,
  narrow,
}: {
  title: string;
  titleExtra?: string;
  organisation?: string;
  location?: string;
  date?: string;
  narrow: boolean;
}) {
  const heading = (
    <h3 className="text-[length:var(--fs-entryTitle)] font-semibold leading-snug text-slate-900">
      {title}
      {titleExtra && (
        <span className="font-normal text-slate-500">
          {" — "}
          {titleExtra}
        </span>
      )}
    </h3>
  );

  if (narrow) {
    const meta = [date, location].filter(Boolean).join(" · ");
    return (
      <div>
        {heading}
        {organisation && (
          <div className={cn("text-[length:var(--fs-organisation)] font-medium leading-snug", accent)}>
            {organisation}
          </div>
        )}
        {meta && (
          <div className="text-[length:var(--fs-meta)] tabular-nums leading-snug text-slate-500">
            {meta}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        {heading}
        {date && (
          <span className="shrink-0 text-[length:var(--fs-meta)] tabular-nums text-slate-500">
            {date}
          </span>
        )}
      </div>
      {(organisation || location) && (
        <div className="text-[length:var(--fs-organisation)] leading-snug">
          {organisation && (
            <span className={cn("font-medium", accent)}>{organisation}</span>
          )}
          {location && (
            <span className="text-slate-500">
              {organisation && " · "}
              {location}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections, as unbreakable blocks                                     */
/* ------------------------------------------------------------------ */

/**
 * A piece of the resume that is never split across pages. The first block of
 * every section carries the section title, so a title never ends up alone at
 * the bottom of a page.
 */
interface Block {
  key: string;
  /** Space above the block when it is not the first one on its page. */
  gap: number;
  node: ReactNode;
}

const SECTION_GAP = 20;

function educationEntries({ data, narrow }: SectionContext) {
  return data.education.map((edu, i) => (
    <div key={i}>
      <EntryHeader
        title={edu.degree}
        titleExtra={edu.fieldOfStudy}
        organisation={edu.institution}
        location={edu.location}
        date={dateRange(edu.startDate, edu.endDate)}
        narrow={narrow}
      />
      {edu.description && (
        <p className="mt-1 text-[length:var(--fs-body)] leading-[1.45] text-slate-700">
          {edu.description}
        </p>
      )}
    </div>
  ));
}

function experienceEntries({ data, narrow }: SectionContext) {
  return data.experience.map((exp, i) => (
    <div key={i}>
      <EntryHeader
        title={exp.position}
        organisation={exp.company}
        location={exp.location}
        date={dateRange(exp.startDate, exp.endDate)}
        narrow={narrow}
      />
      {exp.responsibilities && (
        <BulletList items={splitList(exp.responsibilities, "\n")} />
      )}
    </div>
  ));
}

function projectEntries({ data, narrow, skillStyle }: SectionContext) {
  return data.projects.map((project, i) => {
    const link = project.url && (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("truncate text-[length:var(--fs-meta)] hover:underline", accent)}
      >
        {project.url.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
    const technologies = splitList(project.technologies, ",");
    const title = (
      <h3 className="text-[length:var(--fs-entryTitle)] font-semibold leading-snug text-slate-900">
        {project.name}
      </h3>
    );
    return (
      <div key={i}>
        {narrow ? (
          <div>
            {title}
            {link && <div className="leading-snug">{link}</div>}
          </div>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            {title}
            {link}
          </div>
        )}
        {project.description && (
          <p className="mt-0.5 text-[length:var(--fs-body)] leading-[1.45] text-slate-700">
            {project.description}
          </p>
        )}
        {technologies.length > 0 && (
          <div className="mt-1">
            <TagList items={technologies} style={skillStyle} />
          </div>
        )}
      </div>
    );
  });
}

function skillEntries({ data, narrow, skillStyle }: SectionContext) {
  return data.skills.map((skill, i) =>
    narrow ? (
      <div key={i}>
        <div className="mb-0.5 text-[length:var(--fs-skillCategory)] font-semibold leading-snug text-slate-900">
          {skill.category}
        </div>
        <TagList items={splitList(skill.items, ",")} style={skillStyle} />
      </div>
    ) : (
      // Wide columns: category label on the left, skills on the right.
      <div key={i} className="grid grid-cols-[minmax(0,30%)_minmax(0,1fr)] gap-x-4">
        <div className="text-[length:var(--fs-skillCategory)] font-semibold leading-[1.5] text-slate-900">
          {skill.category}
        </div>
        <TagList items={splitList(skill.items, ",")} style={skillStyle} />
      </div>
    ),
  );
}

function languageEntries({ data, t, narrow }: SectionContext) {
  // Short enough to always stay together as a single block.
  return [
    <div
      key="languages"
      className={cn(narrow ? "space-y-1" : "grid grid-cols-3 gap-x-4 gap-y-1.5")}
    >
      {data.languages.map((language, i) => (
        <div key={i} className="flex items-baseline justify-between gap-2 text-[length:var(--fs-languages)]">
          <span className="font-semibold text-slate-900">{language.name}</span>
          <span className="text-slate-500">
            {t.proficiency[language.proficiency] ?? language.proficiency}
          </span>
        </div>
      ))}
    </div>,
  ];
}

const SECTIONS: Record<
  SectionId,
  { entries: (ctx: SectionContext) => ReactNode[]; gap: (narrow: boolean) => number }
> = {
  experience: { entries: experienceEntries, gap: () => 12 },
  education: { entries: educationEntries, gap: () => 12 },
  projects: { entries: projectEntries, gap: () => 12 },
  skills: { entries: skillEntries, gap: (narrow) => (narrow ? 10 : 6) },
  languages: { entries: languageEntries, gap: () => 0 },
};

function sectionBlocks(id: SectionId, ctx: SectionContext): Block[] {
  const section = SECTIONS[id];
  return section.entries(ctx).map((node, i) => ({
    key: `${id}-${i}`,
    gap: i === 0 ? SECTION_GAP : section.gap(ctx.narrow),
    node:
      i === 0 ? (
        <>
          <SectionTitle>{ctx.t[id]}</SectionTitle>
          {node}
        </>
      ) : (
        node
      ),
  }));
}

/** Greedy page filling: a block that doesn't fit starts the next page. */
function paginate(
  blocks: Block[],
  heights: Record<string, number> | null,
  firstPage: number,
  otherPages: number,
): Block[][] {
  if (!heights) return [blocks];
  const pages: Block[][] = [[]];
  let used = 0;
  for (const block of blocks) {
    const height = heights[block.key] ?? 0;
    const page = pages[pages.length - 1];
    const available = pages.length === 1 ? firstPage : otherPages;
    const gap = page.length > 0 ? block.gap : 0;
    if (page.length > 0 && used + gap + height > available) {
      pages.push([block]);
      used = height;
    } else {
      page.push(block);
      used += gap + height;
    }
  }
  return pages;
}

function BlockStack({ blocks, measure }: { blocks: Block[]; measure?: boolean }) {
  return blocks.map((block, i) => (
    <div
      key={block.key}
      // flow-root stops child margins from leaking out and skewing measurements.
      className="flow-root"
      data-block={measure ? block.key : undefined}
      style={{ marginTop: measure || i === 0 ? 0 : block.gap }}
    >
      {block.node}
    </div>
  ));
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function ContactItem({
  icon,
  href,
  external,
  children,
}: {
  icon: ReactNode;
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-1.5 hover:underline"
    >
      <span className={accent}>{icon}</span>
      {children}
    </a>
  );
}

function Header({ data }: { data: ResumeData }) {
  const { personalInfo } = data;
  const icon = "size-[1.09em]";

  return (
    <header className="flex items-center gap-6 px-9 pt-8 pb-6">
      <div className="min-w-0 flex-1">
        {personalInfo.name && (
          <h1 className="text-[length:var(--fs-name)] font-bold leading-none tracking-tight text-slate-900">
            {personalInfo.name}
          </h1>
        )}
        {personalInfo.title && (
          <p
            className={cn(
              "mt-2 text-[length:var(--fs-title)] font-semibold uppercase tracking-[0.16em]",
              accent,
            )}
          >
            {personalInfo.title}
          </p>
        )}
        {personalInfo.tagline && (
          <p className="mt-3 max-w-[95%] text-[length:var(--fs-tagline)] leading-relaxed text-slate-600">
            {personalInfo.tagline}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[length:var(--fs-contact)] text-slate-600">
          {personalInfo.email && (
            <ContactItem icon={<Mail className={icon} />} href={`mailto:${personalInfo.email}`}>
              {personalInfo.email}
            </ContactItem>
          )}
          {personalInfo.phone && (
            <ContactItem
              icon={<Phone className={icon} />}
              href={`tel:${personalInfo.phone.replace(/\s+/g, "")}`}
            >
              {personalInfo.phone}
            </ContactItem>
          )}
          {personalInfo.website && (
            <ContactItem icon={<ExternalLink className={icon} />} href={personalInfo.website} external>
              {personalInfo.website.replace(/^https?:\/\/(www\.)?/, "")}
            </ContactItem>
          )}
          {personalInfo.linkedin && (
            <ContactItem icon={<Linkedin className={icon} />} href={personalInfo.linkedin} external>
              {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "")}
            </ContactItem>
          )}
          {personalInfo.github && (
            <ContactItem icon={<Github className={icon} />} href={personalInfo.github} external>
              {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
            </ContactItem>
          )}
        </div>
      </div>

      {personalInfo.photoUrl && (
        <div className="w-[104px] shrink-0 aspect-square overflow-hidden rounded-full">
          <Image
            src={personalInfo.photoUrl}
            alt="Profile"
            width={136}
            height={136}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

// 297mm at 96 DPI, and the vertical padding of the body columns.
const PAGE_HEIGHT = 1122.5;
const PAD_TOP_FIRST = 20; // pt-5
const PAD_TOP_NEXT = 36; // pt-9
const PAD_BOTTOM = 28; // pb-7
// Absorbs sub-pixel rounding so the last block never touches the edge.
const SAFETY = 2;

interface Measurements {
  header: number;
  blocks: Record<string, number>;
}

const sameMeasurements = (a: Measurements | null, b: Measurements) =>
  !!a &&
  a.header === b.header &&
  Object.keys(b.blocks).length === Object.keys(a.blocks).length &&
  Object.entries(b.blocks).every(([key, h]) => a.blocks[key] === h);

export default function ResumePreview({
  data,
  layout,
  resumePreviewRef,
  language,
  onPageCountChange,
}: ResumePreviewProps) {
  const t = resumeTranslations[language];
  const palette = getAccent(layout.accent);
  const twoColumns = layout.columns === 2;
  const sidebarLeft = layout.sidebarPosition === "left";
  const tinted = layout.sidebarStyle === "tinted";

  const visible = layout.sections.filter(
    (section) => section.visible && data[section.id].length > 0,
  );

  const blocksFor = (sections: LayoutSection[], narrow: boolean) =>
    sections.flatMap((section) =>
      sectionBlocks(section.id, { data, t, narrow, skillStyle: layout.skillStyle }),
    );

  const columns = twoColumns
    ? {
        main: blocksFor(
          visible.filter((s) => s.column === "main"),
          100 - layout.sidebarWidth < NARROW_THRESHOLD,
        ),
        side: blocksFor(
          visible.filter((s) => s.column === "side"),
          layout.sidebarWidth < NARROW_THRESHOLD,
        ),
      }
    : { main: blocksFor(visible, false), side: [] as Block[] };

  /* ---- measure every block off-screen, then distribute over pages ---- */

  const measureRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);

  const measure = useCallback(() => {
    const root = measureRef.current;
    if (!root) return;
    const blocks: Record<string, number> = {};
    root.querySelectorAll<HTMLElement>("[data-block]").forEach((el) => {
      blocks[el.dataset.block!] = el.getBoundingClientRect().height / scaleOf(root);
    });
    const headerEl = root.querySelector<HTMLElement>("[data-measure-header]");
    const next = {
      header: headerEl ? headerEl.getBoundingClientRect().height / scaleOf(root) : 0,
      blocks,
    };
    setMeasurements((prev) => (sameMeasurements(prev, next) ? prev : next));
  }, []);

  // Re-measure after every render (cheap, and a no-op when nothing moved)...
  useLayoutEffect(measure);
  // ...and when web fonts or images change the size of the content.
  useEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  const bodyFirst =
    PAGE_HEIGHT - (measurements?.header ?? 0) - 1 - PAD_TOP_FIRST - PAD_BOTTOM - SAFETY;
  const bodyNext = PAGE_HEIGHT - PAD_TOP_NEXT - PAD_BOTTOM - SAFETY;
  const heights = measurements?.blocks ?? null;
  const mainPages = paginate(columns.main, heights, bodyFirst, bodyNext);
  const sidePages = paginate(columns.side, heights, bodyFirst, bodyNext);
  const pageCount = Math.max(mainPages.length, sidePages.length, 1);

  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  /* ---- rendering ---- */

  const style = {
    "--accent": palette.accent,
    "--accent-soft": palette.soft,
    "--accent-border": palette.border,
    "--accent-tint": palette.tint,
    ...fontSizeVariables(layout.fontSizes),
  } as CSSProperties;

  // Page edge gets the full margin, the gutter between columns a smaller one.
  const mainPadding = twoColumns ? (sidebarLeft ? "pl-6 pr-9" : "pl-9 pr-6") : "px-9";
  const sidePadding = sidebarLeft ? "pl-9 pr-6" : "pl-6 pr-9";
  const sideSurface = tinted ? "bg-[var(--accent-tint)]" : undefined;
  const sideRule = tinted ? undefined : hairlineBorder(sidebarLeft ? "right" : "left");
  const gridTemplateColumns = sidebarLeft
    ? `${layout.sidebarWidth}% minmax(0, 1fr)`
    : `minmax(0, 1fr) ${layout.sidebarWidth}%`;

  const body = (pageIndex: number | null) => {
    const measuring = pageIndex === null;
    const vertical = measuring ? "" : pageIndex === 0 ? "pt-5 pb-7" : "pt-9 pb-7";
    const main = (
      <div key="main" className={cn("min-w-0", mainPadding, vertical)}>
        <BlockStack blocks={measuring ? columns.main : (mainPages[pageIndex] ?? [])} measure={measuring} />
      </div>
    );
    if (!twoColumns) return main;
    const side = (
      <aside
        key="side"
        className={cn("min-w-0", sidePadding, vertical, !measuring && sideSurface)}
        style={measuring ? undefined : sideRule}
      >
        <BlockStack blocks={measuring ? columns.side : (sidePages[pageIndex] ?? [])} measure={measuring} />
      </aside>
    );
    return (
      <div
        className={cn("grid", !measuring && "flex-1")}
        style={{
          gridTemplateColumns,
          ...(!measuring && pageIndex === 0 ? hairlineBorder("top") : {}),
        }}
      >
        {sidebarLeft ? [side, main] : [main, side]}
      </div>
    );
  };

  return (
    <div ref={resumePreviewRef} style={style} className="relative flex flex-col gap-6">
      {Array.from({ length: pageCount }, (_, i) => (
        // The shadow lives on a wrapper so it never ends up in the PDF capture.
        <div key={i} className="shadow-md ring-1 ring-black/5">
          <div
            data-resume-page={i}
            className="flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white font-sans text-sm text-slate-800"
          >
            {i === 0 && <Header data={data} />}
            {twoColumns ? (
              body(i)
            ) : (
              <div className="flex-1" style={i === 0 ? hairlineBorder("top") : undefined}>
                {body(i)}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Invisible copy of the content at full width, used only to measure block heights. */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 w-[210mm] font-sans text-sm text-slate-800"
      >
        <div data-measure-header>
          <Header data={data} />
        </div>
        {body(null)}
      </div>
    </div>
  );
}

/** The preview is CSS-scaled to fit the screen; measurements must be unscaled. */
function scaleOf(el: HTMLElement) {
  return el.getBoundingClientRect().width / el.offsetWidth || 1;
}
