document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('videoContainer');
    const searchInput = document.getElementById('searchInput');
    let allVideos = [];

    // Fetch the video data
    async function fetchVideos() {
        try {
            // Note: In local development, the path is ../data/videos.json
            const response = await fetch('../data/videos.json');
            if (!response.ok) throw new Error('Failed to load video data');
            
            const data = await response.json();
            allVideos = data.videos;
            displayVideos(allVideos);
        } catch (error) {
            console.error('Error fetching videos:', error);
            videoContainer.innerHTML = `<div class="loader">Error loading episodes. Please try again later.</div>`;
        }
    }

    // Display videos in grid
    function displayVideos(videos) {
        if (videos.length === 0) {
            videoContainer.innerHTML = `<div class="loader">No episodes found matching your search.</div>`;
            return;
        }

        videoContainer.innerHTML = `<div class="video-grid"></div>`;
        const grid = videoContainer.querySelector('.video-grid');

        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="thumbnail-container">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                </div>
                <div class="video-info">
                    <h3 class="video-title" title="${video.title}">${video.title}</h3>
                    <div class="video-meta">
                        <span class="view-count">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ${formatViews(video.view_count)}
                        </span>
                        <span class="duration">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${formatDuration(video.duration)}
                        </span>
                    </div>
                </div>
            `;
            card.onclick = () => window.open(video.url, '_blank');
            grid.appendChild(card);
        });
    }

    // Helper: Format view count
    function formatViews(num) {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // Helper: Format duration (seconds to MM:SS or HH:MM:SS)
    function formatDuration(seconds) {
        if (!seconds) return '--:--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allVideos.filter(video => 
            video.title.toLowerCase().includes(term) || 
            (video.description && video.description.toLowerCase().includes(term))
        );
        displayVideos(filtered);
    });

    // Initial fetch
    fetchVideos();
});
