import { redirect, notFound } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';
import { getArticleForUser } from '@/lib/dashboard/sanityDashboard';
import { blocksToEditorText } from '@/lib/dashboard/portableText';
import ArticleForm from '@/components/dashboard/ArticleForm';

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
        initialBodyImageUrl={article.bodyImage?.url}
        userRole={user.role}
        initialValues={{
          title: article.title || '',
          excerpt: article.excerpt || '',
          body: blocksToEditorText(article.content),
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
