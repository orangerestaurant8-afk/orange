'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { apiClient, apiError, type ApiCategory } from '@/lib/apiClient';

const icons: Record<string, string> = {
  'Fast Food': 'lunch_dining',
  'Chinese Food': 'ramen_dining',
  BBQ: 'outdoor_grill',
};

export default function Categories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ApiCategory | null>(null);
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [saving, setSaving] = useState(false);
  const load = () =>
    apiClient
      .get('/categories', { params: { admin: true } })
      .then((response) => setCategories(response.data.data))
      .catch((requestError) => setError(apiError(requestError)));
  useEffect(() => {
    void load();
  }, []);
  const edit = (category?: ApiCategory) => {
    setSelected(category ?? null);
    setName(category?.name ?? '');
    setDisplayOrder(String(category?.displayOrder ?? categories.length));
    setOpen(true);
  };
  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Enter a category name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = { name: cleanName, displayOrder: Number(displayOrder) };
      if (selected) await apiClient.put(`/categories/${selected._id}`, body);
      else await apiClient.post('/categories', body);
      setOpen(false);
      await load();
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (category: ApiCategory) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    try {
      await apiClient.delete(`/categories/${category._id}`);
      await load();
    } catch (requestError) {
      setError(apiError(requestError));
    }
  };
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[29px] font-semibold text-admin-text">
            Category Management
          </h1>
          <p className="mt-2 text-admin-muted">
            Organize and manage your restaurant&apos;s menu structures.
          </p>
        </div>
        <Button onClick={() => edit()}>
          <span className="material-symbols-outlined">add</span>Add Category
        </Button>
      </div>
      {error && <p className="mt-5 rounded-lg bg-danger/10 p-3 text-danger">{error}</p>}
      <section className="mt-8 overflow-hidden rounded-2xl border border-admin-border bg-admin-raised">
        <div className="hidden grid-cols-[1fr_160px_120px] gap-4 border-b border-admin-border px-7 py-5 text-sm font-semibold uppercase tracking-wide text-admin-muted md:grid">
          <span>Category</span>
          <span>Display order</span>
          <span>Actions</span>
        </div>
        {!categories.length ? (
          <div className="h-40 animate-pulse bg-admin-surface" />
        ) : (
          categories.map((category) => (
            <article
              key={category._id}
              className="flex items-center gap-4 border-b border-admin-border p-5 last:border-0 md:grid md:grid-cols-[1fr_160px_120px] md:px-7"
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="grid size-12 place-items-center rounded-xl bg-orange-500/15 text-orange-500">
                  <span className="material-symbols-outlined">
                    {icons[category.name] ?? 'category'}
                  </span>
                </span>
                <span>
                  <b className="block text-[18px] text-admin-text">{category.name}</b>
                  <small className="text-admin-muted md:hidden">
                    Display order: {category.displayOrder}
                  </small>
                </span>
              </span>
              <span className="hidden text-admin-text md:block">{category.displayOrder}</span>
              <span className="ml-auto flex gap-2">
                <button
                  onClick={() => edit(category)}
                  aria-label={`Edit ${category.name}`}
                  className="grid size-10 place-items-center rounded-lg bg-admin-border text-admin-text"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  onClick={() => remove(category)}
                  aria-label={`Delete ${category.name}`}
                  className="grid size-10 place-items-center rounded-lg text-danger hover:bg-danger/10"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </span>
            </article>
          ))
        )}
      </section>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Stat label="Categories" value={String(categories.length)} icon="category" />
        <Stat label="Total items" value="Active menu" icon="inventory_2" />
        <Stat label="Last modified" value="Just now" icon="schedule" />
      </div>
      <Modal
        open={open}
        title={selected ? 'Edit category' : 'Add category'}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-5">
          <Input
            label="Category name"
            value={name}
            placeholder="e.g. Desserts"
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Display order"
            type="number"
            min="0"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
          />
          <Button className="w-full" loading={saving} onClick={save}>
            Save category
          </Button>
        </div>
      </Modal>
    </div>
  );
}
function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <span className="material-symbols-outlined text-orange-500">{icon}</span>
      <p className="mt-3 text-sm text-admin-muted">{label}</p>
      <p className="mt-1 font-display text-[22px] text-admin-text">{value}</p>
    </div>
  );
}
