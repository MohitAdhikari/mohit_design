'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { textToBlocks } from '@/lib/dashboard/portableText';

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
  userRole?: 'admin' | 'editor';
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
  userRole,
}: ArticleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({ categories: [], tags: [] });
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(initialThumbnailUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pendingAssetId, setPendingAssetId] = useState<string | null>(null);
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
    setPendingAssetId(data.assetId);
  }

  function buildPayload(status?: 'draft' | 'in_review') {
    return {
      title: values.title,
      excerpt: values.excerpt,
      content: values.body ? textToBlocks(values.body) : [],
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
  async function setStatus(status: string) {
    setError(null);
    setSuccess(null);
    if (!articleId) return;
    setSaving(true);
    const res = await fetch(`/api/dashboard/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Failed to update status.'); return; }
    setSuccess(`Status set to ${status}.`);
    router.refresh();
  }

  async function save(status?: 'draft' | 'in_review') {
    setError(null);
    setSuccess(null);
    if (!values.title.trim()) { setError('Title is required.'); return; }

    setSaving(true);
    const payload = buildPayload(status);

    try {
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
        // Save failed — if we just uploaded a new image, clean it up
        if (pendingAssetId) {
          await fetch('/api/dashboard/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId: pendingAssetId }),
          }).catch(() => {}); // best-effort
          setThumbnail(null);
          setThumbnailPreview(initialThumbnailUrl);
          setPendingAssetId(null);
        }
        setSaving(false);
        setError(data.error || 'Failed to save article.');
        return;
      }

      setPendingAssetId(null); // asset committed, no longer orphan risk

      if (!articleId && data.article?._id) {
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
    } catch {
      setSaving(false);
      setError('Network error. Please try again.');
    }
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
      {userRole === 'admin' && articleId && (
        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-md border border-white/10">
          <span className="text-xs text-white/50 self-center mr-2 font-mono uppercase">Admin:</span>
          {['changes_requested','approved','scheduled','published'].map((s) => (
            <button
              key={s}
              type="button"
              disabled={saving || initialStatus === s}
              onClick={() => setStatus(s)}
              className={`text-xs px-3 py-1.5 rounded border transition disabled:opacity-40 font-mono uppercase tracking-wider
                ${s === 'published'
                  ? 'bg-green-600 border-green-600 text-white hover:bg-green-500'
                  : s === 'approved'
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-500'
                  : s === 'changes_requested'
                  ? 'bg-yellow-600 border-yellow-600 text-white hover:bg-yellow-500'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
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
          placeholder={`Supports markdown-lite:
## Heading 2  ### Heading 3
**bold**  _italic_  \`code\`

Double newline = new paragraph`}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <p className="text-[10px] text-white/30 mt-1 font-mono">
          ## h2 &nbsp;### h3 &nbsp;**bold** &nbsp;_italic_ &nbsp;\`code\` &nbsp;· double newline = new paragraph
        </p>
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
      {articleId && (
        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              if (!confirm('Delete this article? This cannot be undone.')) return;
              setSaving(true);
              const res = await fetch(`/api/dashboard/articles/${articleId}`, { method: 'DELETE' });
              const data = await res.json();
              setSaving(false);
              if (!res.ok) { setError(data.error || 'Failed to delete.'); return; }
              router.push('/dashboard/articles');
            }}
            className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-md px-3 py-2 transition disabled:opacity-40"
          >
            Delete article
          </button>
        </div>
      )}
    </div>
  );
}
