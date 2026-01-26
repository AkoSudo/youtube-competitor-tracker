import type { Video } from './types'

/**
 * Days of the week starting from Sunday.
 */
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/**
 * Data point for frequency chart (videos per day of week).
 */
export interface FrequencyData {
  day: string        // Day name (Sun, Mon, etc.)
  dayIndex: number   // Day index (0=Sun, 6=Sat)
  count: number      // Number of videos published on this day
}

/**
 * Data point for scatter chart (duration vs views).
 */
export interface ScatterData {
  duration: number     // Duration in minutes
  views: number        // View count
  title: string        // Video title
  channelName: string  // Channel display name
  videoId: string      // Video UUID for linking
}

/**
 * Transform videos to frequency data for bar chart.
 * Counts videos published on each day of the week.
 *
 * @param videos - Array of Video objects
 * @returns Array of 7 FrequencyData objects (one per day, Sun-Sat)
 */
export function transformToFrequencyData(videos: Video[]): FrequencyData[] {
  // Initialize counts for all 7 days
  const counts = new Map<number, number>()
  for (let i = 0; i < 7; i++) {
    counts.set(i, 0)
  }

  // Count videos per day
  for (const video of videos) {
    const date = new Date(video.published_at)
    const dayIndex = date.getUTCDay() // 0=Sun, 6=Sat
    counts.set(dayIndex, (counts.get(dayIndex) ?? 0) + 1)
  }

  // Transform to output format, sorted by dayIndex
  return DAYS_OF_WEEK.map((day, dayIndex) => ({
    day,
    dayIndex,
    count: counts.get(dayIndex) ?? 0,
  }))
}

/**
 * Transform videos to scatter data for duration vs views chart.
 *
 * @param videos - Array of Video objects
 * @param channelMap - Map of channelId to channelName
 * @returns Array of ScatterData objects
 */
export function transformToScatterData(
  videos: Video[],
  channelMap: Map<string, string>
): ScatterData[] {
  return videos.map((video) => ({
    duration: Math.round(video.duration_seconds / 60),
    views: video.view_count,
    title: video.title,
    channelName: channelMap.get(video.channel_id) ?? 'Unknown',
    videoId: video.id,
  }))
}
