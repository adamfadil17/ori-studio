import BackLink from "@/components/admin/ui/back-link";
import PositionForm from "@/components/admin/positions/position-form";

export default function NewPositionPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/positions">Open Positions</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">New position</h1>
      <p className="mt-2 text-sm text-body">
        Active positions appear in the careers section of the contact page and
        in the career form&rsquo;s position list.
      </p>

      <PositionForm />
    </div>
  );
}
