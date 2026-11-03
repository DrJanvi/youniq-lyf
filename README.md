# Banafa

Next.js 16 storefront + admin dashboard backed by MySQL (Prisma).

## Setup

1. `cp .env.example .env` and set `DATABASE_URL`, `JWT_SECRET`, `SEED_ADMIN_PASSWORD`.
2. `npm install`
3. `npm run db:push` (or `db:migrate`) then `npm run db:seed` (imports `sample-data/` and creates the admin user).
4. `npm run dev`

## Notes

- Admin order management supports acceptance/rejection, manual dispatch with a delivery partner and reference ID, an optional tracking link, delivery outcomes with notes, and retry after a failed attempt. Customers can see their current delivery status and tracking details in `/orders`.
- Admins manage coupon codes at `/admin/coupons`; customers can apply one whole-order coupon at checkout. Coupons are evaluated after automatic product discounts, support optional minimum spend and percentage caps, and their code and savings are snapshotted on the order.
- Admin: `/admin/login` (user id + password, JWT cookie). All admin pages and `/api/admin/*` require it.
- Admin image uploads use Cloudinary. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the server environment. Uploads accept PNG, JPEG, and WebP images smaller than 2,000,000 bytes; the API key and secret must not use `NEXT_PUBLIC_` variables.
- Contact Us: `/contact` uses the shared storefront header/footer. Manage page details, image URL, locations, FAQs, and the read/unread enquiry inbox at `/admin/contact-us`. Enquiries are stored in MySQL; run `npm run db:push` (or `db:migrate`) after updating the schema, and `npm run db:seed` to load the initial locations and FAQs.
- Customers: `/login` (email + 6-digit code). Set `BREVO_API_KEY` and a verified `BREVO_SENDER_EMAIL` in the server environment to send registration codes through Brevo. `BREVO_SENDER_NAME` is optional and defaults to `Banafa`. When no Brevo API key is configured, codes are logged to the console in development; `MAIL_DRIVER=console` also enables console logging in production.
- Cart, wishlist and orders live in `/cart`, `/wishlist`, `/orders` and require a customer session.
- Public API: `/api/products` (q, category, type, brand, inStock, minRating, minPrice, maxPrice, sort, page, limit), `/api/products/featured?tag=best-selling|new-release|<tag>&limit=6`, `/api/categories`, `/api/brands`, `/api/product-types`, `/api/reviews`.
- "best-selling" is ranked by units sold (updated when an admin approves an order); "new-release" by creation date; any other tag is curated per product in the admin.
- Price filters use the list price; the discount with the biggest saving is applied to the displayed/final price.
- Storefront catalog and editorial reads use tagged Next.js caches, invalidated after relevant admin edits. Session, cart, wishlist, order, stock, and active discount data remain request-time. Storefront pages intentionally render complete server responses without Suspense fallbacks; metadata and page content remain in the HTML, but personalized header data means instant static-shell navigation is not guaranteed.
