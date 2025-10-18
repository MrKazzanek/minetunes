let playlistData = [...songs];
let currentSongIndex = 0;
let sound;
let isPlaying = false;
let playMode = "normal";
let enabledSongs = {};


const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const coverEl = document.getElementById("cover");
const playlistEl = document.getElementById("playlist");
const volumeSlider = document.getElementById("volume");
const modeSelect = document.getElementById("mode");


function saveState() {
    const songOrder = playlistData.map(song => song.id);
    localStorage.setItem('jukeboxedVolume', volumeSlider.value);
    localStorage.setItem('jukeboxedMode', playMode);
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


    const savedOrderJSON = localStorage.getItem('jukeboxedSongOrder');
    if (savedOrderJSON) {
        const savedOrder = JSON.parse(savedOrderJSON);
        const validSongsInOrder = savedOrder.map(id => songs.find(s => s.id === id)).filter(Boolean);
        const remainingSongs = songs.filter(s => !savedOrder.includes(s.id));
        playlistData = [...validSongsInOrder, ...remainingSongs];
    }


    const savedEnabledJSON = localStorage.getItem('jukeboxedEnabledSongs');
    const savedEnabled = savedEnabledJSON ? JSON.parse(savedEnabledJSON) : {};
    playlistData.forEach(song => {
        enabledSongs[song.id] = savedEnabled[song.id] === false ? false : true;
    });
}



function renderPlaylist() {
    playlistEl.innerHTML = '';
    playlistData.forEach((song, index) => {
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
        });

        const details = document.createElement("div");
        details.classList.add("song-item-details");
        details.textContent = `${song.title} - ${song.artist}`;

        item.appendChild(checkbox);
        item.appendChild(details);

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
        playBtn.textContent = "⏸";
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
        playSong(currentSongIndex);
    } else if (isPlaying) {
        sound.pause();
        isPlaying = false;
        playBtn.textContent = "►";
    } else {
        sound.play();
        isPlaying = true;
        playBtn.textContent = "⏸";
        requestAnimationFrame(updateProgress);
    }
}

function findNextEnabledSong(direction = 1) {
    const totalSongs = playlistData.length;
    if (totalSongs === 0 || playlistData.every(song => !enabledSongs[song.id])) {
        return -1;
    }

    let nextIndex = currentSongIndex;
    for (let i = 0; i < totalSongs; i++) {
        nextIndex = (nextIndex + direction + totalSongs) % totalSongs;
        if (enabledSongs[playlistData[nextIndex].id]) {
            return nextIndex;
        }
    }
    return -1;
}


function prevSong() {
    const prevIndex = findNextEnabledSong(-1);
    if (prevIndex !== -1) {
        playSong(prevIndex);
    }
}

function nextSong() {
    const nextIndex = findNextEnabledSong(1);
    if (nextIndex !== -1) {
        playSong(nextIndex);
    }
}

function handleSongEnd() {
    const nextIndex = findNextEnabledSong(1);

    if (playMode === "repeat-one") {
        playSong(currentSongIndex);
    } else if (playMode === "repeat-all") {
        if (nextIndex !== -1) playSong(nextIndex);
    } else if (playMode === "normal") {
        if (nextIndex !== -1 && nextIndex > currentSongIndex) {
            playSong(nextIndex);
        } else {
            isPlaying = false;
            playBtn.textContent = "►";
        }
    } else if (playMode === "play-one-stop") {
        isPlaying = false;
        playBtn.textContent = "►";
    }
}



function updateProgress() {

    if (!sound || !isPlaying) {
        return;
    }


    const seek = sound.seek() || 0;
    progress.value = sound.duration() ? (seek / sound.duration()) * 100 : 0;
    currentTimeEl.textContent = formatTime(seek);


    requestAnimationFrame(updateProgress);
}


progress.addEventListener("input", () => {
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



function init() {
    loadState();
    renderPlaylist();
    loadSong(currentSongIndex, false);

    playBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", prevSong);
    nextBtn.addEventListener("click", nextSong);

    volumeSlider.addEventListener("input", () => {
        if (sound) sound.volume(volumeSlider.value);
        saveState();
    });

    modeSelect.addEventListener("change", e => {
        playMode = e.target.value;
        saveState();
    });
}

init();