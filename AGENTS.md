<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Luckydental portal
- Portal code ported from the original Next.js app lives in `src/portal/`; route files in `src/routes/` only import its pages. Why: keeps the original screens intact and easy to diff.
- `next/link` and `next/navigation` are replaced by shims in `src/portal/shims/`. Why: the legacy pages keep their original imports' API.
- All `/api/*` calls go through `src/routes/api/$.ts`, which proxies to the clinic's existing backend (`BACKEND_URL`, default api.luckydentalcare.com). Why: backend source was not provided, so live data stays on it.
- The app renders client-only inside `ClientOnly` in `__root.tsx`. Why: the legacy pages read localStorage during render/auth.
