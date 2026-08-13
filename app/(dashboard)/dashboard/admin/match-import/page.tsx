import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';
import { getEditionOptions } from '@/lib/dashboard/matchImport';
import MatchImportForm from '@/components/dashboard/MatchImportForm';

export default async function MatchImportPage() {
  const user = await getDashboardUser();
  if (!user) redirect('/dashboard/login');
  if (user.role !== 'admin') redirect('/dashboard');

  const editions = await getEditionOptions();

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Smart Import</h1>
      <p className="text-sm text-white/50 mb-6">
        Paste raw match standings text (typed manually, copied from a table, or transcribed from a screenshot).
        Rows are extracted and matched to your teams automatically, and a draft recap article is written for you to review before publishing.
      </p>

      <MatchImportForm editions={editions} />
    </div>
  );
}
