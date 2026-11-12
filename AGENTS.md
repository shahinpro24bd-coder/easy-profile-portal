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
- Portal styling uses the original Tailwind v3 config in `portal-styles/`, compiled to `public/legacy/portal.css` (linked in `__root.tsx`); `src/styles.css` must not import Tailwind v4. After adding/changing classes, regenerate per `portal-styles/README.md`. Why: v4 renders the legacy classes differently and broke the original look.
- `/dashboard` route must wrap its page in `DashboardLayout`. Why: Next.js applied `app/dashboard/layout.tsx` implicitly.
- Payment reversal requests are assembled in a browser-safe helper with validated payment references and both reason field aliases. Why: legacy API responses may expose `_id` instead of `id`, and reason naming differs across API versions.
- Patient custom-field visibility and manual complaint merging use a shared browser-safe helper. Why: registration, profile and settings must apply the same field exclusions without deleting historical data.
- New invoices accept a direct total, mapped to one generic item by a browser-safe helper for legacy API compatibility; existing itemized invoices retain their edit controls. Why: simplify new billing without losing historical line items or changing the clinic API.
- The retired catalog URL redirects home. Why: preserve old bookmarks without exposing retired features.
