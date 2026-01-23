/**
 * Result of parsing a YouTube channel URL.
 * - 'id': Direct channel ID (UC...)
 * - 'handle': Modern handle (@username)
 * - 'custom': Custom URL (/c/name or /user/name)
 */
export type YouTubeChannelParseResult = {
  type: 'id' | 'handle' | 'custom'
  value: string
}

/**
 * Parses a YouTube channel URL or ID and extracts the channel identifier.
 *
 * Supported formats:
 * - https://youtube.com/channel/UC... -> { type: 'id', value: 'UC...' }
 * - https://youtube.com/@handle -> { type: 'handle', value: 'handle' }
 * - https://youtube.com/c/CustomName -> { type: 'custom', value: 'CustomName' }
 * - https://youtube.com/user/Username -> { type: 'custom', value: 'Username' }
 * - UC... (raw 24-char ID) -> { type: 'id', value: 'UC...' }
 *
 * @param input - YouTube URL or channel ID
 * @returns Parsed result or null if invalid
 */
export function parseYouTubeChannelUrl(
  input: string
): YouTubeChannelParseResult | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  // Check for raw channel ID (starts with UC, 24 chars total)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: 'id', value: trimmed }
  }

  try {
    // Add protocol if missing
    const urlString = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const url = new URL(urlString)

    // Verify it's a YouTube domain
    const hostname = url.hostname.toLowerCase()
    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
      return null
    }

    const path = url.pathname

    // /channel/UC... format (canonical channel ID)
    const channelMatch = path.match(/\/channel\/(UC[\w-]{22})/)
    if (channelMatch) {
      return { type: 'id', value: channelMatch[1] }
    }

    // /@handle format (modern handle)
    const handleMatch = path.match(/\/@([\w._-]+)/)
    if (handleMatch) {
      return { type: 'handle', value: handleMatch[1] }
    }

    // /c/customname format (custom URL)
    const customMatch = path.match(/\/c\/([\w._-]+)/)
    if (customMatch) {
      return { type: 'custom', value: customMatch[1] }
    }

    // /user/username format (legacy)
    const userMatch = path.match(/\/user\/([\w._-]+)/)
    if (userMatch) {
      return { type: 'custom', value: userMatch[1] }
    }

    // No recognized pattern
    return null
  } catch {
    // URL parsing failed
    return null
  }
}
