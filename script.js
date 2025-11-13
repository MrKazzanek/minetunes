// NOWOŚĆ: Filtruj utwory na samym początku
const visibleSongs = songs.filter(song => song.visible !== false);

let playlistData = [];
let currentSongIndex = 0;
let sound;
let isPlaying = false;
let playMode = "normal";
let playOrder = "sequential";
let enabledSongs = {};
let allAlbums = [];
let userPlaylists = [];
let customAlbumOrders = {}; 
let currentView = 'albums';
let currentPlaylistId = null;

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

const albumView = document.getElementById("album-view");
const songListView = document.getElementById("song-list-view");
const albumGrid = document.getElementById("album-grid");
const backToAlbumsBtn = document.getElementById("back-to-albums-btn");
const createPlaylistBtn = document.getElementById("create-playlist-btn");
const modalBackdrop = document.getElementById("modal-backdrop");
const createPlaylistModal = document.getElementById("create-playlist-modal");
const savePlaylistBtn = document.getElementById("save-playlist-btn");
const cancelPlaylistBtn = document.getElementById("cancel-playlist-btn");
const playlistNameInput = document.getElementById("playlist-name");
const playlistDescInput = document.getElementById("playlist-desc");
const playlistCoverInput = document.getElementById("playlist-cover-input");
const coverPreview = document.getElementById("cover-preview");
const modalSongList = document.getElementById("modal-song-list");
const modalSongSearch = document.getElementById("modal-song-search");

const playlistDurationEl = document.getElementById('playlist-duration');
const sharePlaylistBtn = document.getElementById('share-playlist-btn');
const deletePlaylistBtn = document.getElementById('delete-playlist-btn');

const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
const cancelAddToPlaylistBtn = document.getElementById('cancel-add-to-playlist-btn');
const modalPlaylistList = document.getElementById('modal-playlist-list');

const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

let newPlaylistCover = null;
let playlistToDeleteId = null;
let modalSelectedSongIds = new Set();
let draggedItem = null;

async function fetchAlbums() {
    try {
        const response = await fetch('albums.json');
        const defaultAlbums = await response.json();
        const visibleDefaultAlbums = defaultAlbums.filter(album => album.visible !== false);

        const allSongsPlaylist = {
            id: 'all-songs',
            title: 'All Songs',
            description: 'Every song available on MineTunes.',
            cover: 'album.png',
            songs: visibleSongs.map(s => s.id)
        };
        allAlbums = [allSongsPlaylist, ...visibleDefaultAlbums];
    } catch (error) {
        console.error("Could not fetch albums.json:", error);
        const allSongsPlaylist = {
            id: 'all-songs',
            title: 'All Songs',
            description: 'Every song available on MineTunes.',
            cover: 'logo.png',
            songs: visibleSongs.map(s => s.id)
        };
        allAlbums = [allSongsPlaylist];
    }
}

function formatTime(sec, showHours = false) {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);
    
    const paddedSeconds = seconds.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");

    if (showHours && hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${minutes}:${paddedSeconds}`;
}

function renderAlbumView(filter = '') {
    albumGrid.innerHTML = '';
    const lowercasedFilter = filter.toLowerCase();
    const playlistsToRender = [...allAlbums, ...userPlaylists].filter(p => {
        return p.title.toLowerCase().includes(lowercasedFilter) || p.description.toLowerCase().includes(lowercasedFilter);
    });

    playlistsToRender.forEach(playlist => {
        const tile = document.createElement('div');
        tile.className = 'album-tile';
        tile.dataset.id = playlist.id;
        
        const isUserPlaylist = playlist.id.startsWith('user-');
        const songIdOrder = isUserPlaylist ? playlist.songs : (customAlbumOrders[playlist.id] || playlist.songs);

        const songObjects = songIdOrder.map(id => visibleSongs.find(s => s.id === id)).filter(Boolean);
        const totalDuration = songObjects.reduce((acc, song) => acc + (song.duration || 0), 0);
        const artists = [...new Set(songObjects.map(s => s.artist))].join(', ');
        const songCount = songObjects.length;

        tile.innerHTML = `
            <img src="${playlist.cover}" alt="${playlist.title}">
            <div class="album-tile-info">
                <div class="album-tile-title">${playlist.title}</div>
                <div class="album-tile-desc">${playlist.description}</div>
                <div class="album-tile-stats">
                    <span>${songCount} songs</span>
                    <span>Total time: ${formatTime(totalDuration, true)}</span>
                </div>
                <div class="album-tile-artists">${artists}</div>
            </div>
        `;
        tile.addEventListener('click', () => openPlaylist(playlist.id));
        albumGrid.appendChild(tile);
    });
}

function openPlaylist(playlistId) {
    const allPlaylists = [...allAlbums, ...userPlaylists];
    const playlist = allPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    currentPlaylistId = playlist.id;
    saveState(); // ZAPISZ STAN PO ZMIANIE PLAYLISTY

    let songIdOrder;
    const isUserPlaylist = playlist.id.startsWith('user-');

    if (isUserPlaylist) {
        songIdOrder = playlist.songs;
    } else {
        const defaultSongIds = playlist.songs;
        const savedCustomOrder = customAlbumOrders[playlist.id];

        if (savedCustomOrder) {
            const newSongs = defaultSongIds.filter(id => !savedCustomOrder.includes(id));
            if (newSongs.length > 0) {
                songIdOrder = [...savedCustomOrder, ...newSongs];
                customAlbumOrders[playlist.id] = songIdOrder;
                saveState();
            } else {
                songIdOrder = savedCustomOrder;
            }
        } else {
            songIdOrder = defaultSongIds;
        }
    }

    playlistData = songIdOrder.map(id => visibleSongs.find(s => s.id === id)).filter(Boolean);
    
    const totalDuration = playlistData.reduce((acc, song) => acc + (song.duration || 0), 0);
    const songCount = playlistData.length;

    playlistDurationEl.textContent = `${songCount} songs • Total duration: ${formatTime(totalDuration, true)}`;

    deletePlaylistBtn.classList.toggle('hidden', !isUserPlaylist);
    sharePlaylistBtn.classList.toggle('hidden', !isUserPlaylist);
    
    renderPlaylist();
    switchView('songs');
    if (playlistData.length > 0) {
        const currentlyPlayingSong = sound ? playlistData[currentSongIndex] : null;
        if (!sound || !playlistData.some(s => s.id === currentlyPlayingSong?.id)) {
             loadSong(0);
        }
    } else {
        loadSong(-1);
    }
}

function switchView(view) {
    currentView = view;
    if (view === 'albums') {
        albumView.classList.remove('hidden');
        songListView.classList.add('hidden');
        renderAlbumView(searchInput.value);
    } else {
        albumView.classList.add('hidden'); 
        songListView.classList.remove('hidden');
    }
}

function saveState() {
    localStorage.setItem('minetunesVolume', volumeSlider.value);
    localStorage.setItem('minetunesMode', playMode);
    localStorage.setItem('minetunesPlayOrder', playOrder);
    localStorage.setItem('minetunesUserPlaylists', JSON.stringify(userPlaylists));
    localStorage.setItem('minetunesCustomOrders', JSON.stringify(customAlbumOrders));
    localStorage.setItem('minetunesEnabledSongs', JSON.stringify(enabledSongs));
    // NOWOŚĆ: Zapisz ID bieżącej playlisty
    if(currentPlaylistId) {
        localStorage.setItem('minetunesCurrentPlaylistId', currentPlaylistId);
    }
}

function loadState() {
    const savedVolume = localStorage.getItem('minetunesVolume');
    if (savedVolume) volumeSlider.value = savedVolume;

    const savedMode = localStorage.getItem('minetunesMode');
    if (savedMode) {
        playMode = savedMode;
        modeSelect.value = savedMode;
    }

    const savedPlayOrder = localStorage.getItem('minetunesPlayOrder');
    if (savedPlayOrder) {
        playOrder = savedPlayOrder;
        playOrderSelect.value = savedPlayOrder;
    }

    const savedPlaylists = localStorage.getItem('minetunesUserPlaylists');
    if (savedPlaylists) {
        userPlaylists = JSON.parse(savedPlaylists);
    }

    const savedOrders = localStorage.getItem('minetunesCustomOrders');
    if (savedOrders) {
        customAlbumOrders = JSON.parse(savedOrders);
    }

    addToPlaylistBtn.classList.toggle('hidden', userPlaylists.length === 0);

    const savedEnabledJSON = localStorage.getItem('minetunesEnabledSongs');
    const savedEnabled = savedEnabledJSON ? JSON.parse(savedEnabledJSON) : {};
    visibleSongs.forEach(song => {
        enabledSongs[song.id] = savedEnabled[song.id] === false ? false : true;
    });

    // NOWOŚĆ: Odczytaj ID ostatniej playlisty
    return localStorage.getItem('minetunesCurrentPlaylistId');
}

function renderPlaylist(filter = '') {
    playlistEl.innerHTML = '';
    const lowercasedFilter = filter.toLowerCase();
    
    const filteredSongs = playlistData.filter(song => {
        return song.title.toLowerCase().includes(lowercasedFilter) || song.artist.toLowerCase().includes(lowercasedFilter);
    });

    const isUserPlaylist = currentPlaylistId && currentPlaylistId.startsWith('user-');

    filteredSongs.forEach(song => {
        const originalIndex = playlistData.findIndex(s => s.id === song.id);
        const item = document.createElement("div");
        item.classList.add("song-item");
        item.dataset.index = originalIndex;
        item.dataset.id = song.id;
        item.draggable = true;

        const leftWrapper = document.createElement('div');
        leftWrapper.style.cssText = 'display: flex; align-items: center; flex-grow: 1; min-width: 0;';

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("song-item-checkbox");
        checkbox.checked = enabledSongs[song.id];
        checkbox.addEventListener('change', (e) => {
            enabledSongs[song.id] = e.target.checked;
            saveState();
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
        leftWrapper.appendChild(checkbox);
        leftWrapper.appendChild(content);
        item.appendChild(leftWrapper);

        // NOWOŚĆ: Dodaj czas trwania utworu
        const durationSpan = document.createElement('span');
        durationSpan.className = 'song-item-duration';
        durationSpan.textContent = formatTime(song.duration);
        item.appendChild(durationSpan);

        if (isUserPlaylist) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-song-btn';
            removeBtn.textContent = 'X';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const playlist = userPlaylists.find(p => p.id === currentPlaylistId);
                if (playlist) {
                    playlist.songs = playlist.songs.filter(songId => songId !== song.id);
                    saveState();
                    openPlaylist(currentPlaylistId);
                }
            });
            item.appendChild(removeBtn);
        }

        item.addEventListener("click", (e) => {
            if (e.target.type !== 'checkbox' && !e.target.classList.contains('remove-song-btn')) {
                playSong(originalIndex);
            }
        });
        playlistEl.appendChild(item);
    });
    updateActiveSongUI();
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
    if(index < 0 || index >= playlistData.length) {
        titleEl.textContent = "Playlist is empty";
        artistEl.textContent = "";
        coverEl.src = "logo.png";
        genreEl.innerHTML = '';
        durationEl.textContent = "0:00";
        currentTimeEl.textContent = "0:00";
        progress.value = 0;
        sound = null;
        isPlaying = false;
        playBtn.textContent = "►";
        return;
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
    loadSong(index, true);
}

function togglePlay() {
    if (!sound) {
        if (playlistData.length > 0) playSong(0);
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
    
    const currentIndexInEnabled = enabledIndexes.indexOf(currentSongIndex);
    if (currentIndexInEnabled === -1) { 
        return enabledIndexes[0];
    }
    const nextIndexInEnabled = (currentIndexInEnabled + direction + enabledIndexes.length) % enabledIndexes.length;
    return enabledIndexes[nextIndexInEnabled];
}

function prevSong() {
    const prevIndex = findNextEnabledSong(-1);
    if (prevIndex !== -1) playSong(prevIndex);
}

function nextSong() {
    const nextIndex = findNextEnabledSong(1);
    if (nextIndex !== -1) playSong(nextIndex);
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
        const enabledIndices = playlistData.map((s, i) => enabledSongs[s.id] ? i : -1).filter(i => i !== -1);
        const lastEnabledIndex = enabledIndices[enabledIndices.length - 1];

        if (playOrder === 'sequential' && currentSongIndex === lastEnabledIndex) {
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

function togglePlayOrderVisibility() {
    playOrderContainer.classList.toggle('hidden', !(playMode === 'normal' || playMode === 'repeat-all'));
}

function renderModalSongList(filter = '') {
    const lowercasedFilter = filter.toLowerCase();
    modalSongList.innerHTML = '';

    const filtered = visibleSongs.filter(song => 
        song.title.toLowerCase().includes(lowercasedFilter) ||
        song.artist.toLowerCase().includes(lowercasedFilter) ||
        song.genre.some(g => g.toLowerCase().includes(lowercasedFilter))
    );

    filtered.forEach(song => {
        const isChecked = modalSelectedSongIds.has(song.id);
        const item = document.createElement('div');
        item.className = 'modal-song-item';
        item.innerHTML = `
            <label style="display: flex; align-items: center; width: 100%; cursor: pointer;">
                <input type="checkbox" data-song-id="${song.id}" class="song-item-checkbox" ${isChecked ? 'checked' : ''}>
                <span style="margin-left: 10px;">${song.title} - ${song.artist}</span>
            </label>
        `;
        modalSongList.appendChild(item);
    });
}

function openCreatePlaylistModal() {
    playlistNameInput.value = '';
    playlistDescInput.value = '';
    playlistCoverInput.value = '';
    coverPreview.classList.add('hidden');
    newPlaylistCover = null;
    modalSongSearch.value = '';
    modalSelectedSongIds.clear();

    renderModalSongList();

    modalBackdrop.classList.remove('hidden');
    createPlaylistModal.classList.remove('hidden');
}

function closeModals() {
    modalBackdrop.classList.add('hidden');
    createPlaylistModal.classList.add('hidden');
    addToPlaylistModal.classList.add('hidden');
    confirmDeleteModal.classList.add('hidden');
}

function savePlaylist() {
    const name = playlistNameInput.value.trim();
    if (!name) {
        alert("Playlist name is required!");
        return;
    }

    const selectedSongIds = Array.from(modalSelectedSongIds);

    const newPlaylist = {
        id: `user-${Date.now()}`,
        title: name,
        description: playlistDescInput.value.trim(),
        cover: newPlaylistCover || 'logo.png',
        songs: selectedSongIds
    };

    userPlaylists.push(newPlaylist);
    saveState();
    renderAlbumView();
    closeModals();
    addToPlaylistBtn.classList.remove('hidden');
}

function handlePlaylistImport() {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistData = urlParams.get('playlist');
    if (playlistData) {
        try {
            const decoded = atob(playlistData);
            const importedPlaylist = JSON.parse(decoded);
            
            const newPlaylist = {
                id: `user-${Date.now()}`,
                title: importedPlaylist.title,
                description: importedPlaylist.description,
                cover: 'logo.png',
                songs: importedPlaylist.songs.filter(id => visibleSongs.some(s => s.id === id))
            };

            const isDuplicate = userPlaylists.some(p => 
                p.title === newPlaylist.title && 
                p.description === newPlaylist.description &&
                JSON.stringify(p.songs.sort()) === JSON.stringify(newPlaylist.songs.sort())
            );

            if (isDuplicate) {
                alert("This playlist has already been imported.");
            } else {
                userPlaylists.push(newPlaylist);
                saveState();
                alert(`Playlist "${newPlaylist.title}" imported successfully!`);
                renderAlbumView();
            }
            
            window.history.replaceState({}, document.title, window.location.pathname);
            
        } catch (e) {
            console.error('Failed to import playlist:', e);
            alert('Could not import playlist from URL.');
        }
    }
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

function updateCurrentSongIndexAfterReorder(playingSongId) {
    if (!playingSongId) return;

    const newIndex = playlistData.findIndex(song => song.id === playingSongId);
    if (newIndex !== -1) {
        currentSongIndex = newIndex;
        updateActiveSongUI();
    }
}

// NOWOŚĆ: Funkcja do aktualizacji meta tagów dla udostępniania
function updateMetaTagsForShare() {
    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get('song');
    const playlistParam = urlParams.get('playlist'); // Obsługa playlist w przyszłości

    if (songId) {
        const song = visibleSongs.find(s => s.id === songId);
        if (song) {
            const songTitle = `${song.title} - ${song.artist}`;
            const albumsWithSong = allAlbums
                .filter(album => album.id !== 'all-songs' && album.songs.includes(song.id))
                .map(album => album.title);
            
            let description = `Genre: ${song.genre.join(', ')} | Duration: ${formatTime(song.duration)}`;
            if (albumsWithSong.length > 0) {
                description += ` | Albums: ${albumsWithSong.join(', ')}`;
            }

            document.title = songTitle;
            document.querySelector('meta[property="og:title"]').setAttribute('content', songTitle);
            document.querySelector('meta[name="twitter:title"]').setAttribute('content', songTitle);
            document.querySelector('meta[property="og:description"]').setAttribute('content', description);
            document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
            
            // Tworzymy pełny URL do obrazka
            const imageUrl = new URL(song.cover, window.location.href).href;
            document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);
            document.querySelector('meta[name="twitter:image"]').setAttribute('content', imageUrl);
            
            const songUrl = `${window.location.origin}${window.location.pathname}?song=${song.id}`;
            document.querySelector('meta[property="og:url"]').setAttribute('content', songUrl);
        }
    } else if (playlistParam) {
        // Ta część jest trudniejsza, bo dane playlisty są zakodowane.
        // Na razie zostawiamy domyślne tagi dla udostępnianych playlist.
        // Boty i tak nie odkodują parametru URL.
    }
}


async function init() {
    await fetchAlbums();
    const savedPlaylistId = loadState();
    handlePlaylistImport();
    updateMetaTagsForShare(); // Uruchom sprawdzanie meta tagów na starcie

    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get('song');

    if (songId && !urlParams.has('playlist')) {
        // Jeśli jest ID piosenki w URL, otwórz 'All Songs' i zagraj
        openPlaylist('all-songs');
        const songIndex = playlistData.findIndex(s => s.id === songId);
        if (songIndex !== -1) {
            loadSong(songIndex, true);
        }
    } else if (savedPlaylistId) {
        // NOWOŚĆ: Jeśli nie ma parametrów w URL, ale jest zapisana playlista, otwórz ją
        openPlaylist(savedPlaylistId);
    } else {
        // Domyślne zachowanie: otwórz 'All Songs'
        openPlaylist('all-songs');
        switchView('albums'); // Ale domyślnie pokaż widok albumów
    }
    
    togglePlayOrderVisibility();

    playBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", prevSong);
    nextBtn.addEventListener("click", nextSong);
    backToAlbumsBtn.addEventListener("click", () => switchView('albums'));
    createPlaylistBtn.addEventListener("click", openCreatePlaylistModal);
    cancelPlaylistBtn.addEventListener("click", closeModals);
    savePlaylistBtn.addEventListener("click", savePlaylist);

    modalSongList.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"][data-song-id]')) {
            const songId = e.target.dataset.songId;
            if (e.target.checked) {
                modalSelectedSongIds.add(songId);
            } else {
                modalSelectedSongIds.delete(songId);
            }
        }
    });

    modalSongSearch.addEventListener('input', () => renderModalSongList(modalSongSearch.value));

    playlistCoverInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                newPlaylistCover = event.target.result;
                coverPreview.src = newPlaylistCover;
                coverPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

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

    sharePlaylistBtn.addEventListener('click', () => {
        const playlist = userPlaylists.find(p => p.id === currentPlaylistId);
        if(!playlist) return;
        
        const shareable = { title: playlist.title, description: playlist.description, songs: playlist.songs };
        const encoded = btoa(JSON.stringify(shareable));
        const url = `${window.location.origin}${window.location.pathname}?playlist=${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = sharePlaylistBtn.textContent;
            shareBtn.textContent = 'Copied!';
            setTimeout(() => { shareBtn.textContent = originalText; }, 1500);
        });
    });

    deletePlaylistBtn.addEventListener('click', () => {
        playlistToDeleteId = currentPlaylistId;
        modalBackdrop.classList.remove('hidden');
        confirmDeleteModal.classList.remove('hidden');
    });

    confirmDeleteBtn.addEventListener('click', () => {
        userPlaylists = userPlaylists.filter(p => p.id !== playlistToDeleteId);
        if (customAlbumOrders[playlistToDeleteId]) {
            delete customAlbumOrders[playlistToDeleteId];
        }
        // NOWOŚĆ: Jeśli usunięto bieżącą playlistę, wyczyść ją z pamięci
        if(localStorage.getItem('minetunesCurrentPlaylistId') === playlistToDeleteId) {
            localStorage.removeItem('minetunesCurrentPlaylistId');
            currentPlaylistId = 'all-songs'; // Wróć do domyślnej
        }
        saveState();
        closeModals();
        switchView('albums');
        addToPlaylistBtn.classList.toggle('hidden', userPlaylists.length === 0);
    });
    cancelDeleteBtn.addEventListener('click', closeModals);

    addToPlaylistBtn.addEventListener('click', () => {
        const songId = playlistData[currentSongIndex]?.id;
        if (!songId) return;

        modalPlaylistList.innerHTML = '';
        userPlaylists.forEach(p => {
            const item = document.createElement('div');
            item.className = 'modal-playlist-item';
            item.textContent = p.title;
            item.onclick = () => {
                if(!p.songs.includes(songId)) {
                    p.songs.push(songId);
                    saveState();
                }
                closeModals();
            };
            modalPlaylistList.appendChild(item);
        });
        modalBackdrop.classList.remove('hidden');
        addToPlaylistModal.classList.remove('hidden');
    });
    cancelAddToPlaylistBtn.addEventListener('click', closeModals);

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
        if (currentView === 'albums') {
            renderAlbumView(e.target.value);
        } else {
            renderPlaylist(e.target.value);
        }
    });
    
    progress.addEventListener("input", () => {
        if (sound && sound.duration()) {
            const seekTo = (progress.value / 100) * sound.duration();
            sound.seek(seekTo);
            currentTimeEl.textContent = formatTime(seekTo);
        }
    });

    playlistEl.addEventListener('dragstart', e => {
        if (e.target.classList.contains('song-item')) {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        }
    });

    playlistEl.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
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

    playlistEl.addEventListener('drop', e => {
        e.preventDefault();
        
        const playingSongId = playlistData[currentSongIndex]?.id;
        const newSongIds = [...playlistEl.querySelectorAll('.song-item')].map(item => item.dataset.id);
        const userPlaylist = userPlaylists.find(p => p.id === currentPlaylistId);

        if (userPlaylist) {
            userPlaylist.songs = newSongIds;
        } else {
            customAlbumOrders[currentPlaylistId] = newSongIds;
        }

        saveState();
        
        playlistData = newSongIds.map(id => visibleSongs.find(s => s.id === id)).filter(Boolean);
        renderPlaylist();
        updateCurrentSongIndexAfterReorder(playingSongId);
    });
}

init();
