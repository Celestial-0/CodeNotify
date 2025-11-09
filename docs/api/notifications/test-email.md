# Test Email Notification

Send a test email notification (Admin only).

## Endpoint

```http
POST /notifications/test/email
```

**Authentication:** Required (JWT + Admin role)

## Request Body

```json
{
  "email": "test@example.com"
}
```

## Request Example

```bash
curl -X POST http://localhost:3000/notifications/test/email \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Response

**Status Code:** `200 OK`

### Success Response
```json
{
  "success": true,
  "message": "Test email sent to test@example.com",
  "payload": {
    "userId": "test-user",
    "contestId": "test-contest",
    "contestName": "Test Contest - Codeforces Round #123",
    "platform": "codeforces",
    "startTime": "2024-02-16T16:35:00.000Z",
    "hoursUntilStart": 2
  },
  "messageId": "abc123def456",
  "provider": "Resend"
}
```

### Failure Response
```json
{
  "success": false,
  "message": "Failed to send email: Invalid email address",
  "error": "Invalid email address format"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether email was sent successfully |
| `message` | string | Success or error message |
| `payload` | object | Test notification data used |
| `messageId` | string | Email provider message ID (if successful) |
| `provider` | string | Email service provider |
| `error` | string | Error details (if failed) |

## Test Email Content

The test email includes:
- **Subject**: "Contest Starting Soon - Test Notification"
- **Contest Name**: "Test Contest - Codeforces Round #123"
- **Platform**: Codeforces
- **Start Time**: 2 hours from now
- **Contest URL**: Example contest link
- **Unsubscribe Link**: Test unsubscribe link

## Use Cases

1. **Configuration Testing**: Verify email service is configured correctly
2. **Template Testing**: Preview email template design
3. **Deliverability Testing**: Check if emails reach inbox
4. **Debugging**: Troubleshoot email delivery issues
5. **Demo**: Show email notifications to stakeholders

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "email must be a valid email address",
  "error": "Bad Request"
}
```

## Integration Example

### React Admin Panel
```typescript
const TestEmailButton = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  
  const sendTestEmail = async () => {
    setSending(true);
    
    try {
      const response = await fetch('http://localhost:3000/notifications/test/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email address"
      />
      <button onClick={sendTestEmail} disabled={sending}>
        {sending ? 'Sending...' : 'Send Test Email'}
      </button>
    </div>
  );
};
```

## Best Practices

### ✅ Do

- Test with your own email first
- Verify email configuration before testing
- Check spam folder if email not received
- Test different email providers (Gmail, Outlook, etc.)
- Monitor email delivery metrics

### ❌ Don't

- Send test emails to users without permission
- Spam test emails repeatedly
- Use production user emails for testing
- Ignore delivery failures

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not received | Invalid email address | Check email format |
| Email in spam | Poor sender reputation | Configure SPF/DKIM records |
| Delivery failed | API key invalid | Check RESEND_API_KEY |
| Timeout | Network issues | Check internet connection |

## Related Endpoints

- [Test WhatsApp](/api/notifications/test-whatsapp)
- [Test Push](/api/notifications/test-push)
- [Service Status](/api/notifications/status)
- [Send Custom Email](/api/notifications/send-custom-email)
