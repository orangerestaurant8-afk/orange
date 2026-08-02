'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { apiClient, apiError } from '@/lib/apiClient';
import { useAuthStore } from '@/lib/store/authStore';

export default function AdminLogin() {
  const router = useRouter(); const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('admin@orange.online'); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); setError(''); try { const response = await apiClient.post('/auth/admin/login', { email, password }); setSession(response.data.data.accessToken, response.data.data.user); router.push('/admin'); } catch (requestError) { setError(apiError(requestError)); } finally { setLoading(false); } };
  return <main className="grid min-h-screen place-items-center bg-admin-base p-6"><section className="w-full max-w-md rounded-xl border border-admin-border bg-admin-surface p-8 shadow-admin"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">Orange</p><h1 className="mt-3 font-display text-heading-lg text-admin-text">Admin portal</h1><p className="mt-3 text-admin-muted">Sign in to manage orders, menus, and customers.</p><div className="mt-8 space-y-5"><Input type="email" label="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className="bg-admin-raised text-admin-text" /><Input type="password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} className="bg-admin-raised text-admin-text" onKeyDown={(event) => { if (event.key === 'Enter') void submit(); }} /></div>{error && <p className="mt-4 text-sm text-danger">{error}</p>}<Button className="mt-7 w-full" loading={loading} onClick={submit}>Sign in</Button></section></main>;
}
