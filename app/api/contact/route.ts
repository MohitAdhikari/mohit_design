import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityServer'
import { sendEmail } from '@/lib/email'

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
 * Save the contact message in Sanity and email the admin address.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { name, email, subject, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Server is not configured to save messages. Set SANITY_API_WRITE_TOKEN.' },
        { status: 503 }
      )
    }

    const ip = getClientIp(req)
    const submittedAt = new Date().toISOString()

    const doc = await writeClient.create({
      _type: 'contactMessage',
      name: name.trim(),
      email: normalizedEmail,
      subject: (subject || '').trim(),
      message: message.trim(),
      submittedAt,
      ip,
    })

    sendEmail({
      to: ADMIN_EMAIL,
      subject: `Contact form: ${subject?.trim() || 'New message from PHONEOCEAN'}`,
      text: `You have a new contact form submission.\n\nName: ${name.trim()}\nEmail: ${normalizedEmail}\nSubject: ${subject?.trim() || 'N/A'}\nMessage:\n${message.trim()}\n\nIP: ${ip}\nSubmitted at: ${submittedAt}\nDocument ID: ${doc._id}`,
      html: `<p><b>New contact form submission</b></p>
<p><b>Name:</b> ${name.trim()}</p>
<p><b>Email:</b> ${normalizedEmail}</p>
<p><b>Subject:</b> ${subject?.trim() || 'N/A'}</p>
<p><b>Message:</b></p>
<p>${message.trim().replace(/\n/g, '<br/>')}</p>
<p><b>IP:</b> ${ip}</p>
<p><b>Submitted at:</b> ${submittedAt}</p>
<p><b>Document ID:</b> ${doc._id}</p>`,
    }).catch((err) => {
      console.error('Contact notification email failed:', err)
    })

    return NextResponse.json({ success: true, id: doc._id })
  } catch (err: any) {
    console.error('Contact API error:', err)
    return NextResponse.json(
      { error: 'Message could not be sent. Please try again.' },
      { status: 500 }
    )
  }
}
