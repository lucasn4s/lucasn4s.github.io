# Deploy no GitHub Pages

## Decisões

- **Repositório:** `lucasn4s.github.io` (user page, serve na raiz)
- **Domínio:** sem DNS por enquanto → roda em `https://lucasn4s.github.io`
- **Trigger:** push em `main`
- **Output:** Astro 5 static (default) → `dist/`
- **Workflow:** GitHub Actions com `withastro/action@v5`

## Arquivos alterados

- `astro.config.mjs` — `site: 'https://lucasn4s.github.io'` (temporário até DNS do `lucasn4s.dev` estar pronto)
- `.github/workflows/deploy.yml` — workflow oficial Astro Actions, Node 20, push no `main` → GitHub Pages
  - `permissions`: `contents: read`, `pages: write`, `id-token: write`
  - `concurrency.group: pages` (evita deploys concorrentes)
  - 2 jobs: `build` (withastro/action@v5) + `deploy` (actions/deploy-pages@v4)
  - `environment: github-pages` (cria automaticamente o env no primeiro run)

## Passos manuais (executar uma vez)

### 1. Configurar GitHub Pages
- Repo no GH → **Settings** → **Pages** → **Source**: `GitHub Actions`

### 2. Primeiro commit + push
```bash
git add .
git commit -m "feat: initial portfolio + GH Pages workflow"
git branch -M main
git remote add origin git@github.com:lucasn4s/lucasn4s.github.io.git
git push -u origin main
```

### 3. Acompanhar o primeiro deploy
- Aba **Actions** → workflow "Deploy to GitHub Pages"
- Conclui em ~30-60s
- Sobe em `https://lucasn4s.github.io` (com `/pt/` pra versão PT)

## Workflow do dia a dia

A partir do primeiro push, **toda vez que der `git push` no `main`** o site atualiza sozinho:

```bash
git add .
git commit -m "..."
git push
```

Acompanhar em: `https://github.com/lucasn4s/lucasn4s.github.io/actions`

## Migração futura pro `lucasn4s.dev`

Quando quiser usar o domínio próprio:

1. **DNS** — apontar pro GitHub Pages:
   - **A records** (recomendado): `185.199.108.153`, `185.199.110.153`, `185.199.109.153`, `185.199.111.153`
   - **OU** CNAME → `lucasn4s.github.io`
2. **CNAME file** — criar `public/CNAME` (Astro copia pro `dist/`):
   ```
   lucasn4s.dev
   ```
3. **astro.config.mjs** — voltar `site` pra:
   ```js
   site: 'https://lucasn4s.dev'
   ```
4. **HTTPS** — em Settings → Pages → marcar **Enforce HTTPS** (depois que o certificado do Let's Encrypt provisionar, pode levar até ~15min após o DNS propagar)
5. Commit + push → o workflow rebuilda e o domínio custom passa a valer

## Troubleshooting rápido

| Sintoma | Causa provável | Solução |
|---|---|---|
| Workflow não aparece em Actions | Falta o push no `main` | Verificar branch default + `git push` |
| Build falha no `withastro/action` | Versão do Node do setup-node | A action v5 já usa Node 20+ automaticamente |
| 404 em `/pt/` | I18n config ok, mas cache do browser | Hard refresh (Ctrl+Shift+R) |
| CSS quebrado depois do deploy | `site` errado gera URLs absolutas quebradas | Conferir `site` no `astro.config.mjs` |
| `403` no Pages deploy | Permissões do workflow faltando | `Settings → Actions → General → Workflow permissions: Read and write` + re-rodar |
