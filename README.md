# ShopEase

Full-stack e-commerce site: Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres, Auth, RLS), Google sign-in, Mailgun confirmation emails, deployed on Vercel.

## 1. Run locally
```bash
npm install
cp .env.example .env.local   # fill in values (steps below)
npm run dev                  # http://localhost:3000
```

## 2. Supabase
1. Create a project at supabase.com.
2. SQL Editor: run `supabase/migrations/001_schema.sql`, then `002_seed.sql`.
3. Project Settings > API: copy the Project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Authentication > URL Configuration: Site URL = your production URL; add Redirect URLs `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`.

## 3. Google sign-in (Google Cloud Console)
1. console.cloud.google.com: create a project, then APIs & Services > OAuth consent screen (External; add your email as a test user while in testing).
2. Credentials > Create credentials > OAuth client ID > **Web application**.
3. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback` (shown in Supabase > Authentication > Providers > Google).
4. Copy the Client ID and Secret into Supabase > Authentication > Providers > Google, and enable it.

## 4. Mailgun
1. Add and verify a sending domain (or use the sandbox domain).
2. Sandbox domains only deliver to **authorized recipients**: add the email address you test with.
3. Set `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL` (e.g. `ShopEase <orders@your-domain.com>`). EU accounts also set `MAILGUN_API_BASE=https://api.eu.mailgun.net`.

## 5. Deploy to Vercel
Push to GitHub, import the repo in Vercel, add every variable from `.env.example` (except the Google ones if you only configured them in Supabase), deploy, then add the production URL to Supabase redirect URLs.

## How the key rules are met
| Rule | Where |
|---|---|
| Server-side prices, stock, totals | `place_order()` in `001_schema.sql`; client sends only product ids and quantities |
| Atomic order + items + stock decrement | One Postgres function = one transaction, with row locks |
| Only own orders readable | RLS policies on `orders` and `order_items`; no insert policy, so orders only come from `place_order()` |
| Auth required to order | `middleware.ts` redirects, `actions/checkout.ts` and the SQL function both check the session |
| Mail failure never removes an order | `actions/checkout.ts` sends the email after the order is saved and swallows errors (logged) |
| Cart cleared only on success | `CheckoutForm.tsx` calls `clear()` after a successful response |
| Secrets stay server-side | Mailgun code is `server-only`; only `NEXT_PUBLIC_SUPABASE_*` reach the browser |

## Test checklist
Browse while signed out; add/update/remove cart items and refresh; checkout redirects to Google sign-in; invalid form is rejected; order more than the stock (e.g. Desk Mat has 3); a normal order shows on `/order-success/...`, in `/orders`, in Supabase tables and in your inbox; a second Google account cannot open the first one's order URL (404); temporarily break `MAILGUN_API_KEY` and confirm the order is still saved.

## Notes
- Orders start as `CONFIRMED` (no payment gateway in MVP). The other statuses are in the enum for future admin tooling.
- Delivery: flat 5.00, free from 100. Change it in `place_order()` and `lib/format.ts`.
- Seed product images come from picsum.photos; replace `image_url` with your own.
- UI uses Tailwind utility classes directly rather than the shadcn/ui CLI, to keep setup to `npm install`.
