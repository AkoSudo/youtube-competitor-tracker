import { BrowserRouter, Routes, Route } from 'react-router'
import { Toaster } from 'sonner'
import { Nav } from './components/Nav'
import { ChannelsPage } from './pages/ChannelsPage'
import { IdeasPage } from './pages/IdeasPage'

export function App() {
  // TODO: Get actual ideas count from state/API in Phase 3
  const ideasCount = 0

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
        <Nav ideasCount={ideasCount} />

        <main>
          <Routes>
            <Route path="/" element={<ChannelsPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
          </Routes>
        </main>

        <Toaster position="bottom-right" theme="dark" richColors />
      </div>
    </BrowserRouter>
  )
}
