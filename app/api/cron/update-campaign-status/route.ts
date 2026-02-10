import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Cron endpoint to automatically update campaign statuses based on dates
 * 
 * This endpoint should be called periodically (e.g., every hour) via a cron job
 * or Vercel cron to automatically transition campaigns from:
 * - draft → active when opens_at is reached
 * - active → closed when closes_at is reached
 * 
 * To protect this endpoint in production, you can:
 * 1. Use Vercel Cron (automatically authenticated)
 * 2. Add an Authorization header check
 * 3. Use a secret token in the URL or header
 */
export async function GET(request: Request) {
  try {
    // Optional: Add authorization check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    // Update draft campaigns to active if opens_at has passed
    const { data: activatedCampaigns, error: activateError } = await supabase
      .from('campaigns')
      .update({ status: 'active' })
      .eq('status', 'draft')
      .lte('opens_at', now)
      .select('id, name')

    if (activateError) {
      console.error('Error activating campaigns:', activateError)
      return NextResponse.json(
        { error: 'Failed to activate campaigns', details: activateError.message },
        { status: 500 }
      )
    }

    // Update active campaigns to closed if closes_at has passed
    const { data: closedCampaigns, error: closeError } = await supabase
      .from('campaigns')
      .update({ status: 'closed' })
      .eq('status', 'active')
      .lte('closes_at', now)
      .select('id, name')

    if (closeError) {
      console.error('Error closing campaigns:', closeError)
      return NextResponse.json(
        { error: 'Failed to close campaigns', details: closeError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      activated: activatedCampaigns?.length || 0,
      closed: closedCampaigns?.length || 0,
      campaigns: {
        activated: activatedCampaigns || [],
        closed: closedCampaigns || [],
      },
      timestamp: now,
    })
  } catch (error) {
    console.error('Error updating campaign statuses:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also allow POST for flexibility
export async function POST(request: Request) {
  return GET(request)
}
