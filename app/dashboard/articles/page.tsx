import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';
import { listArticlesForUser } from '@/lib/dashboard/sanityDashboard';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
};

export default async function DashboardArticlesPage() {
  const user = await getDashboardUser();
  if (!user) redirect('/dashboard/login');

  const articles = await listArticlesForUser(user);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">
          {user.role === 'admin' ? 'All Articles' : 'My Articles'}
        </h1>
        <Link
          href="/dashboard/articles/new"
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-md px-4 py-2 transition"
        >
          New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-white/50 text-sm">No articles yet. Create your first one.</p>
      ) : (
        <div className="space-y-2">
          {articles.map((article: any) => (
            <Link
              key={article._id}
              href={`/dashboard/articles/${article._id}`}
              className="block border border-white/10 rounded-md px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{article.title}</p>
                <span className="text-xs font-mono uppercase text-white/50">
                  {STATUS_LABELS[article.status] || article.status}
                </span>
              </div>
              {user.role === 'admin' && article.dashboardOwnerEmail && (
                <p className="text-xs text-white/40 mt-1">by {article.dashboardOwnerEmail}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
