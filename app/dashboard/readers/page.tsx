'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';

type Reader = { id: number; name: string; cpf: string; email: string | null; phone: string | null };
type Loan = { id: number; loanDate: string; dueDate: string; returnDate: string | null; status: string; fine: number; Book: { title: string } };
const empty = { name: '', cpf: '', email: '', phone: '' };

export default function ReadersPage() {
  const [items, setItems] = useState<Reader[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [history, setHistory] = useState<{ reader: Reader; loans: Loan[] } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/readers').then((r) => setItems(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api.put(`/readers/${editingId}`, form);
      else await api.post('/readers', form);
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function showHistory(reader: Reader) {
    setError('');
    try {
      const r = await api.get(`/readers/${reader.id}/loans`);
      setHistory({ reader, loans: r.data });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Leitores</h1>
      {error && <p className="error">{error}</p>}
      <form className="panel" onSubmit={onSubmit}>
        <div className="row">
          <label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>CPF<input required value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></label>
          <label>E-mail<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Telefone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <button className="btn-unipar" type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
        </div>
      </form>

      <table>
        <thead><tr><th>Nome</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th></th></tr></thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.cpf}</td>
              <td>{r.email}</td>
              <td>{r.phone}</td>
              <td>
                <button onClick={() => { setEditingId(r.id); setForm({ name: r.name, cpf: r.cpf, email: r.email || '', phone: r.phone || '' }); }}>Editar</button>
                <button onClick={() => showHistory(r)}>Histórico</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {history && (
        <div className="panel">
          <h2>Histórico de {history.reader.name}</h2>
          <table>
            <thead><tr><th>Livro</th><th>Empréstimo</th><th>Prazo</th><th>Devolução</th><th>Status</th><th>Multa</th></tr></thead>
            <tbody>
              {history.loans.map((l) => (
                <tr key={l.id}>
                  <td>{l.Book?.title}</td>
                  <td>{new Date(l.loanDate).toLocaleDateString()}</td>
                  <td>{new Date(l.dueDate).toLocaleDateString()}</td>
                  <td>{l.returnDate ? new Date(l.returnDate).toLocaleDateString() : '-'}</td>
                  <td>{l.status}</td>
                  <td>R$ {l.fine.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
