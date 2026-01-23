import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { supabase } from './lib/supabase'

export function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    // Test connection by fetching from channels table
    async function testConnection() {
      try {
        const { error } = await supabase.from('channels').select('count').limit(1)

        if (error) {
          console.error('Supabase error:', error)
          // Table might not exist yet - that's expected
          if (error.message.includes('does not exist')) {
            toast.info('Channels table not created yet. Run the migration SQL.')
            setConnectionStatus('connected') // Connection works, just no table
          } else {
            toast.error(`Database error: ${error.message}`)
            setConnectionStatus('error')
          }
        } else {
          toast.success('Connected to Supabase!')
          setConnectionStatus('connected')
        }
      } catch (err) {
        console.error('Connection error:', err)
        toast.error('Failed to connect to Supabase. Check your .env.local file.')
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
      <main className="p-4">
        <h1 className="text-2xl font-bold">YouTube Competitor Tracker</h1>
        <p className="text-[#aaaaaa] mt-2">
          Supabase: {connectionStatus === 'checking' ? 'Checking...' :
                     connectionStatus === 'connected' ? 'Connected' : 'Error'}
        </p>
      </main>
      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  )
}
