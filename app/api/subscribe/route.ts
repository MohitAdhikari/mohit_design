import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityServer'
import { sendEmail } from '@/lib/email'
import { escapeHtml } from '@/lib/security/escapeHtml'
import { checkRateLimit, looksLikeBot } from '@/lib/security/rateLimit'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'phoneoceanlive@gmail.com'

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Store the subscriber in Sanity and notify the admin email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const rawEmail = body?.email?.trim().toLowerCase()

    // Honeypot: a hidden field ("website") real users never fill in, plus a
    // minimum time-on-form check using the client-reported form-render time.
    if (looksLikeBot(body?.website, body?.formRenderedAt)) {
      // Pretend success so bots don't learn the honeypot was tripped.
      return NextResponse.json({ success: true })
    }

    if (!rawEmail || !isValidEmail(rawEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(`subscribe:${ip}`, 5, 10 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      )
    }

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Server is not configured to save subscribers. Set SANITY_API_WRITE_TOKEN.' },
        { status: 503 }
      )
    }

    const submittedAt = new Date().toISOString()

    const doc = await writeClient.create({
      _type: 'subscriber',
      email: rawEmail,
      submittedAt,
      ip,
    })

    const safeEmail = escapeHtml(rawEmail)
    const safeIp = escapeHtml(ip)

    sendEmail({
      to: ADMIN_EMAIL,
      subject: `New PHONEOCEAN subscriber: ${rawEmail}`,
      text: `A new user subscribed to the PHONEOCEAN newsletter.\n\nEmail: ${rawEmail}\nIP: ${ip}\nSubmitted at: ${submittedAt}\nDocument ID: ${doc._id}`,
      html: `<p><b>New PHONEOCEAN subscriber</b></p>
<p>Email: ${safeEmail}</p>
<p>IP: ${safeIp}</p>
<p>Submitted at: ${submittedAt}</p>
<p>Document ID: ${doc._id}</p>`,
    }).catch((err) => {
      console.error('Subscribe notification email failed:', err)
    })

    return NextResponse.json({ success: true, id: doc._id })
  } catch (err: any) {
    console.error('Subscribe API error:', err)
    return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 })
  }
}
