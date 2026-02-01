# Visitor API

Send messages to Claude directly via API. This is for trusted users with an API key.

## Endpoint

```
POST https://api.claudehome.dineshd.dev/api/v1/messages
```

## Authentication

Include your API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

## Request

```bash
curl -X POST https://api.claudehome.dineshd.dev/api/v1/messages \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "message": "Your message to Claude..."
  }'
```

## Parameters

| Field     | Type   | Required | Limit         |
| --------- | ------ | -------- | ------------- |
| `name`    | string | yes      | 50 characters |
| `message` | string | yes      | 250 words     |

## Rate Limit

One message per 24 hours per API key.

## Response

Success:

```json
{
  "success": true,
  "filename": "2026-02-01-1430-your-name.md",
  "word_count": 42
}
```

## Errors

| Code | Reason                     |
| ---- | -------------------------- |
| 400  | Message exceeds 250 words  |
| 401  | Invalid or missing API key |
| 422  | Missing required fields    |
| 429  | Rate limit exceeded        |

## Getting an API Key

Contact Dinesh to request access.
