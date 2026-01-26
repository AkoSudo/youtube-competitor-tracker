import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from 'recharts'
import type { Video } from '@/lib/types'
import { transformToFrequencyData, type FrequencyData } from '@/lib/chartUtils'

interface UploadFrequencyChartProps {
  videos: Video[]
}

/**
 * Custom tooltip for frequency chart.
 * Shows day name and upload count.
 */
function FrequencyTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
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
  const data = useMemo(() => transformToFrequencyData(videos), [videos])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} accessibilityLayer>
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
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
            allowDecimals={false}
          />
          <Tooltip
            content={<FrequencyTooltip />}
            cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.3 }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-chart-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
