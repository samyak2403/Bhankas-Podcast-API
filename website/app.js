document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('videoContainer');
    const searchInput = document.getElementById('searchInput');
    const videoPlayerModal = document.getElementById('videoPlayerModal');
    const youtubePlayer = document.getElementById('youtubePlayer');
    const modalVideoTitle = document.getElementById('modalVideoTitle');
    const modalVideoViews = document.getElementById('modalVideoViews');
    const modalVideoDuration = document.getElementById('modalVideoDuration');
    const modalVideoDescription = document.getElementById('modalVideoDescription');
    const closeModal = document.getElementById('closeModal');
    const modalBackdrop = videoPlayerModal.querySelector('.modal-backdrop');

    let allVideos = [];

    // Fetch the video data
    async function fetchVideos() {
        try {
            // Updated fetch to handle local file access issues in some browsers
            // fallback to relative path if absolute fails
            let response;
            try {
                response = await fetch('../data/videos.json');
            } catch (e) {
                console.warn('Local fetch failed, trying alternative path...');
                response = await fetch('data/videos.json');
            }

            if (!response.ok) throw new Error('Failed to load video data');
            
            const data = await response.json();
            allVideos = data.videos;
            
            // Add a slight delay for cinematic loader feel
            setTimeout(() => {
                displayVideos(allVideos);
            }, 800);
        } catch (error) {
            console.error('Error fetching videos:', error);
            videoContainer.innerHTML = `
                <div class="error-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p>Unable to load episodes. Please ensure you are viewing this via a local server or check the console.</p>
                </div>
            `;
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
                    <div class="play-overlay">
                        <div class="play-btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                    </div>
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
            card.onclick = () => openPlayer(video);
            grid.appendChild(card);
        });
    }

    // Player Modal Logic
    function openPlayer(video) {
        const videoId = video.id;
        youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modalVideoTitle.textContent = video.title;
        modalVideoViews.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            ${formatViews(video.view_count)} Views
        `;
        modalVideoDuration.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${formatDuration(video.duration)}
        `;
        modalVideoDescription.textContent = video.description || 'No description available for this episode.';
        
        videoPlayerModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    function closePlayer() {
        videoPlayerModal.classList.remove('active');
        youtubePlayer.src = ''; // Stop video
        document.body.style.overflow = 'auto'; // Re-enable scroll
    }

    closeModal.onclick = closePlayer;
    modalBackdrop.onclick = closePlayer;

    // Esc key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoPlayerModal.classList.contains('active')) {
            closePlayer();
        }
    });

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
