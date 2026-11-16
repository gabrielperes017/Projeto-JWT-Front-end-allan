'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { logout } from '@/lib/api';
import { useUser } from '@/lib/useUser';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) router.replace('/');
  }, [router]);

  async function onLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <>
      <header className="topbar">
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/categories">Categorias</Link>
          <Link href="/dashboard/authors">Autores</Link>
          <Link href="/dashboard/books">Livros</Link>
          <Link href="/dashboard/readers">Leitores</Link>
          <Link href="/dashboard/loans">Empréstimos</Link>
          {user?.isAdmin && <Link href="/dashboard/users">Atendentes</Link>}
        </nav>
        <div>
          {user?.name} <button onClick={onLogout}>Sair</button>
        </div>
      </header>
      <div className="page">{children}</div>
    </>
  );
}
