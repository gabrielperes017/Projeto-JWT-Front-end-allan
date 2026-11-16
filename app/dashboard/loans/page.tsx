'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';

type Loan = {
  id: number; loanDate: string; dueDate: string; returnDate: string | null; status: string; fine: number;
  Book: { title: string }; Reader: { name: string };
};
type Reader = { id: number; name: string; cpf: string };
type Book = { id: number; title: string; availableCopies: number };

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState('');
  const [readerSearch, setReaderSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [form, setForm] = useState({ readerId: '', bookId: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadLoans = useCallback(() => {
    api.get('/loans', { params: status ? { status } : {} })
      .then((r) => setLoans(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, [status]);
  useEffect(loadLoans, [loadLoans]);

  const loadOptions = useCallback(() => {
    api.get('/readers').then((r) => setReaders(r.data));
    api.get('/books', { params: { available: 'true' } }).then((r) => setBooks(r.data));
  }, []);
  useEffect(loadOptions, [loadOptions]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/loans', { readerId: Number(form.readerId), bookId: Number(form.bookId) });
      setForm({ readerId: '', bookId: '' });
      setMessage('Empréstimo registrado.');
      loadLoans();
      loadOptions();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function onReturn(id: number) {
    setError('');
    setMessage('');
    try {
      const r = await api.patch(`/loans/${id}/return`);
      setMessage(`Devolução registrada. Multa: R$ ${Number(r.data.fine).toFixed(2)}`);
      loadLoans();
      loadOptions();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const q = (s: string) => s.toLowerCase();
  const filteredReaders = readers.filter((r) => q(r.name).includes(q(readerSearch)) || r.cpf.includes(readerSearch));
  const filteredBooks = books.filter((b) => q(b.title).includes(q(bookSearch)));

  return (
    <>
      <h1>Empréstimos</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}

      <form className="panel" onSubmit={onSubmit}>
        <div className="row">
          <div>
            <label>Buscar leitor (nome ou CPF)<input value={readerSearch} onChange={(e) => setReaderSearch(e.target.value)} /></label>
            <select required value={form.readerId} onChange={(e) => setForm({ ...form, readerId: e.target.value })}>
              <option value="">Selecione o leitor</option>
              {filteredReaders.map((r) => <option key={r.id} value={r.id}>{r.name} - {r.cpf}</option>)}
            </select>
          </div>
          <div>
            <label>Buscar livro<input value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} /></label>
            <select required value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
              <option value="">Selecione o livro</option>
              {filteredBooks.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies})</option>)}
            </select>
          </div>
          <button className="btn-unipar" type="submit">Emprestar</button>
        </div>
      </form>

      <label>Status
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="ATRASADO">Atrasado</option>
          <option value="DEVOLVIDO">Devolvido</option>
        </select>
      </label>

      <table>
        <thead><tr><th>Livro</th><th>Leitor</th><th>Prazo</th><th>Devolução</th><th>Status</th><th>Multa</th><th></th></tr></thead>
        <tbody>
          {loans.map((l) => (
            <tr key={l.id}>
              <td>{l.Book?.title}</td>
              <td>{l.Reader?.name}</td>
              <td>{new Date(l.dueDate).toLocaleDateString()}</td>
              <td>{l.returnDate ? new Date(l.returnDate).toLocaleDateString() : '-'}</td>
              <td>{l.status}</td>
              <td>R$ {l.fine.toFixed(2)}</td>
              <td>{!l.returnDate && <button onClick={() => onReturn(l.id)}>Devolver</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
