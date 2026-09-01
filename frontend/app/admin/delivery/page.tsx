'use client';
import { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { apiClient, apiError } from '@/lib/apiClient';
export default function DeliveryPage() {
  const [form, setForm] = useState({
    defaultDeliveryCharge: '',
    minimumOrder: '',
    freeDeliveryThreshold: '',
    deliveryEnabled: true,
    pickupEnabled: false,
  });
  const [message, setMessage] = useState('');
  useEffect(() => {
    apiClient
      .get('/delivery-settings')
      .then((r) => {
        const s = r.data.data;
        setForm({
          defaultDeliveryCharge: String(s.defaultDeliveryCharge),
          minimumOrder: String(s.minimumOrder),
          freeDeliveryThreshold:
            s.freeDeliveryThreshold === undefined ? '' : String(s.freeDeliveryThreshold),
          deliveryEnabled: s.deliveryEnabled,
          pickupEnabled: s.pickupEnabled,
        });
      })
      .catch((e) => setMessage(apiError(e)));
  }, []);
  const save = async () => {
    try {
      await apiClient.put('/delivery-settings', {
        ...form,
        defaultDeliveryCharge: Number(form.defaultDeliveryCharge),
        minimumOrder: Number(form.minimumOrder),
        freeDeliveryThreshold: form.freeDeliveryThreshold
          ? Number(form.freeDeliveryThreshold)
          : undefined,
      });
      setMessage('Delivery settings saved.');
    } catch (e) {
      setMessage(apiError(e));
    }
  };
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-heading-lg text-admin-text">Delivery settings</h1>
      <p className="mt-2 text-admin-muted">
        These are server-calculated at checkout; location and delivery-area rules take priority.
      </p>
      <div className="mt-6 space-y-4 rounded-xl border border-admin-border bg-admin-raised p-6">
        <Input
          label="Default delivery charge"
          type="number"
          value={form.defaultDeliveryCharge}
          onChange={(e) => setForm({ ...form, defaultDeliveryCharge: e.target.value })}
        />
        <Input
          label="Default minimum order"
          type="number"
          value={form.minimumOrder}
          onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })}
        />
        <Input
          label="Free delivery threshold (optional)"
          type="number"
          value={form.freeDeliveryThreshold}
          onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })}
        />
        <label className="flex gap-3 text-admin-text">
          <input
            type="checkbox"
            checked={form.deliveryEnabled}
            onChange={(e) => setForm({ ...form, deliveryEnabled: e.target.checked })}
          />{' '}
          Delivery available
        </label>
        <label className="flex gap-3 text-admin-text">
          <input
            type="checkbox"
            checked={form.pickupEnabled}
            onChange={(e) => setForm({ ...form, pickupEnabled: e.target.checked })}
          />{' '}
          Pickup available
        </label>
        <Button onClick={save}>Save delivery settings</Button>
        {message && <p className="text-sm text-admin-muted">{message}</p>}
      </div>
    </div>
  );
}
