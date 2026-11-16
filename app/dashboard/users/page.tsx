'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';
import { useUser } from '@/lib/useUser';

type Attendant = { id: number; name: string; username: string; email: string; isAdmin: boolean; active: boolean };
const empty = { name: '', username: '', email: '', password: '', isAdmin: false };

export default function UsersPage() {
  const router = useRouter();
  const user = useUser();
  const [items, setItems] = useState<Attendant[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  const load = useCallback(() => {
    api.get('/user').then((r) => setItems(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(() => {
    if (user?.isAdmin) load();
  }, [user, load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/user', form);
      setForm(empty);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function toggleActive(a: Attendant) {
    setError('');
    try {
      await api.patch(`/user/${a.id}/active`, { active: !a.active });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Atendentes</h1>
      {error && <p className="error">{error}</p>}
      <form className="panel" onSubmit={onSubmit}>
        <div className="row">
          <label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Usuário<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
          <label>E-mail<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Senha<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label><input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />Administrador</label>
          <button className="btn-unipar" type="submit">Cadastrar</button>
        </div>
      </form>

      <table>
        <thead><tr><th>Nome</th><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Ativo</th><th></th></tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.username}</td>
              <td>{a.email}</td>
              <td>{a.isAdmin ? 'Administrador' : 'Atendente'}</td>
              <td>{a.active ? 'Sim' : 'Não'}</td>
              <td><button onClick={() => toggleActive(a)}>{a.active ? 'Desativar' : 'Ativar'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
