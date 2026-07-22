import Image from "next/image";

import { LocaleBadges, StateBadge } from "@/components/admin/ui/list-badges";
import ProjectRowActions from "@/components/admin/projects/project-row-actions";
import { humanizeEnum } from "@/lib/format";

export interface ProjectGridCardData {
  id: string;
  name: string;
  hasId: boolean;
  featured: boolean;
  published: boolean;
  category: string;
  location: string;
  yearLabel: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
}

export default function ProjectGridCard({
  project,
}: {
  project: ProjectGridCardData;
}) {
  return (
    <article className="flex flex-col bg-background-main">
      <div className="relative aspect-[4/3] overflow-hidden bg-background-alt">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={project.thumbnailAlt ?? ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] tracking-widest uppercase text-body/50">
            No image
          </span>
        )}
        <span className="absolute left-2 top-2">
          <StateBadge published={project.published} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="font-serif text-lg leading-snug text-headline">
          {project.name}
        </h2>
        <LocaleBadges hasId={project.hasId} featured={project.featured} />
        <p className="mt-1 text-xs text-body">
          {humanizeEnum(project.category)} · {project.location}
        </p>
        <p
          className="text-xs text-body"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {project.yearLabel}
        </p>

        <div className="mt-3 border-t border-headline/10 pt-3">
          <ProjectRowActions id={project.id} name={project.name} />
        </div>
      </div>
    </article>
  );
}
