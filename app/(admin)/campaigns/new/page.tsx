import { getStores } from '@/lib/supabase/queries'
import NewCampaignForm from './form'

export default async function NewCampaignPage() {
  const stores = await getStores()
  const defaultStoreId = stores[0]?.id || ''

  return <NewCampaignForm defaultStoreId={defaultStoreId} />
}
