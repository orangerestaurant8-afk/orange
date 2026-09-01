'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { apiClient, apiError, type ApiHeroSlide } from '@/lib/apiClient';

const tabs = [
  'Restaurant Info',
  'Home Carousel',
  'Delivery Zones & Fees',
  'Payment Methods',
  'Notifications',
  'Team Access',
];
const blank = {
  title: '',
  highlightedText: '',
  subtitle: '',
  imageUrl: '',
  ctaLabel: 'Explore the menu',
  isActive: true,
  displayOrder: 0,
};

export default function Settings() {
  const [active, setActive] = useState(tabs[0]);
  return (
    <div>
      <h1 className="font-display text-heading-lg text-admin-text">Settings</h1>
      <div className="mt-6 hidden border-b border-admin-border md:flex">
        {tabs.map((tab) => (
          <button
            onClick={() => setActive(tab)}
            key={tab}
            className={
              active === tab
                ? 'border-b-2 border-orange-500 px-4 py-3 text-body-sm text-orange-500'
                : 'px-4 py-3 text-body-sm text-admin-muted'
            }
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3 md:hidden">
        {tabs.map((tab) => (
          <details key={tab} className="rounded-xl border border-admin-border bg-admin-raised p-4">
            <summary className="cursor-pointer font-display text-heading-sm text-admin-text">
              {tab}
            </summary>
            {tab === 'Home Carousel' ? <CarouselSettings /> : <SettingsForm tab={tab} />}
          </details>
        ))}
      </div>
      <section className="hidden max-w-4xl rounded-xl border border-admin-border bg-admin-raised p-6 md:block">
        <h2 className="font-display text-heading-md text-admin-text">{active}</h2>
        {active === 'Home Carousel' ? <CarouselSettings /> : <SettingsForm tab={active} />}
      </section>
    </div>
  );
}

function CarouselSettings() {
  const [slides, setSlides] = useState<ApiHeroSlide[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const load = () =>
    apiClient
      .get('/hero-slides')
      .then((response) => setSlides(response.data.data ?? []))
      .catch((reason) => setError(apiError(reason)))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const update = (key: keyof typeof blank, value: string | boolean | number) =>
    setForm((current) => ({ ...current, [key]: value }));
  const edit = (slide?: ApiHeroSlide) => {
    setError('');
    setEditing(slide?._id ?? null);
    setForm(
      slide
        ? {
            title: slide.title,
            highlightedText: slide.highlightedText,
            subtitle: slide.subtitle,
            imageUrl: slide.imageUrl,
            ctaLabel: slide.ctaLabel,
            isActive: slide.isActive,
            displayOrder: slide.displayOrder,
          }
        : blank,
    );
  };
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('image', file);
      const response = await apiClient.post('/upload?folder=hero', body);
      update('imageUrl', response.data.data.secure_url);
    } catch (reason) {
      setError(apiError(reason));
    } finally {
      setUploading(false);
    }
  };
  const save = async () => {
    if (!form.title || !form.subtitle || !form.imageUrl) {
      setError('Title, description, and a hero image are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) await apiClient.put(`/hero-slides/${editing}`, form);
      else await apiClient.post('/hero-slides', form);
      edit();
      await load();
    } catch (reason) {
      setError(apiError(reason));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Delete this carousel slide?')) return;
    try {
      await apiClient.delete(`/hero-slides/${id}`);
      await load();
    } catch (reason) {
      setError(apiError(reason));
    }
  };
  return (
    <div className="mt-5 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="text-body-sm text-admin-muted">
          Manage the large banner on the customer homepage. Use landscape images at least 2200 ×
          900px for sharp results.
        </p>
        {loading ? (
          <div className="mt-5 h-32 animate-pulse rounded-xl bg-admin-surface" />
        ) : (
          <div className="mt-5 space-y-3">
            {slides.map((slide) => (
              <article
                key={slide._id}
                className="flex gap-3 rounded-xl border border-admin-border bg-admin-surface p-3"
              >
                <img src={slide.imageUrl} alt="" className="h-20 w-28 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-admin-text">
                    {slide.title} {slide.highlightedText}
                  </b>
                  <small className="text-admin-muted">
                    {slide.isActive ? 'Visible' : 'Hidden'} · Position {slide.displayOrder}
                  </small>
                  <div className="mt-2 flex gap-3 text-sm">
                    <button onClick={() => edit(slide)} className="text-orange-500">
                      Edit
                    </button>
                    <button onClick={() => remove(slide._id)} className="text-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {!slides.length && (
              <p className="rounded-xl border border-dashed border-admin-border p-4 text-sm text-admin-muted">
                No custom slides yet. The storefront is showing its default banners.
              </p>
            )}
          </div>
        )}
      </div>
      <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
        <h3 className="font-display text-heading-sm text-admin-text">
          {editing ? 'Edit carousel slide' : 'New carousel slide'}
        </h3>
        <div className="mt-4 space-y-4">
          <Input
            label="Heading"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            className="bg-admin-raised text-admin-text"
          />
          <Input
            label="Orange highlighted text"
            value={form.highlightedText}
            onChange={(event) => update('highlightedText', event.target.value)}
            className="bg-admin-raised text-admin-text"
          />
          <Input
            label="Description"
            value={form.subtitle}
            onChange={(event) => update('subtitle', event.target.value)}
            className="bg-admin-raised text-admin-text"
          />
          <Input
            label="Button text"
            value={form.ctaLabel}
            onChange={(event) => update('ctaLabel', event.target.value)}
            className="bg-admin-raised text-admin-text"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Display position"
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={(event) => update('displayOrder', Number(event.target.value))}
              className="bg-admin-raised text-admin-text"
            />
            <Select
              label="Visibility"
              value={String(form.isActive)}
              onChange={(event) => update('isActive', event.target.value === 'true')}
              className="bg-admin-raised text-admin-text"
            >
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </Select>
          </div>
          <label className="block text-body-sm font-semibold text-admin-muted">
            Hero image{' '}
            <input
              className="mt-2 block w-full text-sm text-admin-muted"
              type="file"
              accept="image/*"
              onChange={(event) => upload(event.target.files?.[0])}
            />
          </label>
          <Input
            label="Image URL"
            value={form.imageUrl}
            onChange={(event) => update('imageUrl', event.target.value)}
            className="bg-admin-raised text-admin-text"
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Hero preview"
              className="h-32 w-full rounded-lg object-cover"
            />
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <Button loading={saving || uploading} onClick={save}>
              {editing ? 'Update slide' : 'Add slide'}
            </Button>
            {editing && (
              <Button variant="ghost" onClick={() => edit()}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsForm({ tab }: { tab: string }) {
  return (
    <div className="mt-5 space-y-4">
      <Input
        label={tab === 'Restaurant Info' ? 'Restaurant name' : 'Configuration'}
        defaultValue={tab === 'Restaurant Info' ? 'Orange Cloud Kitchen' : ''}
        className="bg-admin-surface text-admin-text"
      />
      {tab === 'Delivery Zones & Fees' && (
        <Select label="Delivery zone" className="bg-admin-surface text-admin-text">
          <option>Karachi Central — Rs 99</option>
          <option>DHA / Clifton — Rs 149</option>
        </Select>
      )}
      <Button>Save changes</Button>
    </div>
  );
}
