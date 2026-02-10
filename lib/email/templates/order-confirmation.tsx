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
  Row,
  Column,
} from '@react-email/components'

interface OrderItem {
  productTitle: string
  variantOptions: Record<string, string>
  customization?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  orderItems: OrderItem[]
  subtotal: number
  tax: number
  total: number
  campaignName: string
  campaignShipDate?: string
  storeContactEmail: string
  storeName: string
}

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  orderItems,
  subtotal,
  tax,
  total,
  campaignName,
  campaignShipDate,
  storeContactEmail,
  storeName,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} has been confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmation</Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Text style={text}>
            Thank you for your order! Your preorder has been confirmed for the{' '}
            <strong>{campaignName}</strong> campaign.
          </Text>

          <Section style={orderBox}>
            <Text style={orderNumberStyle}>Order #{orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>Order Details</Heading>

          {orderItems.map((item, index) => (
            <Section key={index} style={itemSection}>
              <Row>
                <Column>
                  <Text style={itemTitle}>{item.productTitle}</Text>
                  {Object.entries(item.variantOptions).map(([key, value]) => (
                    <Text key={key} style={itemDetail}>
                      {key}: {value}
                    </Text>
                  ))}
                  {item.customization && (
                    <Text style={itemDetail}>
                      Customization: {item.customization}
                    </Text>
                  )}
                  <Text style={itemDetail}>Qty: {item.quantity}</Text>
                </Column>
                <Column align="right">
                  <Text style={itemPrice}>
                    ${(item.totalPrice / 100).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            </Section>
          ))}

          <Hr style={hr} />

          <Row style={totalsRow}>
            <Column>
              <Text style={totalsLabel}>Subtotal:</Text>
            </Column>
            <Column align="right">
              <Text style={totalsValue}>${(subtotal / 100).toFixed(2)}</Text>
            </Column>
          </Row>

          <Row style={totalsRow}>
            <Column>
              <Text style={totalsLabel}>Tax:</Text>
            </Column>
            <Column align="right">
              <Text style={totalsValue}>${(tax / 100).toFixed(2)}</Text>
            </Column>
          </Row>

          <Row style={totalsRow}>
            <Column>
              <Text style={totalLabel}>Total:</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>${(total / 100).toFixed(2)}</Text>
            </Column>
          </Row>

          <Hr style={hr} />

          {campaignShipDate && (
            <Section style={infoBox}>
              <Text style={infoText}>
                📦 <strong>Expected Ship Date:</strong> {campaignShipDate}
              </Text>
              <Text style={infoText}>
                You'll receive a shipping confirmation email with tracking information when your order ships.
              </Text>
            </Section>
          )}

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
}

const orderBox = {
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  margin: '20px 40px',
  padding: '20px',
  textAlign: 'center' as const,
}

const orderNumberStyle = {
  color: '#1e40af',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const itemSection = {
  padding: '10px 40px',
}

const itemTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const itemDetail = {
  color: '#666',
  fontSize: '14px',
  margin: '4px 0',
}

const itemPrice = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const totalsRow = {
  padding: '4px 40px',
}

const totalsLabel = {
  color: '#666',
  fontSize: '16px',
  margin: '0',
}

const totalsValue = {
  color: '#333',
  fontSize: '16px',
  margin: '0',
}

const totalLabel = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
}

const totalValue = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#f9fafb',
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
