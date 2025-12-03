import { initializeSearchIndex, syncAllTools } from '@/lib/search'

async function main() {
  console.log('Initializing search index...')
  await initializeSearchIndex()

  console.log('Syncing all tools...')
  const count = await syncAllTools()

  console.log(`✅ Successfully synced ${count} tools to search index`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Error syncing search:', error)
  process.exit(1)
})

