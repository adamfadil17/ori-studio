import { OpenPosition } from "@/lib/data/open-positions";

interface OpenPositionsListProps {
  positions: OpenPosition[];
  label: string;
  viewDetailsLabel: string;
  onSelect: (position: OpenPosition) => void;
}

export default function OpenPositionsList({
  positions,
  label,
  viewDetailsLabel,
  onSelect,
}: OpenPositionsListProps) {
  if (positions.length === 0) return null;

  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-eyebrow">{label}</p>
      <div className="mt-4 divide-y divide-headline/10 border-y border-headline/10">
        {positions.map((position) => (
          <button
            key={position.id}
            type="button"
            onClick={() => onSelect(position)}
            className="group flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
          >
            <div>
              <p className="font-serif text-base text-headline">
                {position.title}
              </p>
              <p className="mt-1 text-xs text-body">
                {position.type} <span aria-hidden="true">—</span>{" "}
                {position.level}
              </p>
            </div>
            <span className="shrink-0 text-xs tracking-widest uppercase text-headline underline-offset-4 group-hover:underline group-hover:cursor-pointer">
              {viewDetailsLabel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
