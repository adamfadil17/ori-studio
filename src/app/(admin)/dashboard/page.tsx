import {
  RecentSubmissions,
  StatTile,
  StatusBreakdown,
} from "@/components/admin/dashboard/charts";
import SubmissionsTrend from "@/components/admin/dashboard/submissions-trend";
import { getDashboardStats } from "@/lib/stats";

// Always reflect the current data — this page is a monitoring view.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const { submissions, content, byType, byStatus, trend, recent } = stats;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs tracking-widest uppercase text-eyebrow">Overview</p>
      <h1 className="mt-3 font-serif text-3xl text-headline">Dashboard</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
        Activity across the website — incoming enquiries and published content.
      </p>

      {/* KPI row — headline numbers, not charts */}
      <div className="mt-8 grid gap-px bg-headline/10 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Submissions"
          value={submissions.total}
          hint="All time"
          delta={{ current: submissions.last30, previous: submissions.prev30 }}
        />
        <StatTile
          label="Awaiting review"
          value={submissions.unread}
          hint={submissions.unread === 1 ? "1 new submission" : "New submissions"}
        />
        <StatTile
          label="Projects"
          value={content.projects.published}
          hint={`${content.projects.total - content.projects.published} draft · ${content.projects.total} total`}
        />
        <StatTile
          label="Journal"
          value={content.articles.published}
          hint={`${content.articles.total - content.articles.published} draft · ${content.articles.total} total`}
        />
      </div>

      {/* Trend + pipeline */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <SubmissionsTrend trend={trend} byType={byType} />
        <StatusBreakdown byStatus={byStatus} />
      </div>

      <div className="mt-6">
        <RecentSubmissions recent={recent} />
      </div>

      <p className="mt-6 text-xs text-body">
        Open positions: {content.positions.active} active of{" "}
        {content.positions.total}.
      </p>
    </div>
  );
}
