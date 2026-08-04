'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Taxonomy {
  categories: { _id: string; title: string }[];
  tags: { _id: string; title: string }[];
}

export interface ArticleFormValues {
  title: string;
  excerpt: string;
  body: string;
  categoryRef: string;
  tags: string[];
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
}

interface ArticleFormProps {
  articleId?: string;
  initialValues?: Partial<ArticleFormValues>;
  initialStatus?: string;
  initialThumbnailUrl?: string;
}

const EMPTY_VALUES: ArticleFormValues = {
  title: '',
  excerpt: '',
  body: '',
  categoryRef: '',
  tags: [],
  seoTitle: '',
  metaDescription: '',
  focusKeyword: '',
};

export default function ArticleForm({
  articleId,
  initialValues,
  initialStatus,
  initialThumbnailUrl,
}: ArticleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({ categories: [], tags: [] });
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(initialThumbnailUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/taxonomy')
      .then((r) => r.json())
      .then((data) => setTaxonomy({ categories: data.categories || [], tags: data.tags || [] }))
      .catch(() => {});
  }, []);

  function updateField<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tagId: string) {
    setValues((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setError(null);
    const res = await fetch('/api/dashboard/upload', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Image upload failed.');
      return;
    }

    setThumbnail(data.image);
    setThumbnailPreview(data.url);
  }

  function buildPayload(status?: 'draft' | 'in_review') {
    return {
      title: values.title,
      excerpt: values.excerpt,
      content: values.body
        ? [{ _type: 'block', style: 'normal', children: [{ _type: 'span', text: values.body }] }]
        : [],
      thumbnail: thumbnail || undefined,
      imageAlt: values.title,
      categoryRef: values.categoryRef || undefined,
      tags: values.tags,
      seo: {
        seoTitle: values.seoTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        focusKeyword: values.focusKeyword || undefined,
      },
      ...(status ? { status } : {}),
    };
  }

  async function save(status?: 'draft' | 'in_review') {
    setError(null);
    setSuccess(null);

    if (!values.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    const payload = buildPayload(status);

    const res = articleId
      ? await fetch(`/api/dashboard/articles/${articleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/dashboard/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, status: undefined }),
        });

    const data = await res.json();

    if (!res.ok) {
      setSaving(false);
      setError(data.error || 'Failed to save article.');
      return;
    }

    if (!articleId && data.article?._id) {
      // New articles are always created as drafts; apply the requested
      // status (e.g. in_review) with an immediate follow-up patch.
      if (status === 'in_review') {
        await fetch(`/api/dashboard/articles/${data.article._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_review' }),
        });
      }
      setSaving(false);
      router.push(`/dashboard/articles/${data.article._id}`);
      return;
    }

    setSaving(false);

    setSuccess(status === 'in_review' ? 'Submitted for review.' : 'Saved.');
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2">
          {success}
        </div>
      )}
      {initialStatus && (
        <p className="text-xs font-mono uppercase text-white/50">Status: {initialStatus}</p>
      )}

      <div>
        <label className="block text-xs text-white/60 mb-1">Title</label>
        <input
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1">Excerpt</label>
        <textarea
          rows={2}
          value={values.excerpt}
          onChange={(e) => updateField('excerpt', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1">Body</label>
        <textarea
          rows={8}
          value={values.body}
          onChange={(e) => updateField('body', e.target.value)}
          placeholder="Plain text for now — rich block editing can be added later without changing the API."
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1">Featured Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
        {thumbnailPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailPreview} alt="Preview" className="mt-2 h-32 rounded-md object-cover" />
        )}
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1">Category</label>
        <select
          value={values.categoryRef}
          onChange={(e) => updateField('categoryRef', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="">Select a category</option>
          {taxonomy.categories.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2">
          {taxonomy.tags.map((tag) => (
            <button
              type="button"
              key={tag._id}
              onClick={() => toggleTag(tag._id)}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                values.tags.includes(tag._id)
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              {tag.title}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="border border-white/10 rounded-md p-4 space-y-3">
        <legend className="text-xs text-white/60 px-1">SEO</legend>
        <input
          placeholder="SEO title"
          value={values.seoTitle}
          onChange={(e) => updateField('seoTitle', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <textarea
          rows={2}
          placeholder="Meta description"
          value={values.metaDescription}
          onChange={(e) => updateField('metaDescription', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          placeholder="Focus keyword"
          value={values.focusKeyword}
          onChange={(e) => updateField('focusKeyword', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
      </fieldset>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => save('draft')}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-sm font-semibold rounded-md px-4 py-2 transition"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => save('in_review')}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-md px-4 py-2 transition"
        >
          Submit for Review
        </button>
      </div>
    </div>
  );
}
