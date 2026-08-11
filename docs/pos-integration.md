# POS integration

## Architecture and ownership

Orange Website and the POS remain separate applications with separate MongoDB databases. They communicate only over HTTPS server-to-server APIs. The browser never receives `POS_SYNC_SECRET`, never calls a POS endpoint, and no MongoDB connection string is shared.

The POS owns categories, products, prices, add-ons and availability. The website owns customer accounts, carts, checkout, orders and website content. Fields applied by POS sync are deliberately whitelisted. Website-only fields added later (for example SEO, featured content or display marketing copy) are not replaced by a POS event.

## Configuration

Set these **only on the website backend**:

```dotenv
INTEGRATION_ENABLED=true
POS_API_URL=https://pos-api.example.com
POS_SYNC_SECRET=<long-random-shared-secret>
POS_ORDER_WEBHOOK_PATH=/api/integration/website/orders
INTEGRATION_MAX_AGE_SECONDS=300
INTEGRATION_WORKER_INTERVAL_MS=15000
INTEGRATION_MAX_ATTEMPTS=8
DELIVERY_FEE=99
TAX_RATE=0.16
```

`POS_API_URL` is a deployed HTTPS POS backend URL (localhost is suitable only in a local `.env.local`). Do not add any of these values to `frontend/.env*` or use `NEXT_PUBLIC_` for them.

## POS-to-website events

`POST /api/integration/pos/events` accepts a JSON envelope:

```json
{
  "eventId": "af32ba60-0e40-46dd-b829-5962177d7010",
  "type": "MENU_ITEM_UPDATED",
  "occurredAt": "2026-08-12T12:00:00.000Z",
  "source": "pos",
  "version": 1,
  "data": {
    "externalId": "pos-menu-zinger-001",
    "name": "Zinger Supreme",
    "description": "Crispy chicken burger",
    "price": 650,
    "categoryExternalId": "pos-category-fast-food",
    "imageUrl": "https://cdn.example.com/zinger.jpg",
    "available": true,
    "addOns": [{ "name": "Extra cheese", "price": 80 }],
    "updatedAt": "2026-08-12T12:00:00.000Z"
  }
}
```

Supported types are `MENU_ITEM_CREATED`, `MENU_ITEM_UPDATED`, `MENU_ITEM_DELETED`, `MENU_AVAILABILITY_UPDATED`, `CATEGORY_CREATED`, `CATEGORY_UPDATED`, `CATEGORY_DELETED`, `ORDER_STATUS_UPDATED`, and `MENU_FULL_SYNC`. A menu item references its category with `categoryExternalId`; send the category event first. Deletion events use the same payload shapes and safely archive/deactivate records rather than deleting historical references.

For full resync, send a signed `MENU_FULL_SYNC` event whose `data` is `{ "categories": [...], "menuItems": [...] }`. It upserts by `externalId` and preserves website-only fields. Category removal only archives the category; menu records and historic orders remain readable.

### HMAC and replay protection

Each request has `x-integration-timestamp` (Unix seconds), `x-integration-signature`, `x-integration-event-id`, and `x-integration-event-type`. Sign the exact UTF-8 body bytes:

```text
hex(HMAC-SHA256(POS_SYNC_SECRET, "<timestamp>.<raw JSON body>"))
```

The backend uses raw request bytes before JSON parsing, a constant-time comparison, a five-minute default timestamp window, and checks that header ID/type match the envelope. Authentication failures always return the same generic `401` response. Never log the secret.

Successfully applied inbound event IDs are stored uniquely in `ProcessedIntegrationEvent`; a retry returns `200` with `duplicate` and makes no second change. A failed event is not marked processed, so the POS may retry it safely.

## Website-to-POS orders

The normal website `POST /api/orders` re-reads menu records, rejects inactive/unavailable items, ignores browser prices/totals, calculates subtotal plus configured delivery and tax, and gives the order a `crypto.randomUUID()` `externalOrderId`. It also honors a browser `Idempotency-Key`, so a retry of the same checkout returns the same order.

For a fulfilment-confirmed COD order, the backend inserts an `ONLINE_ORDER_CREATED` event in `IntegrationOutboxEvent`. The worker sends it to `${POS_API_URL}${POS_ORDER_WEBHOOK_PATH}` with the same HMAC convention. Example body:

```json
{
  "externalOrderId": "3a6bb4f2-c506-47a4-b020-d63ea1391d6f",
  "createdAt": "2026-08-12T12:00:00.000Z",
  "orderType": "delivery",
  "customer": { "name": "Ayesha Khan", "phone": "+923001234567", "email": "ayesha@example.com" },
  "delivery": { "address": "House 42, DHA, Karachi, Pakistan" },
  "items": [{ "productExternalId": "pos-menu-zinger-001", "quantity": 2, "selectedOptions": ["ASAP", "Cash on Delivery"] }],
  "payment": { "method": "Cash on Delivery", "status": "pending" }
}
```

The POS must deduplicate this request by `externalOrderId`/event ID, revalidate POS catalog data, and may reply `{ "data": { "posOrderId": "..." } }`; that ID is saved on the website order. Failed sends use exponential retry (30 seconds up to one hour) for up to `INTEGRATION_MAX_ATTEMPTS`; failures remain inspectable. The worker sends only COD because this app currently has no payment provider confirmation. Add a confirmed-payment callback before queuing JazzCash/Easypaisa orders; do not queue failed or abandoned attempts.

## Status mapping and operations

`ORDER_STATUS_UPDATED` data is `{ "externalOrderId": "...", "status": "preparing", "posOrderId": "...", "note": "..." }`. POS `accepted`, `preparing`, and `ready` map to website `Preparing`; `out_for_delivery` maps to `Out for Delivery`; `completed`/`delivered` to `Delivered`; and `cancelled`/`rejected` to `Cancelled`. The update writes the existing website status history and is visible in current customer/admin order endpoints. It never creates an outgoing event, preventing loops.

Admin-only diagnostics/actions (Bearer admin token):

- `GET /api/integration/health`
- `GET /api/integration/outbox/:eventId`
- `POST /api/integration/outbox/retry`
- `POST /api/integration/outbox/:eventId/retry`

Deploy the website backend with its own MongoDB and the variables above, then configure the POS with the public website URL, event endpoint, same secret, and schema. The POS team must provide its deployed base URL, order receiver path, product/category stable external IDs, full-menu event schedule/trigger, HMAC convention above, accepted payment states, and its normalized status values/response format.

Troubleshooting: verify clocks are within the replay window, send category events before dependent products, inspect health/outbox errors with an admin token, and retry failed outbox events after restoring POS availability. Never fix a sync issue by sharing database access.
