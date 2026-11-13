# Youniqlyf

Next.js 16 storefront + admin dashboard backed by MySQL (Prisma).

## Setup

1. `cp .env.example .env` and set `DATABASE_URL`, `JWT_SECRET`, `SEED_ADMIN_PASSWORD`; for online checkout, also set the Razorpay values described below.
2. `npm install`
3. `npm run db:push` (or `db:migrate`) then `npm run db:seed` (imports `sample-data/` and creates the admin user).
4. `npm run dev`

## Notes

- Admin order management supports acceptance/rejection, manual dispatch with a delivery partner and reference ID, an optional tracking link, delivery outcomes with notes, and retry after a failed attempt. Customers can see their current delivery status and tracking details in `/orders`.
- COD orders receive a bilingual A4 digital invoice when placed; Razorpay orders receive one only after payment is confirmed. The PDF is emailed to the customer through the configured mail driver and can be downloaded from the order details page. Failed invoice emails do not cancel orders; admins can retry them from the order details page. Invoice totals use the existing order total without adding VAT. Apply schema migrations with `npm run db:migrate` (or `npm run db:push`).
- Checkout supports Cash on Delivery and Razorpay. Set `RAZORPAY_KEY` to the Razorpay Key ID and `RAZORPAY_SECRET` to its server-side secret. Configure the Razorpay webhook URL as `https://<your-domain>/api/webhooks/razorpay`, subscribe to `payment.captured` and `payment.failed`, and set the webhook signing secret as `RAZORPAY_WEBHOOK_SECRET`. Keep both secrets server-only; do not use `NEXT_PUBLIC_` variables. Razorpay payments are verified server-side, and the cart remains available after failed or cancelled checkout so the customer can retry.
- Admins manage coupon codes at `/admin/coupons`; customers can apply one whole-order coupon at checkout. Coupons are evaluated after automatic product discounts, support optional minimum spend and percentage caps, and their code and savings are snapshotted on the order.
- Products can optionally have named color variants with their own swatches, images, stock, and price overrides. Existing product discounts apply to override prices; active variant stock is aggregated on the product, cart/order lines retain the selected color snapshot, and order approval decrements that color's stock. Apply the color-variant migration with `npm run db:migrate` (or `npm run db:push`).
- Admin Delete and content Remove actions soft-delete records; deleted records remain visible with a Restore action in their existing admin section. Deleting a category, brand, or product type also soft-deletes linked products, and restoring the taxonomy restores products deleted by that action. Apply the soft-delete migration with `npm run db:migrate` (or `npm run db:push`).
- Customer account deletion is a 30-day soft-delete: deletion immediately disables customer sessions, and a successful password login restores the account during that period. After the deadline, customer access is permanently blocked; user, saved-address, and order records remain available to admins, and the email remains reserved. Expiry is enforced during authentication without a scheduled job; apply the migration with `npm run db:migrate` (or `npm run db:push`).
- Admin: `/admin/login` (user id + password, JWT cookie). All admin pages and `/api/admin/*` require it.
- Manage the storefront announcement bar at `/admin/announcements`. Add multiple ordered messages with optional links to rotate automatically; apply the announcement migration with `npm run db:migrate` (or `npm run db:push`) and run `npm run db:seed` to create the initial message when using `db:push`.
- Admin image uploads use Cloudinary. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the server environment. Uploads accept PNG, JPEG, and WebP images smaller than 2,000,000 bytes; the API key and secret must not use `NEXT_PUBLIC_` variables.
- Highlighted posts at `/admin/highlighted-posts` accept one image (PNG, JPEG, or WebP) or video (MP4, MOV, or WebM). Videos play muted, inline, and loop in the storefront grid. The storefront shows up to 9 posts on desktop and 10 on smaller screens; admins can keep at most 10 active posts. Highlighted-post uploads have no application-level file-size validation; Cloudinary or hosting-provider limits may still apply. Apply the schema update with `npm run db:push` (or `npm run db:migrate`).
- Contact Us: `/contact` uses the shared storefront header/footer. Manage page details, image URL, locations, FAQs, and the read/unread enquiry inbox at `/admin/contact-us`. Enquiries are stored in MySQL; run `npm run db:push` (or `db:migrate`) after updating the schema, and `npm run db:seed` to load the initial locations and FAQs.
- Customers: `/login` (email + 6-digit code). Set `BREVO_API_KEY` and a verified `BREVO_SENDER_EMAIL` in the server environment to send registration codes through Brevo. `BREVO_SENDER_NAME` is optional and defaults to `Youniqlyf`. When no Brevo API key is configured, codes are logged to the console in development; `MAIL_DRIVER=console` also enables console logging in production.
- Cart, wishlist and orders live in `/cart`, `/wishlist`, `/orders` and require a customer session.
- Public API: `/api/products` (q, category, type, brand, inStock, minRating, minPrice, maxPrice, sort, page, limit), `/api/products/featured?tag=best-selling|new-release|<tag>&limit=6`, `/api/categories`, `/api/brands`, `/api/product-types`, `/api/reviews`.
- "best-selling" is ranked by units sold (updated when an admin approves an order); "new-release" by creation date; any other tag is curated per product in the admin.
- Run the focused variant and legacy order checks with `yarn test`.
- Price filters use the list price; the discount with the biggest saving is applied to the displayed/final price.
- Storefront catalog and editorial reads use tagged Next.js caches, invalidated after relevant admin edits. Session, cart, wishlist, order, stock, and active discount data remain request-time. Storefront pages intentionally render complete server responses without Suspense fallbacks; metadata and page content remain in the HTML, but personalized header data means instant static-shell navigation is not guaranteed.
