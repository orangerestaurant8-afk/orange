'use client';
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Textarea } from '@/components/ui';
import { apiClient, apiError, type ApiLocation } from '@/lib/apiClient';
const blank = {
  name: '',
  address: '',
  contactNumber: '',
  openingTime: '',
  closingTime: '',
  deliveryCharge: '',
  minimumOrder: '',
  freeDeliveryThreshold: '',
  estimatedDeliveryTime: '',
  displayOrder: '0',
};
export default function LocationsPage() {
  const [rows, setRows] = useState<ApiLocation[]>([]);
  const [current, setCurrent] = useState<ApiLocation | null>(null);
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const load = () =>
    apiClient
      .get('/locations?admin=true')
      .then((r) => setRows(r.data.data))
      .catch((e) => setError(apiError(e)));
  useEffect(() => {
    void load();
  }, []);
  const edit = (row?: ApiLocation) => {
    setCurrent(row ?? null);
    setForm(
      row
        ? {
            name: row.name,
            address: row.address,
            contactNumber: row.contactNumber,
            openingTime: row.openingTime,
            closingTime: row.closingTime,
            deliveryCharge: String(row.deliveryCharge ?? ''),
            minimumOrder: String(row.minimumOrder),
            freeDeliveryThreshold: String(row.freeDeliveryThreshold ?? ''),
            estimatedDeliveryTime: row.estimatedDeliveryTime,
            displayOrder: String(row.displayOrder),
          }
        : blank,
    );
    setOpen(true);
  };
  const save = async () => {
    try {
      const body = {
        ...form,
        deliveryCharge: form.deliveryCharge ? Number(form.deliveryCharge) : undefined,
        minimumOrder: Number(form.minimumOrder || 0),
        freeDeliveryThreshold: form.freeDeliveryThreshold
          ? Number(form.freeDeliveryThreshold)
          : undefined,
        displayOrder: Number(form.displayOrder || 0),
        deliveryAreas: [],
        isActive: true,
        isAvailable: true,
      };
      current
        ? await apiClient.put(`/locations/${current._id}`, body)
        : await apiClient.post('/locations', body);
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
          <h1 className="font-display text-heading-lg text-admin-text">Locations & branches</h1>
          <p className="mt-2 text-admin-muted">
            Delivery availability and branch charges are managed here.
          </p>
        </div>
        <Button onClick={() => edit()}>Add location</Button>
      </div>
      {error && <p className="mt-4 text-danger">{error}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <article
            key={row._id}
            className="rounded-xl border border-admin-border bg-admin-raised p-5"
          >
            <h2 className="font-display text-heading-sm text-admin-text">{row.name}</h2>
            <p className="mt-2 text-sm text-admin-muted">{row.address || 'Address not set'}</p>
            <p className="mt-3 text-sm text-admin-text">
              Delivery: Rs. {row.deliveryCharge ?? 0} · Min: Rs. {row.minimumOrder}
            </p>
            <Button className="mt-4" size="sm" variant="secondary" onClick={() => edit(row)}>
              Edit
            </Button>
          </article>
        ))}
        {!rows.length && (
          <p className="rounded-xl border border-dashed border-admin-border p-6 text-admin-muted">
            Add your first real delivery location to enable customer location selection.
          </p>
        )}
      </div>
      <Modal
        open={open}
        title={current ? 'Edit location' : 'Add location'}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          <Input
            label="Location name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Delivery charge"
              type="number"
              value={form.deliveryCharge}
              onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })}
            />
            <Input
              label="Minimum order"
              type="number"
              value={form.minimumOrder}
              onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })}
            />
            <Input
              label="Free delivery threshold"
              type="number"
              value={form.freeDeliveryThreshold}
              onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })}
            />
            <Input
              label="Estimated delivery time"
              value={form.estimatedDeliveryTime}
              onChange={(e) => setForm({ ...form, estimatedDeliveryTime: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={save}>
            Save location
          </Button>
        </div>
      </Modal>
    </div>
  );
}
