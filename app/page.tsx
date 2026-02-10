import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Squadra</h1>
          <p className="text-xl text-muted-foreground">
            Multi-Tenant Storefront Platform for Preorder Campaigns
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Phase 1: Complete ✅</CardTitle>
              <CardDescription>Project Setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Next.js 14 with TypeScript</li>
                <li>shadcn/ui components</li>
                <li>Supabase client configured</li>
                <li>Stripe integration ready</li>
                <li>Folder structure created</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phase 2: In Progress</CardTitle>
              <CardDescription>Supabase Setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Database schema</li>
                <li>RLS policies</li>
                <li>TypeScript types</li>
                <li>Authentication setup</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phase 3-4: Upcoming</CardTitle>
              <CardDescription>Admin Dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Auth & layout</li>
                <li>Store management</li>
                <li>Campaign creation</li>
                <li>Product builder</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phase 5-8: Future</CardTitle>
              <CardDescription>Storefront & Orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Public storefront</li>
                <li>Shopping cart</li>
                <li>Stripe checkout</li>
                <li>Order management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">View Docs</Button>
        </div>
      </div>
    </div>
  )
}
