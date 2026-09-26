# Tiny Tome Backend

## Run locally

Start MongoDB, then run the API from this directory:

```sh
PORT=5001 node server.js
```

Seed or refresh the ten miniature bookshelf products with:

```sh
node utils/seed.js
```

The seed script is safe to rerun. It keeps existing product stock and removes only the two earlier demo products created by the project seed script.

## Admin access

1. Register your owner account at `/register` in the website.
2. From this directory, promote that account using its email:

```sh
node utils/promoteAdmin.js owner@example.com
```

3. Sign out and sign back in, then open `/admin`.

Order details are returned only by admin-protected API routes. Public order submission returns the order reference and total, not the customer's name, phone, or address.

## Password reset email

Add these values to `backend/.env` using credentials from your SMTP email provider. Do not commit or share the SMTP password.

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=Tiny Tome <no-reply@example.com>
CLIENT_URL=http://127.0.0.1:3000
```

Use port `465` with `SMTP_SECURE=true` for implicit TLS, or your provider's documented settings. Restart the backend after changing `.env`. Reset links expire after 15 minutes and can only be used once. The forgot-password endpoint returns the same message whether or not the email exists.

## Orders

Customers submit orders with Cash on Delivery. All ten seeded shelves are priced at ৳400, and each order adds a flat ৳100 COD fee. The API validates product codes against the database, calculates prices from stored product variants, and reserves stock. Admins can update fulfillment status, tracking numbers, and whether cash was collected.
