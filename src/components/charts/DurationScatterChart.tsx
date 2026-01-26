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
  Label,
  type TooltipContentProps,
} from 'recharts'
import type { Video } from '../../lib/types'
import { transformToScatterData, type ScatterData } from '../../lib/chartUtils'
import { formatViewCount } from '../../lib/formatters'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

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
  const prefersReducedMotion = usePrefersReducedMotion()
  const data = useMemo(
    () => transformToScatterData(videos, channelMap),
    [videos, channelMap]
  )

  const avgDuration = useMemo(() => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc: number, d: ScatterData) => acc + d.duration, 0)
    return Math.round(sum / data.length)
  }, [data])

  // Empty state - no videos
  if (videos.length === 0) {
    return (
      <div className="h-80 w-full flex flex-col items-center justify-center text-center p-6">
        <svg className="w-12 h-12 text-[#aaaaaa] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-[#f1f1f1] font-medium mb-1">No video data</p>
        <p className="text-[#aaaaaa] text-sm">
          Add channels and fetch videos to see duration vs views analysis
        </p>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart accessibilityLayer margin={{ bottom: 25, left: 60, right: 20 }}>
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
          >
            <Label value="Video Duration (minutes)" position="insideBottom" offset={-15} fill="var(--color-text-secondary)" fontSize={12} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="views"
            name="Views"
            tickFormatter={formatViewCount}
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
          >
            <Label value="View Count" angle={-90} position="insideLeft" offset={-5} fill="var(--color-text-secondary)" fontSize={12} />
          </YAxis>
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
            isAnimationActive={!prefersReducedMotion}
            animationDuration={300}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
