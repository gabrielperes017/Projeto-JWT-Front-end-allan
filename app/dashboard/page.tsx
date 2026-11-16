'use client';

import { useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';
import { useUser } from '@/lib/useUser';

type Totals = { totalBooks: number; activeLoans: number; overdueLoans: number; totalFines: number };

export default function Dashboard() {
  const user = useUser();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) return;
    api.get('/reports/dashboard').then((r) => setTotals(r.data)).catch((e) => setError(errorMessage(e)));
  }, [user]);

  if (user && !user.isAdmin) return <h1>Olá, {user.name}</h1>;

  return (
    <>
      <h1>Dashboard</h1>
      {error && <p className="error">{error}</p>}
      {totals && (
        <div className="cards">
          <div className="card">Total de livros<strong>{totals.totalBooks}</strong></div>
          <div className="card">Empréstimos ativos<strong>{totals.activeLoans}</strong></div>
          <div className="card">Atrasados<strong>{totals.overdueLoans}</strong></div>
          <div className="card">Multas<strong>R$ {totals.totalFines.toFixed(2)}</strong></div>
        </div>
      )}
    </>
  );
}
