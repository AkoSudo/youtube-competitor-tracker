import { describe, it, expect } from 'vitest'
import { parseYouTubeChannelUrl } from './youtube'

describe('parseYouTubeChannelUrl', () => {
  describe('channel ID format (/channel/UC...)', () => {
    it('parses full URL with channel ID', () => {
      const result = parseYouTubeChannelUrl('https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA')
      expect(result).toEqual({ type: 'id', value: 'UCX6OQ3DkcsbYNE6H8uQQuVA' })
    })

    it('parses URL without www', () => {
      const result = parseYouTubeChannelUrl('https://youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA')
      expect(result).toEqual({ type: 'id', value: 'UCX6OQ3DkcsbYNE6H8uQQuVA' })
    })

    it('handles trailing slash', () => {
      const result = parseYouTubeChannelUrl('https://youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA/')
      expect(result).toEqual({ type: 'id', value: 'UCX6OQ3DkcsbYNE6H8uQQuVA' })
    })
  })

  describe('handle format (/@...)', () => {
    it('parses handle URL', () => {
      const result = parseYouTubeChannelUrl('https://www.youtube.com/@MrBeast')
      expect(result).toEqual({ type: 'handle', value: 'MrBeast' })
    })

    it('handles dots in handle', () => {
      const result = parseYouTubeChannelUrl('https://youtube.com/@mr.beast')
      expect(result).toEqual({ type: 'handle', value: 'mr.beast' })
    })

    it('handles underscores and dashes', () => {
      const result = parseYouTubeChannelUrl('https://youtube.com/@some_user-name')
      expect(result).toEqual({ type: 'handle', value: 'some_user-name' })
    })
  })

  describe('custom URL format (/c/...)', () => {
    it('parses custom URL', () => {
      const result = parseYouTubeChannelUrl('https://youtube.com/c/PewDiePie')
      expect(result).toEqual({ type: 'custom', value: 'PewDiePie' })
    })

    it('handles legacy /user/ format', () => {
      const result = parseYouTubeChannelUrl('https://youtube.com/user/PewDiePie')
      expect(result).toEqual({ type: 'custom', value: 'PewDiePie' })
    })
  })

  describe('raw channel ID', () => {
    it('parses raw channel ID starting with UC', () => {
      const result = parseYouTubeChannelUrl('UCX6OQ3DkcsbYNE6H8uQQuVA')
      expect(result).toEqual({ type: 'id', value: 'UCX6OQ3DkcsbYNE6H8uQQuVA' })
    })

    it('handles channel ID with dashes', () => {
      const result = parseYouTubeChannelUrl('UC-lHJZR3Gqxm24_Vd_AJ5Yw')
      expect(result).toEqual({ type: 'id', value: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw' })
    })
  })

  describe('URLs without protocol', () => {
    it('parses URL without https://', () => {
      const result = parseYouTubeChannelUrl('youtube.com/@MrBeast')
      expect(result).toEqual({ type: 'handle', value: 'MrBeast' })
    })

    it('parses URL with www but no protocol', () => {
      const result = parseYouTubeChannelUrl('www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA')
      expect(result).toEqual({ type: 'id', value: 'UCX6OQ3DkcsbYNE6H8uQQuVA' })
    })
  })

  describe('edge cases and error handling', () => {
    it('ignores query parameters', () => {
      const result = parseYouTubeChannelUrl('https://youtube.com/@MrBeast?sub_confirmation=1')
      expect(result).toEqual({ type: 'handle', value: 'MrBeast' })
    })

    it('returns null for empty string', () => {
      expect(parseYouTubeChannelUrl('')).toBeNull()
    })

    it('returns null for random string', () => {
      expect(parseYouTubeChannelUrl('not-a-url')).toBeNull()
    })

    it('returns null for non-YouTube URL', () => {
      expect(parseYouTubeChannelUrl('https://vimeo.com/user123')).toBeNull()
    })

    it('returns null for YouTube video URL', () => {
      expect(parseYouTubeChannelUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    })

    it('returns null for YouTube shorts URL', () => {
      expect(parseYouTubeChannelUrl('https://youtube.com/shorts/abc123')).toBeNull()
    })
  })
})
