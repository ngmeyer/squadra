import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components'

interface OrderShippedEmailProps {
  orderNumber: string
  customerName: string
  trackingNumber?: string
  trackingUrl?: string
  shipToAddress: string
  storeName: string
  storeContactEmail: string
}

export default function OrderShippedEmail({
  orderNumber,
  customerName,
  trackingNumber,
  trackingUrl,
  shipToAddress,
  storeName,
  storeContactEmail,
}: OrderShippedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} has shipped!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📦 Your Order Has Shipped!</Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Text style={text}>
            Great news! Your order <strong>#{orderNumber}</strong> is on its way to you.
          </Text>

          {trackingNumber && (
            <Section style={trackingBox}>
              <Text style={trackingLabel}>Tracking Number</Text>
              <Text style={trackingNumberStyle}>{trackingNumber}</Text>
              {trackingUrl && (
                <Button href={trackingUrl} style={button}>
                  Track Your Package
                </Button>
              )}
            </Section>
          )}

          <Hr style={hr} />

          <Section style={addressBox}>
            <Text style={addressLabel}>Shipping To:</Text>
            <Text style={addressText}>{shipToAddress}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Depending on your location, your package should arrive within 3-7 business days.
          </Text>

          <Text style={text}>
            Thank you for your order! We hope you love your items.
          </Text>

          <Text style={text}>
            Questions about your shipment? Contact us at{' '}
            <a href={`mailto:${storeContactEmail}`} style={link}>
              {storeContactEmail}
            </a>
          </Text>

          <Text style={footer}>
            {storeName} • Powered by Squadra
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 40px',
  margin: '16px 0',
}

const trackingBox = {
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
  textAlign: 'center' as const,
}

const trackingLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const trackingNumberStyle = {
  color: '#1e40af',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  fontFamily: 'monospace',
}

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const addressBox = {
  margin: '20px 40px',
}

const addressLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const addressText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-line' as const,
}

const link = {
  color: '#1e40af',
  textDecoration: 'underline',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '30px 0 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}
