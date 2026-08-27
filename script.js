const visibleSongs = songs.filter(song => song.visible !== false);
const songMap = new Map(visibleSongs.map(song => [song.id, song]));

let playlistData = [];
let currentSongIndex = 0;
let sound = null;
let isPlaying = false;
let playMode = "normal";
let playOrder = "sequential";
let enabledSongs = {};
let allAlbums = [];
let userPlaylists = [];
let customAlbumOrders = {}; 
let currentView = 'albums';
let currentPlaylistId = null;

let favorites = { songs: [], albums: [] };
let recentlyPlayed = [];

const DEFAULT_SECTIONS = [
    { id: 'quick_select', title: 'QUICK SELECT', enabled: true },
    { id: 'favorites', title: 'FAVORITES', enabled: true },
    { id: 'albums', title: 'ALBUMS', enabled: true },
    { id: 'playlists', title: 'PLAYLISTS', enabled: true }
];
let sectionConfig = [...DEFAULT_SECTIONS];
let tempSectionConfig = [];


const playBtn = document.getElementById("play");
const playIconEl = document.getElementById("play-icon");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const playerFavBtn = document.getElementById("player-fav-btn");
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
const playModeBtn = document.getElementById("play-mode-btn");
const playModeIcon = document.getElementById("play-mode-icon");
const playOrderBtn = document.getElementById("play-order-btn");
const playOrderIcon = document.getElementById("play-order-icon");
const playOrderContainer = document.getElementById("play-order-container");
const searchInput = document.getElementById("search-input");
const headerLogoBtn = document.getElementById("header-logo-btn");

const albumView = document.getElementById("album-view");
const songListView = document.getElementById("song-list-view");
const mainSectionsContainer = document.getElementById("main-sections-container");
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
const shareAlbumBtn = document.getElementById('share-album-btn');
const sharePlaylistBtn = document.getElementById('share-playlist-btn');
const deletePlaylistBtn = document.getElementById('delete-playlist-btn');

const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
const cancelAddToPlaylistBtn = document.getElementById('cancel-add-to-playlist-btn');
const modalPlaylistList = document.getElementById('modal-playlist-list');

const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

const manageSectionsBtn = document.getElementById('manage-sections-btn');
const manageSectionsModal = document.getElementById('manage-sections-modal');
const sectionConfigList = document.getElementById('section-config-list');
const saveSectionsBtn = document.getElementById('save-sections-btn');
const resetSectionsBtn = document.getElementById('reset-sections-btn');
const cancelSectionsBtn = document.getElementById('cancel-sections-btn');

const oreTooltip = document.getElementById('ore-tooltip');

let newPlaylistCover = null;
let playlistToDeleteId = null;
let modalSelectedSongIds = new Set();
let draggedItem = null;
let searchDebounceTimeout = null;

async function fetchAlbums() {
    try {
        const response = await fetch('albums.json');
        const defaultAlbums = await response.json();
        const visibleDefaultAlbums = defaultAlbums.filter(album => album.visible !== false);

        const allSongsPlaylist = {
            id: 'all-songs',
            title: 'All Songs',
            description: 'Every song available on MineTunes.',
            cover: 'album-images/album.png',
            songs: visibleSongs.map(s => s.id)
        };
        allAlbums = [allSongsPlaylist, ...visibleDefaultAlbums];
    } catch (error) {
        console.error("Could not fetch albums.json:", error);
        const allSongsPlaylist = {
            id: 'all-songs',
            title: 'All Songs',
            description: 'Every song available on MineTunes.',
            cover: 'app-assets/logo.png',
            songs: visibleSongs.map(s => s.id)
        };
        allAlbums = [allSongsPlaylist];
    }
}

function formatTime(sec, showHours = false) {
    if (!sec || isNaN(sec)) return "0:00";
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


function saveState() {
    localStorage.setItem('minetunesVolume', volumeSlider.value);
    localStorage.setItem('minetunesMode', playMode);
    localStorage.setItem('minetunesPlayOrder', playOrder);
    localStorage.setItem('minetunesUserPlaylists', JSON.stringify(userPlaylists));
    localStorage.setItem('minetunesCustomOrders', JSON.stringify(customAlbumOrders));
    localStorage.setItem('minetunesEnabledSongs', JSON.stringify(enabledSongs));
    if (currentPlaylistId) {
        localStorage.setItem('minetunesCurrentPlaylistId', currentPlaylistId);
    }
}

const PLAY_MODES = [
    { id: 'normal', name: 'Playlist once', icon: 'app-assets/mode_normal.png' },
    { id: 'play-one-stop', name: 'Play once', icon: 'app-assets/mode_once.png' },
    { id: 'repeat-one', name: 'Repeat the song', icon: 'app-assets/mode_repeat_one.png' },
    { id: 'repeat-all', name: 'Repeat playlist', icon: 'app-assets/mode_repeat_all.png' }
];

function updatePlayModeUI() {
    const currentModeObj = PLAY_MODES.find(m => m.id === playMode) || PLAY_MODES[0];
    if (playModeIcon) {
        playModeIcon.src = currentModeObj.icon;
        playModeIcon.alt = currentModeObj.name;
    }
    if (playModeBtn) {
        playModeBtn.title = currentModeObj.name;
    }
}

function updatePlayOrderUI() {
    const isRandom = playOrder === 'random';
    const title = isRandom ? "Play randomly" : "Play in order";
    const iconSrc = isRandom ? "app-assets/play_order_random.png" : "app-assets/play_order_sequential.png";
    if (playOrderIcon) {
        playOrderIcon.src = iconSrc;
        playOrderIcon.alt = title;
    }
    if (playOrderBtn) {
        playOrderBtn.title = title;
    }
}

function updateDocumentTitle() {
    if (isPlaying && currentSongIndex >= 0 && playlistData[currentSongIndex]) {
        const song = playlistData[currentSongIndex];
        document.title = `MineTunes - ${song.title}`;
    } else {
        document.title = "MineTunes — you craft, we play";
    }
}

function loadState() {
    const savedVolume = localStorage.getItem('minetunesVolume');
    if (savedVolume) volumeSlider.value = savedVolume;

    const savedMode = localStorage.getItem('minetunesMode');
    if (savedMode) {
        playMode = savedMode;
    }
    updatePlayModeUI();

    const savedPlayOrder = localStorage.getItem('minetunesPlayOrder');
    if (savedPlayOrder) {
        playOrder = savedPlayOrder;
    }
    updatePlayOrderUI();

    const savedPlaylists = localStorage.getItem('minetunesUserPlaylists');
    if (savedPlaylists) {
        try { userPlaylists = JSON.parse(savedPlaylists); } catch (e) { userPlaylists = []; }
    }

    const savedOrders = localStorage.getItem('minetunesCustomOrders');
    if (savedOrders) {
        try { customAlbumOrders = JSON.parse(savedOrders); } catch (e) { customAlbumOrders = {}; }
    }

    addToPlaylistBtn.classList.toggle('hidden', userPlaylists.length === 0);

    const savedEnabledJSON = localStorage.getItem('minetunesEnabledSongs');
    const savedEnabled = savedEnabledJSON ? JSON.parse(savedEnabledJSON) : {};
    visibleSongs.forEach(song => {
        enabledSongs[song.id] = savedEnabled[song.id] === false ? false : true;
    });

    loadFavorites();
    loadRecentlyPlayed();
    loadSectionConfig();

    return localStorage.getItem('minetunesCurrentPlaylistId');
}


function loadFavorites() {
    try {
        const saved = localStorage.getItem('minetunesFavorites');
        if (saved) {
            favorites = JSON.parse(saved);
            if (!Array.isArray(favorites.songs)) favorites.songs = [];
            if (!Array.isArray(favorites.albums)) favorites.albums = [];
        }
    } catch (e) {
        favorites = { songs: [], albums: [] };
    }
}

function saveFavorites() {
    localStorage.setItem('minetunesFavorites', JSON.stringify(favorites));
    updatePlayerFavBtn();
    if (currentView === 'albums') {
        renderMainSections(searchInput.value);
    } else if (currentPlaylistId === 'favorites') {
        openFavoritesView();
    }
}

function isFavoriteSong(songId) {
    return favorites.songs.includes(songId);
}

function isFavoriteAlbum(albumId) {
    return favorites.albums.includes(albumId);
}

function toggleFavoriteSong(songId, event) {
    if (event) event.stopPropagation();
    if (isFavoriteSong(songId)) {
        favorites.songs = favorites.songs.filter(id => id !== songId);
    } else {
        favorites.songs.push(songId);
    }
    saveFavorites();
}

function toggleFavoriteAlbum(albumId, event) {
    if (event) event.stopPropagation();
    if (albumId === 'all-songs' || albumId.startsWith('user-')) return; 
    if (isFavoriteAlbum(albumId)) {
        favorites.albums = favorites.albums.filter(id => id !== albumId);
    } else {
        favorites.albums.push(albumId);
    }
    saveFavorites();
}

function createFavButtonHtml(isFav, extraStyles = '') {
    return `<button class="control-btn fav-btn ${isFav ? 'is-fav' : ''}" style="${extraStyles}" title="Favorites"><img src="app-assets/${isFav ? 'liked_button.png' : 'unliked_button.png'}" class="pixel-icon fav-icon" alt="Fav"></button>`;
}

function updatePlayerFavBtn() {
    if (!playerFavBtn) return;
    const playerFavIcon = document.getElementById("player-fav-icon");
    const currentSong = playlistData[currentSongIndex];
    if (!currentSong) {
        playerFavBtn.classList.remove('is-fav');
        if (playerFavIcon) playerFavIcon.src = 'app-assets/unliked_button.png';
        return;
    }
    const isFav = isFavoriteSong(currentSong.id);
    playerFavBtn.classList.toggle('is-fav', isFav);
    if (playerFavIcon) playerFavIcon.src = isFav ? 'app-assets/liked_button.png' : 'app-assets/unliked_button.png';
}




function loadRecentlyPlayed() {
    try {
        const saved = localStorage.getItem('minetunesRecentlyPlayed');
        if (saved) recentlyPlayed = JSON.parse(saved);
    } catch (e) {
        recentlyPlayed = [];
    }
}

function addRecentlyPlayed(songId) {
    if (!songId) return;
    recentlyPlayed = recentlyPlayed.filter(id => id !== songId);
    recentlyPlayed.unshift(songId);
    if (recentlyPlayed.length > 6) {
        recentlyPlayed = recentlyPlayed.slice(0, 6);
    }
    localStorage.setItem('minetunesRecentlyPlayed', JSON.stringify(recentlyPlayed));
    if (currentView === 'albums' && !searchInput.value.trim()) {
        renderMainSections();
    }
}


function getEnglishSectionTitle(id) {
    switch (id) {
        case 'quick_select': return 'QUICK SELECT';
        case 'favorites': return 'FAVORITES';
        case 'albums': return 'ALBUMS';
        case 'playlists': return 'PLAYLISTS';
        default: return (id || '').toUpperCase();
    }
}

function loadSectionConfig() {
    try {
        const saved = localStorage.getItem('minetunesSectionConfig');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                sectionConfig = parsed.map(sec => ({
                    ...sec,
                    title: getEnglishSectionTitle(sec.id)
                }));
                return;
            }
        }
    } catch (e) {}
    sectionConfig = [...DEFAULT_SECTIONS];
}

function saveSectionConfig() {
    localStorage.setItem('minetunesSectionConfig', JSON.stringify(sectionConfig));
    renderMainSections(searchInput.value);
}


function showTooltip(title, text, x, y) {
    if (!oreTooltip) return;
    oreTooltip.innerHTML = `<div class="ore-tooltip-title">${title}</div><div>${text}</div>`;
    oreTooltip.classList.remove('hidden');
    oreTooltip.classList.add('visible');
    positionTooltip(x, y);
}

function positionTooltip(x, y) {
    if (!oreTooltip) return;
    const tooltipWidth = oreTooltip.offsetWidth || 220;
    const tooltipHeight = oreTooltip.offsetHeight || 60;
    let left = x + 14;
    let top = y + 14;

    if (left + tooltipWidth > window.innerWidth - 10) {
        left = x - tooltipWidth - 14;
    }
    if (top + tooltipHeight > window.innerHeight - 10) {
        top = y - tooltipHeight - 14;
    }
    oreTooltip.style.left = `${Math.max(10, left)}px`;
    oreTooltip.style.top = `${Math.max(10, top)}px`;
}

function hideTooltip() {
    if (!oreTooltip) return;
    oreTooltip.classList.remove('visible');
    oreTooltip.classList.add('hidden');
}


function renderMainSections(filter = '') {
    if (!mainSectionsContainer) return;
    mainSectionsContainer.innerHTML = '';
    const lowercasedFilter = filter.toLowerCase().trim();

    
    if (lowercasedFilter) {
        renderSearchResults(lowercasedFilter);
        return;
    }

    
    sectionConfig.forEach(sec => {
        if (!sec.enabled) return;

        if (sec.id === 'quick_select') {
            renderQuickSelectSection();
        } else if (sec.id === 'favorites') {
            renderFavoritesSection();
        } else if (sec.id === 'albums') {
            renderAlbumsSection();
        } else if (sec.id === 'playlists') {
            renderPlaylistsSection();
        }
    });
}


function renderQuickSelectSection() {
    const section = document.createElement('div');
    section.className = 'main-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<div class="section-header-title">QUICK SELECT</div>`;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'quick-select-grid';

    
    const allSongsAlbum = allAlbums.find(a => a.id === 'all-songs');
    if (allSongsAlbum) {
        const card1 = document.createElement('div');
        card1.className = 'quick-card';
        card1.innerHTML = `
            <img src="${allSongsAlbum.cover}" class="quick-card-img" alt="All Songs">
            <div class="quick-card-info">
                <div class="quick-card-title">All Songs</div>
                <div class="quick-card-sub">${allSongsAlbum.songs.length} songs</div>
            </div>
        `;
        card1.onclick = () => openPlaylist('all-songs');
        grid.appendChild(card1);
    }

    
    const card2 = document.createElement('div');
    card2.className = 'quick-card random-card';
    card2.innerHTML = `
        <img src="app-assets/logo.png" class="quick-card-img" alt="Random">
        <div class="quick-card-info">
            <div class="quick-card-title">Play Random Songs</div>
            <div class="quick-card-sub">Play random music</div>
        </div>
    `;
    card2.onclick = () => playRandomSong();
    grid.appendChild(card2);

    
    const validRecentlyPlayed = recentlyPlayed.map(id => songMap.get(id)).filter(Boolean);
    validRecentlyPlayed.slice(0, 6).forEach(song => {
        const card = document.createElement('div');
        card.className = 'quick-card';
        card.innerHTML = `
            <img src="${song.cover}" class="quick-card-img" alt="${song.title}">
            <div class="quick-card-info">
                <div class="quick-card-title">${song.title}</div>
                <div class="quick-card-sub">${song.artist}</div>
            </div>
        `;
        card.onclick = () => playSongFromAnywhere(song);
        grid.appendChild(card);
    });

    section.appendChild(grid);
    mainSectionsContainer.appendChild(section);
}


function renderFavoritesSection() {
    const favSongObjs = favorites.songs.map(id => songMap.get(id)).filter(Boolean);
    const allPlaylists = [...allAlbums, ...userPlaylists];
    const favAlbumObjs = favorites.albums.map(id => allPlaylists.find(a => a.id === id)).filter(Boolean);

    if (favSongObjs.length === 0 && favAlbumObjs.length === 0) {
        return; 
    }

    const section = document.createElement('div');
    section.className = 'main-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<div class="section-header-title">FAVORITES</div>`;
    section.appendChild(header);

    const bannerCard = document.createElement('div');
    bannerCard.className = 'favorites-banner-card';
    bannerCard.innerHTML = `
        <div class="favorites-banner-left">
            <div class="favorites-banner-info">
                <div class="favorites-banner-title">FAVORITES</div>
                <div class="favorites-banner-sub">${favSongObjs.length} favorite songs • ${favAlbumObjs.length} favorite albums</div>
            </div>
        </div>
        <button class="favorites-view-btn">View Favorites ►</button>
    `;

    bannerCard.onclick = () => openFavoritesView();

    section.appendChild(bannerCard);
    mainSectionsContainer.appendChild(section);
}


function openFavoritesView() {
    const favSongObjs = favorites.songs.map(id => songMap.get(id)).filter(Boolean);
    const allPlaylists = [...allAlbums, ...userPlaylists];
    const favAlbumObjs = favorites.albums.map(id => allPlaylists.find(a => a.id === id)).filter(Boolean);

    currentPlaylistId = 'favorites';
    playlistData = favSongObjs;

    const totalDuration = favSongObjs.reduce((acc, s) => acc + (s.duration || 0), 0);
    playlistDurationEl.textContent = `${favSongObjs.length} songs • ${favAlbumObjs.length} albums • Total duration: ${formatTime(totalDuration, true)}`;

    deletePlaylistBtn.classList.add('hidden');
    sharePlaylistBtn.classList.add('hidden');
    shareAlbumBtn.classList.add('hidden');

    playlistEl.innerHTML = '';

    
    if (favAlbumObjs.length > 0) {
        const albumsHeading = document.createElement('h3');
        albumsHeading.className = 'fav-view-heading';
        albumsHeading.textContent = `FAVORITE ALBUMS (${favAlbumObjs.length})`;
        playlistEl.appendChild(albumsHeading);

        const albumsGrid = document.createElement('div');
        albumsGrid.className = 'quick-select-grid';
        albumsGrid.style.marginBottom = '25px';

        favAlbumObjs.forEach(playlist => {
            const tile = createAlbumTileElement(playlist, true);
            albumsGrid.appendChild(tile);
        });
        playlistEl.appendChild(albumsGrid);
    }

  
    if (favSongObjs.length > 0) {
        const songsHeading = document.createElement('h3');
        songsHeading.className = 'fav-view-heading';
        songsHeading.textContent = `FAVORITE SONGS (${favSongObjs.length})`;
        playlistEl.appendChild(songsHeading);

        favSongObjs.forEach((song, idx) => {
            const item = document.createElement("div");
            item.classList.add("song-item");
            item.dataset.id = song.id;

            const leftWrapper = document.createElement('div');
            leftWrapper.style.cssText = 'display: flex; align-items: center; flex-grow: 1; min-width: 0;';

            const imgCover = document.createElement('img');
            imgCover.src = song.cover;
            imgCover.style.cssText = 'width: 38px; height: 38px; border: 2px solid #1e1e1e; image-rendering: pixelated; margin-right: 10px; flex-shrink: 0;';

            const content = document.createElement("div");
            content.classList.add("song-item-content");
            const details = document.createElement("div");
            details.classList.add("song-item-details");
            details.textContent = `${song.title} - ${song.artist}`;

            content.appendChild(details);
            leftWrapper.appendChild(imgCover);
            leftWrapper.appendChild(content);
            item.appendChild(leftWrapper);

            
            const favBtn = document.createElement('button');
            favBtn.className = 'control-btn fav-btn is-fav';
            favBtn.style.cssText = 'min-width:30px;min-height:30px;padding:2px 6px;margin-right:8px;';
            favBtn.title = "Favorites";
            favBtn.innerHTML = `<img src="app-assets/liked_button.png" class="pixel-icon fav-icon" alt="Fav">`;
            favBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavoriteSong(song.id, e);
                openFavoritesView();
            };
            item.appendChild(favBtn);

            const durationSpan = document.createElement('span');
            durationSpan.className = 'song-item-duration';
            durationSpan.textContent = formatTime(song.duration);
            item.appendChild(durationSpan);

            item.onclick = (e) => {
                if (!e.target.closest('.fav-btn')) {
                    playSongFromAnywhere(song);
                }
            };

            playlistEl.appendChild(item);
        });
    }

    if (favSongObjs.length === 0 && favAlbumObjs.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = 'color: #b1b3b5; padding: 30px; text-align: center; font-size: 16px;';
        emptyMsg.textContent = 'No favorites added yet. Click the favorite button on any song or album to add it here!';
        playlistEl.appendChild(emptyMsg);
    }

    switchView('songs');
}


function renderAlbumsSection() {
    const section = document.createElement('div');
    section.className = 'main-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<div class="section-header-title">ALBUMS</div>`;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'quick-select-grid';

    
    const officialAlbums = allAlbums.filter(a => a.id !== 'all-songs');

    officialAlbums.forEach(playlist => {
        const tile = createAlbumTileElement(playlist, true);
        grid.appendChild(tile);
    });

    section.appendChild(grid);
    mainSectionsContainer.appendChild(section);
}


function renderPlaylistsSection() {
    if (userPlaylists.length === 0) return; 

    const section = document.createElement('div');
    section.className = 'main-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<div class="section-header-title">PLAYLISTS</div>`;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'quick-select-grid';

    userPlaylists.forEach(playlist => {
        const tile = createAlbumTileElement(playlist, false); 
        grid.appendChild(tile);
    });

    section.appendChild(grid);
    mainSectionsContainer.appendChild(section);
}


function createAlbumTileElement(playlist, allowFavorite = true) {
    const tile = document.createElement('div');
    tile.className = 'album-tile';
    tile.dataset.id = playlist.id;

    const isUserPlaylist = playlist.id.startsWith('user-');
    const isAllSongs = playlist.id === 'all-songs';
    const songIdOrder = isUserPlaylist ? playlist.songs : (customAlbumOrders[playlist.id] || playlist.songs);
    const songObjects = songIdOrder.map(id => songMap.get(id)).filter(Boolean);
    const totalDuration = songObjects.reduce((acc, song) => acc + (song.duration || 0), 0);

    const artistList = [...new Set(songObjects.map(s => s.artist))];
    const fullArtists = artistList.join(', ');

    const songCount = songObjects.length;
    const isFav = isFavoriteAlbum(playlist.id);

    
    const canFav = allowFavorite && !isUserPlaylist && !isAllSongs;

    const favButtonHtml = canFav 
        ? `<button class="album-tile-fav-btn ${isFav ? 'is-fav' : ''}" title="Favorites"><img src="app-assets/${isFav ? 'liked_button.png' : 'unliked_button.png'}" class="pixel-icon fav-icon" alt="Fav"></button>` 
        : '';

    tile.innerHTML = `
        ${favButtonHtml}
        <img src="${playlist.cover}" alt="${playlist.title}">
        <div class="album-tile-info">
            <div class="album-tile-title">${playlist.title}</div>
            <div class="album-tile-desc">${playlist.description}</div>
            <div class="album-tile-stats">
                <span>${songCount} songs</span>
                <span>Total time: ${formatTime(totalDuration, true)}</span>
            </div>
            <div class="album-tile-artists" data-full-artists="${fullArtists}">${fullArtists}</div>
        </div>
    `;

    tile.addEventListener('click', (e) => {
        if (e.target.closest('.album-tile-fav-btn')) {
            toggleFavoriteAlbum(playlist.id, e);
        } else {
            openPlaylist(playlist.id);
        }
    });

    return tile;
}


function renderSearchResults(filterQuery) {
    const section = document.createElement('div');
    section.className = 'search-results-section';

    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.textContent = `Search results for: "${filterQuery}"`;
    section.appendChild(header);

    
    const matchingSongs = visibleSongs.filter(song => 
        song.title.toLowerCase().includes(filterQuery) ||
        song.artist.toLowerCase().includes(filterQuery) ||
        (song.version && song.version.toLowerCase().includes(filterQuery)) ||
        song.genre.some(g => g.toLowerCase().includes(filterQuery))
    );

    if (matchingSongs.length > 0) {
        const songsListHeader = document.createElement('h3');
        songsListHeader.style.cssText = 'color: #e7e8eb; margin-bottom: 10px; font-size: 18px;';
        songsListHeader.textContent = `Songs (${matchingSongs.length})`;
        section.appendChild(songsListHeader);

        const songsList = document.createElement('div');
        songsList.className = 'search-songs-list';

        matchingSongs.forEach(song => {
            const isFav = isFavoriteSong(song.id);
            const row = document.createElement('div');
            row.className = 'search-song-item';
            row.innerHTML = `
                <div class="search-song-left">
                    <img src="${song.cover}" class="search-song-cover" alt="${song.title}">
                    <div class="search-song-info">
                        <div class="search-song-title">${song.title}</div>
                        <div class="search-song-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="search-song-right">
                    <button class="control-btn fav-btn ${isFav ? 'is-fav' : ''}" style="min-width:32px;min-height:32px;padding:2px 8px;" title="Favorites"><img src="app-assets/${isFav ? 'liked_button.png' : 'unliked_button.png'}" class="pixel-icon fav-icon" alt="Fav"></button>
                    <span class="search-song-duration">${formatTime(song.duration)}</span>
                </div>
            `;

            row.onclick = (e) => {
                const favBtn = e.target.closest('.fav-btn');
                if (favBtn) {
                    toggleFavoriteSong(song.id, e);
                } else {
                    playSongFromAnywhere(song);
                }
            };
            songsList.appendChild(row);
        });
        section.appendChild(songsList);
    }

    
    const allPlaylists = [...allAlbums.filter(a => a.id !== 'all-songs'), ...userPlaylists];
    const matchingPlaylists = allPlaylists.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(filterQuery);
        const descMatch = p.description.toLowerCase().includes(filterQuery);
        return titleMatch || descMatch;
    });

    if (matchingPlaylists.length > 0) {
        const playlistsHeader = document.createElement('h3');
        playlistsHeader.style.cssText = 'color: #e7e8eb; margin-top: 15px; margin-bottom: 10px; font-size: 18px;';
        playlistsHeader.textContent = `Albums & Playlists (${matchingPlaylists.length})`;
        section.appendChild(playlistsHeader);

        const grid = document.createElement('div');
        grid.className = 'quick-select-grid';

        matchingPlaylists.forEach(playlist => {
            const tile = createAlbumTileElement(playlist, !playlist.id.startsWith('user-'));
            grid.appendChild(tile);
        });

        section.appendChild(grid);
    }

    if (matchingSongs.length === 0 && matchingPlaylists.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.cssText = 'color: #b1b3b5; padding: 20px 0; text-align: center;';
        noResults.textContent = 'No matching results found.';
        section.appendChild(noResults);
    }

    mainSectionsContainer.appendChild(section);
}


function playRandomSong() {
    const enabledList = visibleSongs.filter(s => enabledSongs[s.id] !== false);
    if (enabledList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * enabledList.length);
    const randomSong = enabledList[randomIndex];
    playSongFromAnywhere(randomSong);
}


function playSongFromAnywhere(song) {
    if (!song) return;
    playlistData = visibleSongs; 
    currentPlaylistId = 'all-songs';
    saveState();
    
    const index = playlistData.findIndex(s => s.id === song.id);
    if (index !== -1) {
        playSong(index);
    }
}

function openPlaylist(playlistId) {
    const allPlaylists = [...allAlbums, ...userPlaylists];
    const playlist = allPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const playingSongId = (sound && playlistData && playlistData.length > 0 && currentSongIndex >= 0)
        ? playlistData[currentSongIndex].id
        : null;

    currentPlaylistId = playlist.id;
    sessionStorage.setItem('minetunesActivePlaylist', playlist.id);
    saveState();

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

    playlistData = songIdOrder.map(id => songMap.get(id)).filter(Boolean);
    
    const totalDuration = playlistData.reduce((acc, song) => acc + (song.duration || 0), 0);
    const songCount = playlistData.length;

    playlistDurationEl.textContent = `${songCount} songs • Total duration: ${formatTime(totalDuration, true)}`;
    deletePlaylistBtn.classList.toggle('hidden', !isUserPlaylist);
    sharePlaylistBtn.classList.toggle('hidden', !isUserPlaylist);
    shareAlbumBtn.classList.toggle('hidden', isUserPlaylist);
    
    renderPlaylist();
    switchView('songs');

    const newIndex = playingSongId ? playlistData.findIndex(s => s.id === playingSongId) : -1;
    currentSongIndex = newIndex; 
    updateActiveSongUI(); 

    if (playlistData.length > 0 && !sound) {
        loadSong(0, false);
    } else if (playlistData.length === 0) {
        loadSong(-1);
    }
}

function switchView(view) {
    currentView = view;
    if (view === 'albums') {
        currentPlaylistId = null;
        sessionStorage.removeItem('minetunesActivePlaylist');
        albumView.classList.remove('hidden');
        songListView.classList.add('hidden');
        renderMainSections(searchInput.value);
        
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } else {
        albumView.classList.add('hidden'); 
        songListView.classList.remove('hidden');
    }
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
        checkbox.checked = enabledSongs[song.id] !== false;
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

        
        const isFav = isFavoriteSong(song.id);
        const favBtn = document.createElement('button');
        favBtn.className = `control-btn fav-btn ${isFav ? 'is-fav' : ''}`;
        favBtn.style.cssText = 'min-width:30px;min-height:30px;padding:2px 6px;margin-right:8px;';
        favBtn.title = "Favorites";
        favBtn.innerHTML = `<img src="app-assets/${isFav ? 'liked_button.png' : 'unliked_button.png'}" class="pixel-icon fav-icon" alt="Fav">`;
        favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFavoriteSong(song.id, e);
            renderPlaylist(filter);
        };
        item.appendChild(favBtn);

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
            if (e.target.type !== 'checkbox' && !e.target.classList.contains('remove-song-btn') && !e.target.closest('.fav-btn')) {
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
    updatePlayerFavBtn();
}

function updatePlayBtnIcon() {
    if (playIconEl) {
        playIconEl.src = isPlaying ? "app-assets/pauze_button.png" : "app-assets/play_button.png";
    }
    updateDocumentTitle();
}

function loadSong(index, shouldPlay = false) {
    if (sound) {
        sound.stop();
        sound.unload();
    }
    if (index < 0 || index >= playlistData.length) {
        titleEl.textContent = "Playlist is empty";
        artistEl.textContent = "";
        coverEl.src = "app-assets/logo.png";
        genreEl.innerHTML = '';
        durationEl.textContent = "0:00";
        currentTimeEl.textContent = "0:00";
        progress.value = 0;
        sound = null;
        isPlaying = false;
        updatePlayBtnIcon();
        updatePlayerFavBtn();
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
    addRecentlyPlayed(song.id);
    localStorage.setItem('minetunesLastPlayedSong', song.id);
    
    sound = new Howl({
        src: [song.src],
        html5: true,
        volume: volumeSlider.value,
        onend: handleSongEnd,
        onload: () => {
            durationEl.textContent = formatTime(sound.duration());
            if (!isPlaying) {
                currentTimeEl.textContent = "0:00";
                progress.value = 0;
            }
        }
    });

    if (shouldPlay) {
        sound.play();
        isPlaying = true;
        updatePlayBtnIcon();
        requestAnimationFrame(updateProgress);
    } else {
        isPlaying = false;
        updatePlayBtnIcon();
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
        updatePlayBtnIcon();
    } else {
        sound.play();
        isPlaying = true;
        updatePlayBtnIcon();
        requestAnimationFrame(updateProgress);
    }
}

function findNextEnabledSong(direction = 1) {
    const enabledIndexes = playlistData
        .map((song, index) => enabledSongs[song.id] !== false ? index : -1)
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
        updatePlayBtnIcon();
        return;
    }

    const nextIndex = findNextEnabledSong(1);
    
    if (nextIndex === -1) {
        isPlaying = false;
        updatePlayBtnIcon();
        return;
    }

    if (playMode === "repeat-all") {
        playSong(nextIndex);
    } else if (playMode === "normal") {
        const enabledIndices = playlistData.map((s, i) => enabledSongs[s.id] !== false ? i : -1).filter(i => i !== -1);
        const lastEnabledIndex = enabledIndices[enabledIndices.length - 1];

        if (playOrder === 'sequential' && currentSongIndex === lastEnabledIndex) {
            isPlaying = false;
            updatePlayBtnIcon();
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
    const isEnabled = (playMode === 'normal' || playMode === 'repeat-all');
    if (playOrderBtn) {
        playOrderBtn.disabled = !isEnabled;
        playOrderBtn.style.opacity = isEnabled ? '1' : '0.4';
        playOrderBtn.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
    }
    if (playOrderContainer) {
        playOrderContainer.classList.remove('hidden');
    }
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
    manageSectionsModal.classList.add('hidden');
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
        cover: newPlaylistCover || 'app-assets/logo.png',
        songs: selectedSongIds
    };
    userPlaylists.push(newPlaylist);
    saveState();
    renderMainSections(searchInput.value);
    closeModals();
    addToPlaylistBtn.classList.remove('hidden');
}


function openManageSectionsModal() {
    tempSectionConfig = JSON.parse(JSON.stringify(sectionConfig));
    renderSectionConfigModal();
    modalBackdrop.classList.remove('hidden');
    manageSectionsModal.classList.remove('hidden');
}

function renderSectionConfigModal() {
    sectionConfigList.innerHTML = '';
    const enabledCount = tempSectionConfig.filter(s => s.enabled).length;

    tempSectionConfig.forEach((sec, idx) => {
        const item = document.createElement('div');
        item.className = 'section-config-item';
        item.innerHTML = `
            <label class="section-config-label">
                <input type="checkbox" ${sec.enabled ? 'checked' : ''} data-idx="${idx}" class="section-enable-checkbox" ${sec.enabled && enabledCount <= 1 ? 'disabled' : ''}>
                <span>${sec.title}</span>
            </label>
            <div class="section-config-actions">
                <button data-action="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button data-action="down" data-idx="${idx}" ${idx === tempSectionConfig.length - 1 ? 'disabled' : ''}>▼</button>
            </div>
        `;
        sectionConfigList.appendChild(item);
    });
}

sectionConfigList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (btn) {
        const idx = parseInt(btn.dataset.idx);
        const action = btn.dataset.action;
        if (action === 'up' && idx > 0) {
            const temp = tempSectionConfig[idx];
            tempSectionConfig[idx] = tempSectionConfig[idx - 1];
            tempSectionConfig[idx - 1] = temp;
            renderSectionConfigModal();
        } else if (action === 'down' && idx < tempSectionConfig.length - 1) {
            const temp = tempSectionConfig[idx];
            tempSectionConfig[idx] = tempSectionConfig[idx + 1];
            tempSectionConfig[idx + 1] = temp;
            renderSectionConfigModal();
        }
    }
});

sectionConfigList.addEventListener('change', (e) => {
    if (e.target.classList.contains('section-enable-checkbox')) {
        const idx = parseInt(e.target.dataset.idx);
        const enabledCount = tempSectionConfig.filter(s => s.enabled).length;
        
        if (!e.target.checked && enabledCount <= 1) {
            e.target.checked = true;
            alert("At least one section must remain visible!");
            return;
        }
        tempSectionConfig[idx].enabled = e.target.checked;
        renderSectionConfigModal();
    }
});

saveSectionsBtn.addEventListener('click', () => {
    if (!tempSectionConfig.some(s => s.enabled)) {
        alert("At least one section must remain visible!");
        return;
    }
    sectionConfig = tempSectionConfig;
    saveSectionConfig();
    closeModals();
});

resetSectionsBtn.addEventListener('click', () => {
    tempSectionConfig = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    renderSectionConfigModal();
});

cancelSectionsBtn.addEventListener('click', closeModals);
manageSectionsBtn.addEventListener('click', openManageSectionsModal);

function handlePlaylistImport() {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistDataParam = urlParams.get('playlist');
    if (playlistDataParam) {
        try {
            const decoded = atob(playlistDataParam);
            const importedPlaylist = JSON.parse(decoded);
            const newPlaylist = {
                id: `user-${Date.now()}`,
                title: importedPlaylist.title,
                description: importedPlaylist.description,
                cover: 'app-assets/logo.png',
                songs: importedPlaylist.songs.filter(id => songMap.has(id))
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
                renderMainSections();
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


mainSectionsContainer.addEventListener('mouseover', (e) => {
    const targetWithArtists = e.target.closest('.album-tile-artists, [data-full-artists]');
    if (targetWithArtists) {
        const fullArtists = targetWithArtists.dataset.fullArtists;
        if (fullArtists && fullArtists.trim()) {
            const card = targetWithArtists.closest('.album-tile, .quick-card');
            const titleEl = card ? card.querySelector('.album-tile-title, .quick-card-title') : null;
            const titleText = titleEl ? titleEl.textContent : 'Artists';
            showTooltip(titleText, `Artists: ${fullArtists}`, e.clientX, e.clientY);
        }
    }
});

mainSectionsContainer.addEventListener('mousemove', (e) => {
    if (oreTooltip && oreTooltip.classList.contains('visible')) {
        positionTooltip(e.clientX, e.clientY);
    }
});

mainSectionsContainer.addEventListener('mouseout', (e) => {
    const targetWithArtists = e.target.closest('.album-tile-artists, [data-full-artists]');
    if (targetWithArtists) {
        hideTooltip();
    }
});

async function init() {
    await fetchAlbums();
    const savedPlaylistId = loadState();
    handlePlaylistImport();

    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('album');
    const songId = urlParams.get('song');

    
    playlistData = visibleSongs;
    const lastPlayedId = localStorage.getItem('minetunesLastPlayedSong') || (recentlyPlayed.length > 0 ? recentlyPlayed[0] : null);
    let initialIndex = 0;
    if (lastPlayedId) {
        const idx = playlistData.findIndex(s => s.id === lastPlayedId);
        if (idx !== -1) initialIndex = idx;
    }

    const navEntries = (performance.getEntriesByType && performance.getEntriesByType('navigation')) || [];
    const isReload = (navEntries.length > 0 && navEntries[0].type === 'reload') || performance.navigation?.type === 1;
    const activePlaylistId = sessionStorage.getItem('minetunesActivePlaylist');

    if (albumId) {
        openPlaylist(albumId);
    } else if (songId && !urlParams.has('playlist')) {
        openPlaylist('all-songs');
        const songIndex = playlistData.findIndex(s => s.id === songId);
        if (songIndex !== -1) {
            playSong(songIndex);
        }
    } else if (isReload && activePlaylistId) {
        openPlaylist(activePlaylistId);
    } else {
        sessionStorage.removeItem('minetunesActivePlaylist');
        loadSong(initialIndex, false);
        switchView('albums');
    }
    
    togglePlayOrderVisibility();

    
    if (headerLogoBtn) {
        headerLogoBtn.addEventListener('click', () => {
            searchInput.value = '';
            switchView('albums');
            renderMainSections('');
        });
    }

    playBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", prevSong);
    nextBtn.addEventListener("click", nextSong);
    playerFavBtn.addEventListener("click", (e) => {
        const currentSong = playlistData[currentSongIndex];
        if (currentSong) {
            toggleFavoriteSong(currentSong.id, e);
        }
    });

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
            shareBtn.textContent = 'Copied';
            setTimeout(() => { shareBtn.textContent = originalText; }, 1500);
        });
    });
    
    shareAlbumBtn.addEventListener('click', () => {
        if (!currentPlaylistId) return;
        const url = `${window.location.origin}${window.location.pathname}?album=${currentPlaylistId}`;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = shareAlbumBtn.textContent;
            shareAlbumBtn.textContent = 'Copied';
            setTimeout(() => { shareAlbumBtn.textContent = originalText; }, 1500);
        });
    });

    sharePlaylistBtn.addEventListener('click', () => {
        const playlist = userPlaylists.find(p => p.id === currentPlaylistId);
        if (!playlist) return;
        const shareable = { title: playlist.title, description: playlist.description, songs: playlist.songs };
        const encoded = btoa(JSON.stringify(shareable));
        const url = `${window.location.origin}${window.location.pathname}?playlist=${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = sharePlaylistBtn.textContent;
            sharePlaylistBtn.textContent = 'Copied';
            setTimeout(() => { sharePlaylistBtn.textContent = originalText; }, 1500);
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
        if (localStorage.getItem('minetunesCurrentPlaylistId') === playlistToDeleteId) {
            localStorage.removeItem('minetunesCurrentPlaylistId');
            currentPlaylistId = 'all-songs';
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
                if (!p.songs.includes(songId)) {
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

    if (playModeBtn) {
        playModeBtn.addEventListener("click", () => {
            const currentIndex = PLAY_MODES.findIndex(m => m.id === playMode);
            const nextIndex = (currentIndex + 1) % PLAY_MODES.length;
            playMode = PLAY_MODES[nextIndex].id;
            updatePlayModeUI();
            togglePlayOrderVisibility();
            saveState();
        });
    }

    if (playOrderBtn) {
        playOrderBtn.addEventListener("click", () => {
            if (playOrderBtn.disabled) return;
            playOrder = (playOrder === 'sequential') ? 'random' : 'sequential';
            updatePlayOrderUI();
            saveState();
        });
    }

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            if (currentView === 'albums') {
                renderMainSections(e.target.value);
            } else {
                renderPlaylist(e.target.value);
            }
        }, 120);
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
        playlistData = newSongIds.map(id => songMap.get(id)).filter(Boolean);
        renderPlaylist();
        updateCurrentSongIndexAfterReorder(playingSongId);
    });
}

init();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            reg.update();
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                if (installingWorker) {
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New content available, Service Worker updated.');
                        }
                    };
                }
            };
        }).catch(err => {
            console.error('Service Worker registration failed:', err);
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

