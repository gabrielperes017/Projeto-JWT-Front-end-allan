'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';
import { useUser } from '@/lib/useUser';

type Option = { id: number; name: string };
type Book = {
  id: number; title: string; isbn: string; year: number | null;
  totalCopies: number; availableCopies: number; categoryId: number;
  Category: Option; Authors: Option[];
};
const empty = { title: '', isbn: '', year: '', totalCopies: '1', categoryId: '', authorIds: [] as string[] };

export default function BooksPage() {
  const user = useUser();
  const [items, setItems] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [authors, setAuthors] = useState<Option[]>([]);
  const [filters, setFilters] = useState({ title: '', categoryId: '', authorId: '', available: false });
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const params: Record<string, string> = {};
    if (filters.title) params.title = filters.title;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.authorId) params.authorId = filters.authorId;
    if (filters.available) params.available = 'true';
    api.get('/books', { params }).then((r) => setItems(r.data)).catch((e) => setError(errorMessage(e)));
  }, [filters]);
  useEffect(load, [load]);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
    api.get('/authors').then((r) => setAuthors(r.data));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const body = {
      title: form.title,
      isbn: form.isbn,
      year: form.year ? Number(form.year) : null,
      totalCopies: Number(form.totalCopies),
      categoryId: Number(form.categoryId),
      authorIds: form.authorIds.map(Number),
    };
    try {
      if (editingId) await api.put(`/books/${editingId}`, body);
      else await api.post('/books', body);
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
      await api.delete(`/books/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Livros</h1>
      {error && <p className="error">{error}</p>}

      <div className="panel">
        <div className="row">
          <label>Título<input value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.target.value })} /></label>
          <label>Categoria
            <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
              <option value="">Todas</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Autor
            <select value={filters.authorId} onChange={(e) => setFilters({ ...filters, authorId: e.target.value })}>
              <option value="">Todos</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label><input type="checkbox" checked={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.checked })} />Só disponíveis</label>
        </div>
      </div>

      {user?.isAdmin && (
        <form className="panel" onSubmit={onSubmit}>
          <div className="row">
            <label>Título<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>ISBN<input required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></label>
            <label>Ano<input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label>
            <label>Exemplares<input type="number" min="1" required value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} /></label>
            <label>Categoria
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Selecione</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Autores (Ctrl para vários)
              <select multiple value={form.authorIds} onChange={(e) => setForm({ ...form, authorIds: Array.from(e.target.selectedOptions, (o) => o.value) })}>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <button className="btn-unipar" type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </form>
      )}

      <table>
        <thead><tr><th>Título</th><th>ISBN</th><th>Categoria</th><th>Autores</th><th>Disponíveis</th>{user?.isAdmin && <th></th>}</tr></thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.isbn}</td>
              <td>{b.Category?.name}</td>
              <td>{b.Authors.map((a) => a.name).join(', ')}</td>
              <td>{b.availableCopies} / {b.totalCopies}</td>
              {user?.isAdmin && (
                <td>
                  <button onClick={() => {
                    setEditingId(b.id);
                    setForm({
                      title: b.title, isbn: b.isbn, year: b.year ? String(b.year) : '',
                      totalCopies: String(b.totalCopies), categoryId: String(b.categoryId),
                      authorIds: b.Authors.map((a) => String(a.id)),
                    });
                  }}>Editar</button>
                  <button onClick={() => onDelete(b.id)}>Excluir</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
