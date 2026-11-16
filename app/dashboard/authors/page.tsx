'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';
import { useUser } from '@/lib/useUser';

type Author = { id: number; name: string; nationality: string | null; birthDate: string | null };
const empty = { name: '', nationality: '', birthDate: '' };

export default function AuthorsPage() {
  const user = useUser();
  const [items, setItems] = useState<Author[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/authors').then((r) => setItems(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const body = { ...form, birthDate: form.birthDate || null };
    try {
      if (editingId) await api.put(`/authors/${editingId}`, body);
      else await api.post('/authors', body);
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function onDelete(id: number) {
    setError('');
    try {
      await api.delete(`/authors/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Autores</h1>
      {error && <p className="error">{error}</p>}
      {user?.isAdmin && (
        <form className="panel" onSubmit={onSubmit}>
          <div className="row">
            <label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Nacionalidade<input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></label>
            <label>Nascimento<input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
            <button className="btn-unipar" type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </form>
      )}
      <table>
        <thead><tr><th>Nome</th><th>Nacionalidade</th><th>Nascimento</th>{user?.isAdmin && <th></th>}</tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.nationality}</td>
              <td>{a.birthDate}</td>
              {user?.isAdmin && (
                <td>
                  <button onClick={() => { setEditingId(a.id); setForm({ name: a.name, nationality: a.nationality || '', birthDate: a.birthDate || '' }); }}>Editar</button>
                  <button onClick={() => onDelete(a.id)}>Excluir</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
