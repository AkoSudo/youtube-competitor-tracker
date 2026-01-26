import { NavLink } from 'react-router'

interface NavProps {
  ideasCount?: number
}

export function Nav({ ideasCount = 0 }: NavProps) {
  return (
    <nav className="bg-[#272727] border-b border-[#3f3f3f]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-8">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-red-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            <span className="font-semibold text-lg hidden sm:block">
              Competitor Tracker
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3f3f3f] text-white'
                    : 'text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
                }`
              }
            >
              Channels
            </NavLink>

            <NavLink
              to="/ideas"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#3f3f3f] text-white'
                    : 'text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
                }`
              }
            >
              Ideas
              {ideasCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {ideasCount > 99 ? '99+' : ideasCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3f3f3f] text-white'
                    : 'text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
                }`
              }
            >
              Analytics
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
