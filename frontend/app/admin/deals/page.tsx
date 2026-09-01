'use client';
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Textarea } from '@/components/ui';
import { apiClient, apiError, type ApiDeal } from '@/lib/apiClient';
const blank = {
  name: '',
  description: '',
  imageUrl: '',
  price: '',
  originalPrice: '',
  displayOrder: '0',
};
export default function DealsPage() {
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<ApiDeal | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const load = () =>
    apiClient
      .get('/deals?admin=true')
      .then((r) => setDeals(r.data.data))
      .catch((e) => setError(apiError(e)));
  useEffect(() => {
    void load();
  }, []);
  const edit = (d?: ApiDeal) => {
    setEditing(d ?? null);
    setForm(
      d
        ? {
            name: d.name,
            description: d.description,
            imageUrl: d.imageUrl,
            price: String(d.price),
            originalPrice: d.originalPrice ? String(d.originalPrice) : '',
            displayOrder: String(d.displayOrder),
          }
        : blank,
    );
    setOpen(true);
  };
  const save = async () => {
    try {
      const body = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        displayOrder: Number(form.displayOrder),
        includedItems: [],
        choices: [],
        locationIds: [],
        availabilityDays: [],
        featured: false,
        isActive: true,
      };
      editing
        ? await apiClient.put(`/deals/${editing._id}`, body)
        : await apiClient.post('/deals', body);
      setOpen(false);
      load();
    } catch (e) {
      setError(apiError(e));
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading-lg text-admin-text">Deals</h1>
          <p className="mt-2 text-admin-muted">
            Create active, time-aware offers using real menu data.
          </p>
        </div>
        <Button onClick={() => edit()}>Add deal</Button>
      </div>
      {error && <p className="mt-4 text-danger">{error}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {deals.map((d) => (
          <article
            key={d._id}
            className="rounded-xl border border-admin-border bg-admin-raised p-5"
          >
            <h2 className="font-display text-heading-sm text-admin-text">{d.name}</h2>
            <p className="mt-2 text-sm text-admin-muted">{d.description}</p>
            <p className="mt-4 font-bold text-orange-500">Rs. {d.price}</p>
            <Button className="mt-4" size="sm" variant="secondary" onClick={() => edit(d)}>
              Edit
            </Button>
          </article>
        ))}
        {!deals.length && (
          <p className="rounded-xl border border-dashed border-admin-border p-6 text-admin-muted">
            No deals configured.
          </p>
        )}
      </div>
      <Modal
        open={open}
        title={editing ? 'Edit deal' : 'Create deal'}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          <Input
            label="Deal name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deal price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Original price"
              type="number"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={save}>
            Save deal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
