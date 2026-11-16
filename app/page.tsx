'use client';

import { login, errorMessage } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setIsPending(true);
    setError(null);
    try {
      await login(String(form.get('email')), String(form.get('password')));
      router.push('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main style={{ maxWidth: 380, margin: '80px auto' }}>
      <h1>Entrar na plataforma</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" required />

        <button className="btn-unipar" disabled={isPending} type="submit">Entrar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
