import yt_dlp
import json
import os
from datetime import datetime

def scrape_videos(channel_url):
    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'force_generic_extractor': False,
    }

    videos = []
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(channel_url, download=False)
            if 'entries' in info:
                for entry in info['entries']:
                    if entry:
                        videos.append({
                            'id': entry.get('id'),
                            'title': entry.get('title'),
                            'url': f"https://www.youtube.com/watch?v={entry.get('id')}",
                            'thumbnail': entry.get('thumbnails', [{}])[-1].get('url') if entry.get('thumbnails') else None,
                            'description': entry.get('description'),
                            'duration': entry.get('duration'),
                            'view_count': entry.get('view_count'),
                            'upload_date': entry.get('upload_date'),
                        })
        except Exception as e:
            print(f"Error scraping channel: {e}")

    return videos

def save_to_json(data, filename):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    output = {
        'last_updated': datetime.now().isoformat(),
        'total_videos': len(data),
        'videos': data
    }
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
    print(f"Saved {len(data)} videos to {filename}")

if __name__ == "__main__":
    CHANNEL_URL = "https://www.youtube.com/@BhankasPodcast/videos"
    DATA_FILE = "data/videos.json"
    
    print(f"Starting scrape for {CHANNEL_URL}...")
    video_data = scrape_videos(CHANNEL_URL)
    if video_data:
        save_to_json(video_data, DATA_FILE)
    else:
        print("No videos found or error occurred.")
