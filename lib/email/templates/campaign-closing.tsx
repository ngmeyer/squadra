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

interface CampaignClosingEmailProps {
  campaignName: string
  campaignUrl: string
  closesAt: string
  hoursRemaining: number
  storeName: string
  storeContactEmail: string
}

export default function CampaignClosingEmail({
  campaignName,
  campaignUrl,
  closesAt,
  hoursRemaining,
  storeName,
  storeContactEmail,
}: CampaignClosingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>⏰ Last chance! {campaignName} closes soon</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⏰ Last Chance!</Heading>
          
          <Section style={urgencyBox}>
            <Text style={urgencyText}>
              The <strong>{campaignName}</strong> campaign is closing in{' '}
              <span style={urgencyHighlight}>{hoursRemaining} hours</span>!
            </Text>
          </Section>
          
          <Text style={text}>
            This is your final opportunity to place your preorder before the campaign ends.
          </Text>

          <Text style={text}>
            Once the campaign closes, you won't be able to order these items until the next campaign opens (if at all).
          </Text>

          <Section style={ctaBox}>
            <Button href={campaignUrl} style={button}>
              Order Now - Don't Miss Out!
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={infoBox}>
            <Text style={infoText}>
              📅 <strong>Campaign Closes:</strong> {closesAt}
            </Text>
            <Text style={infoText}>
              After this deadline, no new orders can be placed.
            </Text>
          </Section>

          <Text style={text}>
            Questions? Contact us at{' '}
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

const urgencyBox = {
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
  textAlign: 'center' as const,
  border: '2px solid #dc2626',
}

const urgencyText = {
  color: '#333',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0',
}

const urgencyHighlight = {
  color: '#dc2626',
  fontWeight: 'bold',
  fontSize: '22px',
}

const ctaBox = {
  textAlign: 'center' as const,
  margin: '32px 40px',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const infoBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '20px 40px',
  padding: '16px',
}

const infoText = {
  color: '#333',
  fontSize: '14px',
  margin: '8px 0',
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
