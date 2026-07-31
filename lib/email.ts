export interface EmailPayload {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
}

const DEFAULT_FROM = process.env.EMAIL_FROM || 'PhoneOcean <no-reply@phoneocean.in>'

function parseFrom(from: string): { name?: string; email: string } {
  const match = from.match(/^(.+?)\s*<(.+)>$/)
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() }
  }
  return { email: from }
}

/**
 * Send an email using whichever provider is configured:
 * 1. SendGrid (SENDGRID_API_KEY)
 * 2. Resend (RESEND_API_KEY)
 * 3. Generic webhook (EMAIL_WEBHOOK_URL)
 *
 * Returns an object describing success/failure so callers can decide whether
 * to surface an error to the user. Messages are still saved to Sanity even if
 * email delivery is not configured.
 */
export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; provider?: string; error?: string }> {
  const from = payload.from || DEFAULT_FROM

  if (process.env.SENDGRID_API_KEY) {
    try {
      const fromObj = parseFrom(from)
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: fromObj,
          subject: payload.subject,
          content: [
            { type: 'text/plain', value: payload.text },
            ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
          ],
        }),
      })
      if (res.ok) return { ok: true, provider: 'sendgrid' }
      const text = await res.text()
      return { ok: false, provider: 'sendgrid', error: `SendGrid ${res.status}: ${text}` }
    } catch (err: any) {
      return { ok: false, provider: 'sendgrid', error: err.message }
    }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        }),
      })
      if (res.ok) return { ok: true, provider: 'resend' }
      const json = await res.json().catch(() => ({}))
      return { ok: false, provider: 'resend', error: `Resend ${res.status}: ${JSON.stringify(json)}` }
    } catch (err: any) {
      return { ok: false, provider: 'resend', error: err.message }
    }
  }

  if (process.env.EMAIL_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, from }),
      })
      if (res.ok) return { ok: true, provider: 'webhook' }
      return { ok: false, provider: 'webhook', error: `Webhook ${res.status}` }
    } catch (err: any) {
      return { ok: false, provider: 'webhook', error: err.message }
    }
  }

  return {
    ok: false,
    error:
      'No email provider configured. Set RESEND_API_KEY, SENDGRID_API_KEY, or EMAIL_WEBHOOK_URL.',
  }
}
