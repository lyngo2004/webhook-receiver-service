# Webhook Receiver Service (NestJS)
This file documents the setup, endpoints, security features, idempotency logic, and testing of the webhook receiver service.

---

## How to run the project
### Prerequisites
- Node.js >= 18
- npm or yarn
### Install dependencies
npm install
### Environment variables
PORT=3000
WEBHOOK_SECRET=my_secret_key
### Run the application
npm run start:dev

---

## Available endpoints
### POST /webhooks
- Receive and process a webhook event.
- Headers:
    x-signature <HMAC_SHA256_SIGNATURE>
- Request body:
```json
    {
    "eventId": "evt_001",
    "source": "test-service",
    "event": "payment.success",
    "payload": {
        "orderId": "123",
        "amount": 100000
    },
    "timestamp": 1769921252306
    }
```

### GET /webhooks
- Retrieve all stored webhook events.

### GET /webhooks/:id
- Retrieve a webhook event by its ID.

---

## Security improvements
### Webhook authentication (HMAC Signature)
- Incoming webhook requests are authenticated using HMAC-SHA256.
- Verification flow:
1. Client generates signature = HMAC-SHA256(rawBody, secret)
2. Client sends request with header: x-signature
3. Server computes expected signature from rawBody
4. Request is accepted only if signatures match
Note: Signature verification is performed on the raw request body
before JSON parsing.

### Timestamp validation (Replay Attack Prevention)
- Each webhook request must include a timestamp.
```js
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (Math.abs(Date.now() - dto.timestamp) > FIVE_MINUTES) {
    throw new BadRequestException('Request timestamp is too old');
    }
```

### Input validation
- Incoming data is validated using class-validator.
- Current validation includes:
1. Required fields
2. Correct data types
3. Maximum string length to prevent oversized payloads
Note: More strict validation (e.g. schema-based payload validation) can be added depending on business requirements.

---

## Reliability improvements:
### Idempotency handling
- Webhook events are processed only once using eventId.
- Behavior:
1. eventId already processed → request is ignored
2. eventId is new → webhook is processed and stored
Note: Idempotency data is lost when the server restarts. For production, idempotency should be enforced at the database level.

---

## Code quality improvements
### UUID-based ID Generation
- Random string IDs were replaced with UUID v4:
```js
    import { randomUUID } from 'crypto';
    const id = randomUUID();
```

--

## Testing
### Test webhook signature manually
- Webhook signature can be generated using Node.js crypto module:

```js
const crypto = require('crypto');

const payload = '{"eventId":"evt_001","source":"test-service","event":"payment.success","payload":{"orderId":"123","amount":100000},"timestamp":1769921252306}';

const secret = 'my_secret_key';

const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

console.log(signature);
```
- Send the request using Postman:
Method: POST
URL: http://localhost:3000/webhooks
Header: x-signature: <generated_signature>
Body: raw JSON (must match the signed payload exactly)

### Test idempotency
- Send the same request twice with the same eventId
- The second request will be ignored as a duplicate event

### Test timestamp validation
- Send a request with an old timestamp
- The server will reject the request