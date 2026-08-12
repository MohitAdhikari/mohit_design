import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';
import ArticleForm from '@/components/dashboard/ArticleForm';

export default async function NewArticlePage() {
  const user = await getDashboardUser();
  if (!user) redirect('/dashboard/login');

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">New Article</h1>
      <ArticleForm />
    </div>
  );
}
