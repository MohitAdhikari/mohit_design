import { redirect, notFound } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';
import { getArticleForUser } from '@/lib/dashboard/sanityDashboard';
import ArticleForm from '@/components/dashboard/ArticleForm';

function blocksToPlainText(content: any[] = []): string {
  return content
    .filter((block) => block._type === 'block')
    .map((block) => (block.children || []).map((c: any) => c.text).join(''))
    .join('\n\n');
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getDashboardUser();
  if (!user) redirect('/dashboard/login');

  const { id } = await params;
  const article = await getArticleForUser(user, id);
  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Edit Article</h1>
      <ArticleForm
        articleId={article._id}
        initialStatus={article.status}
        initialThumbnailUrl={article.thumbnail}
        initialValues={{
          title: article.title || '',
          excerpt: article.excerpt || '',
          body: blocksToPlainText(article.content),
          categoryRef: article.categoryRef?._id || '',
          tags: (article.tags || []).map((t: any) => t._id),
          seoTitle: article.seo?.seoTitle || '',
          metaDescription: article.seo?.metaDescription || '',
          focusKeyword: article.seo?.focusKeyword || '',
        }}
      />
    </div>
  );
}
