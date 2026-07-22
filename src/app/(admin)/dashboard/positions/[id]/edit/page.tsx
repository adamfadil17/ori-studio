import { notFound } from "next/navigation";

import BackLink from "@/components/admin/ui/back-link";
import PositionForm, {
  type PositionFormInitial,
} from "@/components/admin/positions/position-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPositionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const position = await prisma.openPosition.findUnique({
    where: { id },
    include: { _count: { select: { careerApplications: true } } },
  });
  if (!position) notFound();

  const initial: PositionFormInitial = {
    id: position.id,
    title: position.title,
    type: position.type,
    level: position.level,
    description: position.description,
    isActive: position.isActive,
  };

  const applications = position._count.careerApplications;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/positions">Open Positions</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">
        {position.title}
      </h1>
      <p className="mt-2 text-sm text-body">
        {position.isActive ? "Active" : "Inactive"} · {applications}{" "}
        {applications === 1 ? "application" : "applications"}
      </p>

      <PositionForm initial={initial} />
    </div>
  );
}
