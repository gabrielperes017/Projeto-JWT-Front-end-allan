'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';
import { useUser } from '@/lib/useUser';

type Category = { id: number; name: string; description: string | null };

export default function CategoriesPage() {
  const user = useUser();
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/categories').then((r) => setItems(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api.put(`/categories/${editingId}`, form);
      else await api.post('/categories', form);
      setForm({ name: '', description: '' });
      setEditingId(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function onDelete(id: number) {
    setError('');
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Categorias</h1>
      {error && <p className="error">{error}</p>}
      {user?.isAdmin && (
        <form className="panel" onSubmit={onSubmit}>
          <div className="row">
            <label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Descrição<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className="btn-unipar" type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </form>
      )}
      <table>
        <thead><tr><th>Nome</th><th>Descrição</th>{user?.isAdmin && <th></th>}</tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description}</td>
              {user?.isAdmin && (
                <td>
                  <button onClick={() => { setEditingId(c.id); setForm({ name: c.name, description: c.description || '' }); }}>Editar</button>
                  <button onClick={() => onDelete(c.id)}>Excluir</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
