import { NewsletterAPI, type NewsletterConfig } from 'pliny/newsletter'
import { NextRequest, NextResponse } from 'next/server'
import siteMetadata from '@/data/siteMetadata'

type NewsletterProvider = NewsletterConfig['provider']

const MAX_REQUEST_LENGTH = 1_024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NEWSLETTER_PROVIDERS = [
  'buttondown',
  'convertkit',
  'klaviyo',
  'mailchimp',
  'emailoctopus',
  'beehiiv',
] as const satisfies readonly NewsletterProvider[]

function isNewsletterProvider(value: unknown): value is NewsletterProvider {
  return (
    typeof value === 'string' &&
    NEWSLETTER_PROVIDERS.includes(value as (typeof NEWSLETTER_PROVIDERS)[number])
  )
}

function parseEmail(value: unknown) {
  if (!value || typeof value !== 'object') return undefined

  const email = (value as { email?: unknown }).email
  if (typeof email !== 'string') return undefined

  const normalizedEmail = email.trim()
  if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) return undefined

  return normalizedEmail
}

export async function POST(request: NextRequest): Promise<Response> {
  const provider = siteMetadata.newsletter?.provider

  if (!isNewsletterProvider(provider)) {
    return NextResponse.json(
      { error: 'Newsletter subscriptions are unavailable.' },
      { status: 503 }
    )
  }

  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return NextResponse.json({ error: 'Expected an application/json request.' }, { status: 415 })
  }

  const rawBody = await request.text()
  if (rawBody.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 })
  }

  let body: unknown

  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 })
  }

  const email = parseEmail(body)
  if (!email) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const providerRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ email }),
  })

  try {
    const response = (await NewsletterAPI(providerRequest, { provider })) as Response

    if (response.status >= 500) {
      return NextResponse.json(
        { error: 'The newsletter provider is unavailable.' },
        { status: 502 }
      )
    }

    return response
  } catch {
    return NextResponse.json({ error: 'The newsletter provider is unavailable.' }, { status: 502 })
  }
}
