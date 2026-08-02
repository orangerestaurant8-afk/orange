'use client';
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { apiClient, apiError, type ApiCategory, type ApiMenuItem } from '@/lib/apiClient';

const pkr = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;
type Form = { name: string; description: string; price: string; category: string; imageUrl: string };
const blank: Form = { name: '', description: '', price: '', category: '', imageUrl: '' };

export default function AdminMenu() {
  const [items, setItems] = useState<ApiMenuItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [selected, setSelected] = useState<ApiMenuItem | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = () => Promise.all([apiClient.get('/menu'), apiClient.get('/categories')]).then(([menu, category]) => { setItems(menu.data.data); setCategories(category.data.data); }).catch((e) => setError(apiError(e)));
  useEffect(() => { void load(); }, []);
  const openEditor = (item?: ApiMenuItem) => { setError(''); setSelected(item ?? null); setForm(item ? { name: item.name, description: item.description, price: String(item.price), category: typeof item.category === 'string' ? item.category : item.category._id, imageUrl: item.imageUrl } : { ...blank, category: categories[0]?._id ?? '' }); setOpen(true); };
  const uploadImage = async (file?: File) => { if (!file) return; if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { setError('Select an image no larger than 5MB.'); return; } setUploading(true); setError(''); try { const body = new FormData(); body.append('image', file); const result = await apiClient.post('/upload', body); setForm((value) => ({ ...value, imageUrl: result.data.data.secure_url })); } catch (e) { setError(apiError(e)); } finally { setUploading(false); } };
  const save = async () => { setSaving(true); setError(''); try { const body = { ...form, price: Number(form.price), addOns: [], isAvailable: selected?.isAvailable ?? true, spiceLevel: selected?.spiceLevel ?? 'medium' }; if (!body.imageUrl) throw new Error('Upload an image before saving.'); if (selected) await apiClient.put(`/menu/${selected._id}`, body); else await apiClient.post('/menu', body); setOpen(false); await load(); } catch (e) { setError(e instanceof Error ? e.message : apiError(e)); } finally { setSaving(false); } };
  return <div><div className="flex items-center justify-between"><h1 className="font-display text-heading-lg text-admin-text">Menu management</h1><Button onClick={() => openEditor()}>Add item</Button></div>{error && <p className="mt-4 text-danger">{error}</p>}{!items.length ? <div className="mt-6 h-64 animate-pulse rounded-xl bg-admin-surface" /> : <section className="mt-6 overflow-x-auto rounded-xl border border-admin-border bg-admin-raised p-5"><table className="w-full min-w-[40rem] text-left text-body-sm"><thead className="text-admin-muted"><tr><th>Item</th><th>Price</th><th>Available</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t border-admin-border text-admin-text"><td className="py-3">{item.name}</td><td>{pkr(item.price)}</td><td>{item.isAvailable ? 'Yes' : 'No'}</td><td><button className="text-orange-500" onClick={() => openEditor(item)}>Edit</button></td></tr>)}</tbody></table></section>}<Modal open={open} title={selected ? 'Edit menu item' : 'Add menu item'} onClose={() => setOpen(false)}><div className="space-y-4"><Input label="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/><Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/><Input label="Price (PKR)" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}/><Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</Select><label className="block text-body-sm font-semibold text-neutral-copy">Image<input className="mt-2 block w-full text-body-sm" type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])}/></label>{uploading && <div className="h-10 animate-pulse rounded bg-neutral-soft" />}{form.imageUrl && <img src={form.imageUrl} alt="Menu item preview" className="h-32 w-full rounded-lg object-cover"/>}<Button className="w-full" loading={saving || uploading} onClick={save}>Save item</Button></div></Modal></div>;
}
