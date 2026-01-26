import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import { Nav } from './components/Nav'
import { ErrorFallback } from './components/ErrorFallback'
import { ChannelsPage } from './pages/ChannelsPage'
import { ChannelDetailPage } from './pages/ChannelDetailPage'
import { IdeasPage } from './pages/IdeasPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { supabase } from './lib/supabase'

export function App() {
  const [ideasCount, setIdeasCount] = useState(0)

  // Fetch ideas count on mount and subscribe to real-time updates
  useEffect(() => {
    // Initial count fetch
    const fetchCount = async () => {
      const { count } = await supabase
        .from('ideas')
        .select('id', { count: 'exact', head: true })
      setIdeasCount(count || 0)
    }
    fetchCount()

    // Subscribe to real-time changes for count updates
    const channelName = `ideas-count-${Date.now()}`
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
        },
        () => {
          // Refetch count on any change
          fetchCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
          <Nav ideasCount={ideasCount} />

          <main>
            <Routes>
              <Route path="/" element={<ChannelsPage />} />
              <Route path="/channels/:id" element={<ChannelDetailPage />} />
              <Route path="/ideas" element={<IdeasPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </main>

          <Toaster position="bottom-right" theme="dark" richColors />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
