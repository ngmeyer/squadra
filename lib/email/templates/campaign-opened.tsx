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

interface FeaturedProduct {
  title: string
  price: number
  imageUrl?: string
}

interface CampaignOpenedEmailProps {
  campaignName: string
  campaignUrl: string
  closesAt: string
  customMessage?: string
  featuredProducts?: FeaturedProduct[]
  storeName: string
  storeContactEmail: string
}

export default function CampaignOpenedEmail({
  campaignName,
  campaignUrl,
  closesAt,
  customMessage,
  featuredProducts = [],
  storeName,
  storeContactEmail,
}: CampaignOpenedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New campaign: {campaignName} is now open!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 New Campaign Open!</Heading>
          
          <Text style={text}>
            We're excited to announce that our new <strong>{campaignName}</strong> campaign is now open for preorders!
          </Text>

          {customMessage && (
            <Section style={messageBox}>
              <Text style={messageText}>{customMessage}</Text>
            </Section>
          )}

          <Section style={ctaBox}>
            <Button href={campaignUrl} style={button}>
              Shop Now
            </Button>
          </Section>

          {featuredProducts.length > 0 && (
            <>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>Featured Products</Heading>
              
              {featuredProducts.map((product, index) => (
                <Section key={index} style={productSection}>
                  <Text style={productTitle}>{product.title}</Text>
                  <Text style={productPrice}>
                    Starting at ${(product.price / 100).toFixed(2)}
                  </Text>
                </Section>
              ))}
            </>
          )}

          <Hr style={hr} />

          <Section style={infoBox}>
            <Text style={infoText}>
              ⏰ <strong>Order Deadline:</strong> {closesAt}
            </Text>
            <Text style={infoText}>
              Don't miss out! This is a limited-time preorder campaign.
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

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
  padding: '0 40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 40px',
  margin: '16px 0',
}

const messageBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
  borderLeft: '4px solid #1e40af',
}

const messageText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
}

const ctaBox = {
  textAlign: 'center' as const,
  margin: '32px 40px',
}

const button = {
  backgroundColor: '#1e40af',
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

const productSection = {
  padding: '12px 40px',
}

const productTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const productPrice = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
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
