import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  type TooltipContentProps,
} from 'recharts'
import type { Video } from '../../lib/types'
import { transformToScatterData, type ScatterData } from '../../lib/chartUtils'
import { formatViewCount } from '../../lib/formatters'

interface DurationScatterChartProps {
  videos: Video[]
  channelMap: Map<string, string> // channelId -> channelName
}

/**
 * Custom tooltip for scatter chart.
 * Shows video title, channel name, duration, and views.
 */
function ScatterTooltip(props: TooltipContentProps<number, string>) {
  const { active, payload } = props
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload as ScatterData
  return (
    <div className="bg-[#272727] border border-[#3f3f3f] rounded-lg p-3 shadow-lg max-w-xs">
      <p className="text-[var(--color-text-primary)] font-medium line-clamp-2 mb-2">
        {data.title}
      </p>
      <p className="text-[var(--color-text-secondary)] text-sm">
        {data.channelName}
      </p>
      <div className="flex gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
        <span>{data.duration} min</span>
        <span>{formatViewCount(data.views)} views</span>
      </div>
    </div>
  )
}

/**
 * Scatter chart showing duration vs views relationship.
 * Includes reference line at average duration.
 */
export function DurationScatterChart({
  videos,
  channelMap,
}: DurationScatterChartProps) {
  const data = useMemo(
    () => transformToScatterData(videos, channelMap),
    [videos, channelMap]
  )

  const avgDuration = useMemo(() => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc: number, d: ScatterData) => acc + d.duration, 0)
    return Math.round(sum / data.length)
  }, [data])

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart accessibilityLayer>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            dataKey="duration"
            name="Duration"
            unit=" min"
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
          />
          <YAxis
            type="number"
            dataKey="views"
            name="Views"
            tickFormatter={formatViewCount}
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
          />
          <Tooltip
            content={ScatterTooltip}
            cursor={{ strokeDasharray: '3 3' }}
          />
          {data.length > 0 && (
            <ReferenceLine
              x={avgDuration}
              stroke="var(--color-chart-reference)"
              strokeDasharray="5 5"
              label={{
                value: `Avg: ${avgDuration} min`,
                position: 'top',
                fill: 'var(--color-text-secondary)',
                fontSize: 12,
              }}
            />
          )}
          <Scatter
            data={data}
            fill="var(--color-chart-primary)"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
