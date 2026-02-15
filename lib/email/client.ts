import { Resend } from 'resend'
import { ReactElement } from 'react'
import { render } from '@react-email/components'

// Lazy initialize Resend client (only when actually sending emails)
let resendClient: Resend | null = null

function getResendClient(): Resend {
	if (!resendClient) {
		const apiKey = process.env.RESEND_API_KEY
		if (!apiKey || apiKey.includes('your_api_key')) {
			throw new Error('RESEND_API_KEY not properly configured')
		}
		resendClient = new Resend(apiKey)
	}
	return resendClient
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  // Check if email is disabled (for testing)
  if (process.env.DISABLE_EMAIL === 'true') {
    console.log('📧 Email disabled - would have sent:', {
      to: options.to,
      subject: options.subject,
    })
    return { success: true, disabled: true }
  }

  // Validate API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured')
    throw new Error('Email service not configured')
  }

  const from = options.from || process.env.EMAIL_FROM || 'Squadra <noreply@squadrashop.com>'

  try {
    const resend = getResendClient()
    const response = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    })

    console.log('✅ Email sent:', { to: options.to, subject: options.subject })
    return { success: true, data: response }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw error
  }
}

/**
 * Render a React email template to HTML
 */
export async function renderEmailTemplate(template: ReactElement): Promise<string> {
  return await render(template)
}

/**
 * Send an email using a React template
 */
export async function sendEmailTemplate(
  to: string | string[],
  subject: string,
  template: ReactElement,
  options?: { from?: string; replyTo?: string }
) {
  const html = await renderEmailTemplate(template)
  return sendEmail({
    to,
    subject,
    html,
    from: options?.from,
    replyTo: options?.replyTo,
  })
}
