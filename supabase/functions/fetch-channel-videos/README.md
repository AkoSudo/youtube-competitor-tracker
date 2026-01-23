# fetch-channel-videos Edge Function

Fetches videos from a YouTube channel via the YouTube Data API v3.

## Required Secrets

Set these in Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets:

| Secret | Source |
|--------|--------|
| YOUTUBE_API_KEY | Google Cloud Console -> APIs & Services -> Credentials |

SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically available.

## Setup Steps

1. **Create YouTube API Key**
   - Go to https://console.cloud.google.com/
   - Create a project (or use existing)
   - Enable "YouTube Data API v3" in APIs & Services -> Library
   - Create API key in APIs & Services -> Credentials
   - (Optional) Restrict key to YouTube Data API v3

2. **Set Secret in Supabase**
   ```bash
   supabase secrets set YOUTUBE_API_KEY=your_api_key_here
   ```
   Or via Dashboard: Project Settings -> Edge Functions -> Secrets

3. **Deploy Function**
   ```bash
   supabase functions deploy fetch-channel-videos
   ```

## Usage

POST /functions/v1/fetch-channel-videos

Request body:
```json
{
  "channelId": "uuid-from-channels-table",
  "youtubeChannelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  "forceRefresh": false
}
```

Response:
```json
{
  "videos": [...],
  "cached": true,
  "fetchedAt": "2026-01-23T12:00:00Z"
}
```

## Quota Usage

Each refresh uses 3 YouTube API quota units:
- channels.list: 1 unit
- playlistItems.list: 1 unit
- videos.list: 1 unit

Daily quota is 10,000 units = ~3,333 channel refreshes/day.
