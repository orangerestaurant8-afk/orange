# Orange REST API

All success responses are `{ "data": ... }`; errors are `{ "error": { "code", "message", "details?" } }`.

## Public

- `POST /api/auth/signup` — body: `{phone, name, email?}`. Creates a 10-minute signup OTP and logs it to the server console in development.
- `POST /api/auth/login` — body: `{phone}`. Creates a 10-minute login OTP and logs it to the server console.
- `POST /api/auth/verify-otp` — body: `{phone, otp, purpose}` where purpose is `signup` or `login`. Returns `{accessToken, user}` and sets a 30-day httpOnly `refreshToken` cookie.
- `GET /api/categories` — array of categories.
- `GET /api/menu?category=<categoryId>` — menu items; optional category ObjectId filter.
- `GET /api/menu/:id` — one menu item.
- `POST /api/orders` — body: `{user, items:[{item,quantity,customizations,unitPrice}], subtotal, deliveryFee, total, deliveryAddress, paymentMethod}`. Payment method is `Cash on Delivery`, `JazzCash`, or `Easypaisa`.
- `GET /api/orders/:id` — one order with populated user/items.

## Authenticated

- `GET /api/auth/me` — current user. Send `Authorization: Bearer <accessToken>`.

Access tokens expire after 15 minutes. Refresh tokens are httpOnly cookies, scoped to `/api/auth`, and expire after 30 days. Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in non-development environments.

## Image upload

- `POST /api/upload` — admin-only multipart request with an `image` field. Accepts image files up to 5MB and returns `{ secure_url }` after uploading to Cloudinary.

## Admin

These endpoints require an `Authorization: Bearer <accessToken>` header for a user whose `role` is `admin`.

- `POST /api/menu` — menu item body: `{name,description,price,category,imageUrl,addOns:[{name,price}],isAvailable,spiceLevel}`.
- `PUT /api/menu/:id` — any subset of the menu item body.
- `DELETE /api/menu/:id` — returns `204`.
- `GET /api/orders?status=Preparing` — orders, optional status filter.
- `PATCH /api/orders/:id/status` — body: `{status, note?}`. Status is `New`, `Preparing`, `Out for Delivery`, `Delivered`, or `Cancelled`.
