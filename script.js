let playlistData = [...songs];
let currentSongIndex = 0;
let sound;
let isPlaying = false;
let playMode = "normal";
let playOrder = "sequential";
let enabledSongs = {};

// DOM Elements
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shareBtn = document.getElementById("share-btn");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const genreEl = document.getElementById("genre");
const coverEl = document.getElementById("cover");
const playlistEl = document.getElementById("playlist");
const volumeSlider = document.getElementById("volume");
const modeSelect = document.getElementById("mode");
const playOrderSelect = document.getElementById("play-order");
const playOrderContainer = document.getElementById("play-order-container");
const searchInput = document.getElementById("search-input");


function saveState() {
    const songOrder = playlistData.map(song => song.id);
    localStorage.setItem('jukeboxedVolume', volumeSlider.value);
    localStorage.setItem('jukeboxedMode', playMode);
    localStorage.setItem('jukeboxedPlayOrder', playOrder);
    localStorage.setItem('jukeboxedSongOrder', JSON.stringify(songOrder));
    localStorage.setItem('jukeboxedEnabledSongs', JSON.stringify(enabledSongs));
}

function loadState() {
    const savedVolume = localStorage.getItem('jukeboxedVolume');
    if (savedVolume) volumeSlider.value = savedVolume;

    const savedMode = localStorage.getItem('jukeboxedMode');
    if (savedMode) {
        playMode = savedMode;
        modeSelect.value = savedMode;
    }

    const savedPlayOrder = localStorage.getItem('jukeboxedPlayOrder');
    if (savedPlayOrder) {
        playOrder = savedPlayOrder;
        playOrderSelect.value = savedPlayOrder;
    }

    const savedOrderJSON = localStorage.getItem('jukeboxedSongOrder');
    if (savedOrderJSON) {
        const savedOrder = JSON.parse(savedOrderJSON);
        const validSongsInOrder = savedOrder.map(id => songs.find(s => s.id === id)).filter(Boolean);
        const remainingSongs = songs.filter(s => !savedOrder.includes(s.id));
        playlistData = [...validSongsInOrder, ...remainingSongs];
    }

    const savedEnabledJSON = localStorage.getItem('jukeboxedEnabledSongs');
    const savedEnabled = savedEnabledJSON ? JSON.parse(savedEnabledJSON) : {};
    songs.forEach(song => {
        enabledSongs[song.id] = savedEnabled[song.id] === false ? false : true;
    });
}

function renderPlaylist(filter = '') {
    playlistEl.innerHTML = '';
    const lowercasedFilter = filter.toLowerCase();
    
    const filteredSongs = playlistData.filter(song => {
        const titleMatch = song.title.toLowerCase().includes(lowercasedFilter);
        const artistMatch = song.artist.toLowerCase().includes(lowercasedFilter);
        const genreMatch = song.genre.some(g => g.toLowerCase().includes(lowercasedFilter));
        const versionMatch = song.version && song.version.toLowerCase().includes(lowercasedFilter);
        return titleMatch || artistMatch || genreMatch || versionMatch;
    });

    filteredSongs.forEach(song => {
        const index = playlistData.findIndex(s => s.id === song.id);
        const item = document.createElement("div");
        item.classList.add("song-item");
        item.dataset.index = index;
        item.dataset.id = song.id;
        item.draggable = true;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("song-item-checkbox");
        checkbox.checked = enabledSongs[song.id];
        checkbox.addEventListener('change', (e) => {
            enabledSongs[song.id] = e.target.checked;
            saveState();
            renderPlaylist(searchInput.value); // Re-render with current filter
        });
        
        const content = document.createElement("div");
        content.classList.add("song-item-content");

        const details = document.createElement("div");
        details.classList.add("song-item-details");
        details.textContent = `${song.title} - ${song.artist}`;

        const genresDiv = document.createElement("div");
        genresDiv.classList.add("song-item-genres");
        song.genre.forEach(g => {
            const genreTag = document.createElement("span");
            genreTag.classList.add("genre-tag");
            genreTag.textContent = g;
            genresDiv.appendChild(genreTag);
        });

        content.appendChild(details);
        content.appendChild(genresDiv);
        item.appendChild(checkbox);
        item.appendChild(content);

        item.addEventListener("click", (e) => {
            if (e.target.type !== 'checkbox') {
                playSong(index);
            }
        });
        playlistEl.appendChild(item);
    });
    addDragAndDropListeners();
    updateActiveSongUI();
}


function resetSearchAndRender() {
    if (searchInput.value !== '') {
        searchInput.value = '';
    }
    renderPlaylist();
}


function updateActiveSongUI() {
    document.querySelectorAll(".song-item").forEach((el) => {
        el.classList.toggle("active", parseInt(el.dataset.index) === currentSongIndex);
    });
}

function loadSong(index, shouldPlay = false) {
    if (sound) {
        sound.stop();
        sound.unload();
    }

    currentSongIndex = index;
    const song = playlistData[currentSongIndex];
    if (!song) return;

    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    coverEl.src = song.cover;
    
    genreEl.innerHTML = '';
    song.genre.forEach(g => {
        const genreTag = document.createElement("span");
        genreTag.classList.add("genre-tag");
        genreTag.textContent = g;
        genreEl.appendChild(genreTag);
    });

    updateActiveSongUI();
    
    sound = new Howl({
        src: [song.src],
        html5: true,
        volume: volumeSlider.value,
        onend: handleSongEnd,
        onload: () => {
            durationEl.textContent = formatTime(sound.duration());
            if(!isPlaying) {
                currentTimeEl.textContent = "0:00";
                progress.value = 0;
            }
        }
    });

    if (shouldPlay) {
        sound.play();
        isPlaying = true;
        playBtn.textContent = "||";
        requestAnimationFrame(updateProgress);
    } else {
        isPlaying = false;
        playBtn.textContent = "►";
    }
}

function playSong(index) {
    if(searchInput.value) {
       searchInput.value = '';
       renderPlaylist();
    }
    loadSong(index, true);
}

function togglePlay() {
    resetSearchAndRender();
    if (!sound) {
        playSong(currentSongIndex);
    } else if (isPlaying) {
        sound.pause();
        isPlaying = false;
        playBtn.textContent = "►";
    } else {
        sound.play();
        isPlaying = true;
        playBtn.textContent = "||";
        requestAnimationFrame(updateProgress);
    }
}

function findNextEnabledSong(direction = 1) {
    const enabledIndexes = playlistData
        .map((song, index) => enabledSongs[song.id] ? index : -1)
        .filter(index => index !== -1);
    
    if (enabledIndexes.length === 0) return -1;

    if (playOrder === 'random' && (playMode === 'normal' || playMode === 'repeat-all')) {
        let availableIndexes = enabledIndexes;
        if (enabledIndexes.length > 1) {
             availableIndexes = enabledIndexes.filter(index => index !== currentSongIndex);
        }
        const randomIndex = Math.floor(Math.random() * availableIndexes.length);
        return availableIndexes[randomIndex];
    }
    
    // Sequential logic
    const currentIndexInEnabled = enabledIndexes.indexOf(currentSongIndex);
    if (currentIndexInEnabled === -1) { // If current song is disabled, find first enabled
        return enabledIndexes[0];
    }
    const nextIndexInEnabled = (currentIndexInEnabled + direction + enabledIndexes.length) % enabledIndexes.length;
    return enabledIndexes[nextIndexInEnabled];
}

function prevSong() {
    resetSearchAndRender();
    const prevIndex = findNextEnabledSong(-1);
    if (prevIndex !== -1) {
        playSong(prevIndex);
    }
}

function nextSong() {
    resetSearchAndRender();
    const nextIndex = findNextEnabledSong(1);
    if (nextIndex !== -1) {
        playSong(nextIndex);
    }
}

function handleSongEnd() {
    if (playMode === "repeat-one") {
        playSong(currentSongIndex);
        return;
    }
    
    if (playMode === "play-one-stop") {
        isPlaying = false;
        playBtn.textContent = "►";
        return;
    }

    const nextIndex = findNextEnabledSong(1);
    
    if (nextIndex === -1) {
        isPlaying = false;
        playBtn.textContent = "►";
        return;
    }

    if (playMode === "repeat-all") {
        playSong(nextIndex);
    } else if (playMode === "normal") {
        if (playOrder === 'random' || (playOrder === 'sequential' && nextIndex > currentSongIndex)) {
             playSong(nextIndex);
        } else if (findNextEnabledSong(1) === enabledSongs[0]) {
            // This case handles when the last song finishes in 'normal' sequential mode
            isPlaying = false;
            playBtn.textContent = "►";
        } else {
             playSong(nextIndex);
        }
    }
}

function updateProgress() {
    if (!sound || !isPlaying) return;
    const seek = sound.seek() || 0;
    progress.value = sound.duration() ? (seek / sound.duration()) * 100 : 0;
    currentTimeEl.textContent = formatTime(seek);
    requestAnimationFrame(updateProgress);
}

progress.addEventListener("input", () => {
    resetSearchAndRender();
    if (sound && sound.duration()) {
        const seekTo = (progress.value / 100) * sound.duration();
        sound.seek(seekTo);
        currentTimeEl.textContent = formatTime(seekTo);
    }
});

function formatTime(sec) {
    const minutes = Math.floor(sec / 60) || 0;
    const seconds = Math.floor(sec % 60) || 0;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function addDragAndDropListeners() {
    const items = document.querySelectorAll('.song-item');
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });

        item.addEventListener('dragend', () => {
            if (!draggedItem) return;
            draggedItem.classList.remove('dragging');
            draggedItem = null;

            const newPlaylistData = [];
            document.querySelectorAll('.song-item').forEach(el => {
                newPlaylistData.push(playlistData.find(s => s.id === el.dataset.id));
            });
            playlistData = newPlaylistData;

            const currentSongId = playlistData[currentSongIndex]?.id;
            if (currentSongId) {
                currentSongIndex = playlistData.findIndex(s => s.id === currentSongId);
            }

            renderPlaylist();
            saveState();
        });
    });

    playlistEl.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(playlistEl, e.clientY);
        const currentDragged = document.querySelector('.dragging');
        if (afterElement == null) {
            playlistEl.appendChild(currentDragged);
        } else {
            playlistEl.insertBefore(currentDragged, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.song-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function togglePlayOrderVisibility() {
    if (playMode === 'normal' || playMode === 'repeat-all') {
        playOrderContainer.classList.remove('hidden');
    } else {
        playOrderContainer.classList.add('hidden');
    }
}

function handleSharedSong() {
    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get('song');
    if (songId) {
        const songIndex = playlistData.findIndex(s => s.id === songId);
        if (songIndex !== -1) {
            currentSongIndex = songIndex;
        }
    }
}

function init() {
    loadState();
    handleSharedSong();
    renderPlaylist();
    loadSong(currentSongIndex, false);
    togglePlayOrderVisibility();

    playBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", prevSong);
    nextBtn.addEventListener("click", nextSong);

    shareBtn.addEventListener("click", () => {
        const currentSong = playlistData[currentSongIndex];
        if (!currentSong) return;
        const url = `${window.location.origin}${window.location.pathname}?song=${currentSong.id}`;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = shareBtn.textContent;
            shareBtn.textContent = 'Copied!';
            setTimeout(() => { shareBtn.textContent = originalText; }, 1500);
        });
    });

    volumeSlider.addEventListener("input", () => {
        if (sound) sound.volume(volumeSlider.value);
        saveState();
    });

    modeSelect.addEventListener("change", e => {
        playMode = e.target.value;
        togglePlayOrderVisibility();
        saveState();
    });

    playOrderSelect.addEventListener('change', e => {
        playOrder = e.target.value;
        saveState();
    });

    searchInput.addEventListener('input', (e) => {
        renderPlaylist(e.target.value);
    });
}

init();
