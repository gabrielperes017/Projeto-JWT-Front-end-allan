# jwt-app — Sistema de Biblioteca (front-end)

Next.js 16 + React 19 + TypeScript + axios. Consome a `jwt-api`.

## Instalar

```bash
npm install
npm run dev     # http://localhost:3000
```

A API deve estar rodando (padrão `http://localhost:3001/v1`). Para outra URL, crie `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
```

Login do seed da API: `admin@biblioteca.com` / `123456`.

## Telas

Login, Dashboard (admin), Categorias, Autores, Livros (filtros e vários autores), Leitores (com histórico), Empréstimos (novo, filtro de status, devolução com multa) e Atendentes (somente admin). Nome do usuário e botão Sair no topo.

## Renovação automática do token

`lib/api.ts` tem um interceptor axios: ao receber `401`, chama `/auth/refresh` e repete a requisição. Várias requisições com 401 ao mesmo tempo compartilham **uma única** chamada de refresh (as demais esperam a mesma promise). Se o refresh falhar, a sessão é limpa e o usuário volta ao login.

## Decisões e riscos

- **Tokens no `localStorage`**: simples e funciona com o interceptor no navegador, mas qualquer script injetado (XSS) consegue ler os tokens. Alternativa mais segura: cookies `httpOnly` (exigiria um proxy no servidor Next).
- **Cookie `session`**: guarda só um marcador (sem token) para o `proxy.ts` redirecionar ao login. Não é segurança: a API valida o token em toda rota.
- **Menus de admin**: o menu Atendentes e os botões de escrita ficam ocultos para atendentes, mas a API também bloqueia (403).
- O login por server action foi substituído por login no cliente, necessário para o interceptor acessar os tokens.
