import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  type TooltipContentProps,
} from 'recharts'
import type { Video } from '../../lib/types'
import { transformToFrequencyData, type FrequencyData } from '../../lib/chartUtils'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface UploadFrequencyChartProps {
  videos: Video[]
}

/**
 * Custom tooltip for frequency chart.
 * Shows day name and upload count.
 */
function FrequencyTooltip(props: TooltipContentProps<number, string>) {
  const { active, payload } = props
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload as FrequencyData
  return (
    <div className="bg-[#272727] border border-[#3f3f3f] rounded-lg p-3 shadow-lg">
      <p className="text-[var(--color-text-primary)] font-medium">
        {data.day}: {data.count} upload{data.count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

/**
 * Bar chart showing upload frequency by day of week.
 * Displays 7 bars (Sun-Sat) with hover tooltips.
 */
export function UploadFrequencyChart({ videos }: UploadFrequencyChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const data = useMemo(() => transformToFrequencyData(videos), [videos])

  // Empty state - no videos at all
  if (videos.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6">
        <svg className="w-12 h-12 text-[#aaaaaa] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-[#f1f1f1] font-medium mb-1">No upload data</p>
        <p className="text-[#aaaaaa] text-sm">
          Add channels and fetch videos to see upload frequency
        </p>
      </div>
    )
  }

  // All-zero data (filtered by time period)
  const hasNonZeroData = data.some(d => d.count > 0)
  if (!hasNonZeroData) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6">
        <p className="text-[#f1f1f1] font-medium mb-1">No uploads in this period</p>
        <p className="text-[#aaaaaa] text-sm">Try selecting a longer time range</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} accessibilityLayer margin={{ bottom: 20, left: 10 }}>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
          >
            <Label value="Day of Week" position="insideBottom" offset={-10} fill="var(--color-text-secondary)" fontSize={12} />
          </XAxis>
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
            allowDecimals={false}
          >
            <Label value="Uploads" angle={-90} position="insideLeft" fill="var(--color-text-secondary)" fontSize={12} />
          </YAxis>
          <Tooltip
            content={FrequencyTooltip}
            cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.3 }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-chart-primary)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
