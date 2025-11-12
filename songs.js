const songs = [
    {
        id: "lena_raine-otherside",
        title: "Otherside",
        artist: "Lena Raine",
        src: "music/otherside.mp3",
        cover: "images/otherside.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.18",
        duration: 195
    },
    {
        id: "lena_raine-pigstep",
        title: "Pigstep",
        artist: "Lena Raine",
        src: "music/pigstep.mp3",
        cover: "images/pigstep.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.16",
        duration: 149
    },
    {
        id: "aaron_cherof-relic",
        title: "Relic",
        artist: "Aaron Cherof",
        src: "music/relic.mp3",
        cover: "images/relic.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.20",
        duration: 219
    },
    {
        id: "c418-13",
        title: "13",
        artist: "C418",
        src: "music/Thirteen.mp3",
        cover: "images/thirteen.jpg",
        genre: [
            "Music Disc"
        ],
        version: "Alpha 1.0.14",
        duration: 176
    },
    {
        id: "c418-cat",
        title: "Cat",
        artist: "C418",
        src: "music/Cat.mp3",
        cover: "images/thirteen.jpg",
        genre: [
            "Music Disc"
        ],
        version: "Alpha 1.0.14",
        duration: 186
    },
    {
        id: "c418-blocks",
        title: "Blocks",
        artist: "C418",
        src: "music/Blocks.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 343
    },
    {
        id: "c418-chirp",
        title: "Chirp",
        artist: "C418",
        src: "music/Chirp.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 187
    },
    {
        id: "c418-far",
        title: "Far",
        artist: "C418",
        src: "music/Far.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 191
    },
    {
        id: "c418-mall",
        title: "Mall",
        artist: "C418",
        src: "music/Mall.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 197
    },
    {
        id: "c418-mellohi",
        title: "Mellohi",
        artist: "C418",
        src: "music/Mellohi.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 98
    },
    {
        id: "c418-stal",
        title: "Stal",
        artist: "C418",
        src: "music/Stal.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 151
    },
    {
        id: "c418-strad",
        title: "Strad",
        artist: "C418",
        src: "music/Strad.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 188
    },
    {
        id: "c418-ward",
        title: "Ward",
        artist: "C418",
        src: "music/Ward.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 249
    },
    {
        id: "c418-11",
        title: "11",
        artist: "C418",
        src: "music/11.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.0.0",
        duration: 72
    },
    {
        id: "lena_raine-creator-music-box",
        title: "Creator (Music Box)",
        artist: "Lena Raine",
        src: "music/Creator-Music-Box.mp3",
        cover: "images/tricky.png",
        genre: [
            "Music Disc"
        ],
        version: "1.21",
        duration: 74
    },
    {
        id: "c418-wait",
        title: "Wait",
        artist: "C418",
        src: "music/Wait.mp3",
        cover: "images/miniaturka_r87ECi9RR_M.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.4.4",
        duration: 234
    },
    {
        id: "lena_raine-creator",
        title: "Creator",
        artist: "Lena Raine",
        src: "music/Creator.mp3",
        cover: "images/tricky.png",
        genre: [
            "Music Disc"
        ],
        version: "1.21",
        duration: 177
    },
    {
        id: "aaron_cherof-precipice",
        title: "Precipice",
        artist: "Aaron Cherof",
        src: "music/Precipice.mp3",
        cover: "images/tricky.png",
        genre: [
            "Music Disc"
        ],
        version: "1.21",
        duration: 299
    },
    {
        id: "samuel_aberg-5",
        title: "5",
        artist: "Samuel Åberg",
        src: "music/Five.mp3",
        cover: "images/five.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.19",
        duration: 178
    },
    {
        id: "amos_roddy-tears",
        title: "Tears",
        artist: "Amos Roddy",
        src: "music/Tears.mp3",
        cover: "images/Tears.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.21.6",
        duration: 175
    },
    {
        id: "hyper_potions-lava-chicken",
        title: "Lava Chicken",
        artist: "Hyper Potions",
        src: "music/lava.mp3",
        cover: "images/lava.jpg",
        genre: [
            "Music Disc"
        ],
        version: "1.21.7",
        duration: 134
    },
    {
        id: "amos_roddy-fireflies",
        title: "Fireflies",
        artist: "Amos Roddy",
        src: "music/Fireflies.mp3",
        cover: "images/tears.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.21.6",
        duration: 156
    },
    {
        id: "amos_roddy-lilypad",
        title: "Lilypad",
        artist: "Amos Roddy",
        src: "music/Lilypad.mp3",
        cover: "images/tears.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.21.6",
        duration: 236
    },
    {
        id: "amos_roddy-below_and_above",
        title: "Below and Above",
        artist: "Amos Roddy",
        src: "music/Below-and-Above.mp3",
        cover: "images/tears.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.21.6",
        duration: 213
    },
    {
        id: "amos_roddy-os_piano",
        title: "O's Piano",
        artist: "Amos Roddy",
        src: "music/O's-Piano.mp3",
        cover: "images/tears.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.21.6",
        duration: 276
    },
    {
        id: "amos_roddy-broken_clocks",
        title: "Broken Clocks",
        artist: "Amos Roddy",
        src: "music/Broken-Clocks.mp3",
        cover: "images/tears.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.21.6",
        duration: 214
    },
    {
        id: "lena_raine-aerie",
        title: "Aerie",
        artist: "Lena Raine",
        src: "music/Aerie.mp3",
        cover: "images/five.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.19",
        duration: 297
    },
    {
        id: "lena_raine-firebugs",
        title: "Firebugs",
        artist: "Lena Raine",
        src: "music/Firebugs.mp3",
        cover: "images/five.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.19",
        duration: 313
    },
    {
        id: "lena_raine-labyrinthine",
        title: "Labyrinthine",
        artist: "Lena Raine",
        src: "music/Labyrinthine.mp3",
        cover: "images/five.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.19",
        duration: 325
    },
    {
        id: "aaron_cherof-echo_in_the_wind",
        title: "Echo in the Wind",
        artist: "Aaron Cherof",
        src: "music/Echo-in-the-Wind.mp3",
        cover: "images/Echo-in-the-Wind.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.20",
        duration: 297,
        visible: false
    },
    {
        id: "aaron_cherof-a_familiar_room",
        title: "A Familiar Room",
        artist: "Aaron Cherof",
        src: "music/A-Familiar-Room.mp3",
        cover: "images/Echo-in-the-Wind.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.20",
        duration: 242,
        visible: false
    },
    {
        id: "aaron_cherof-bromeliad",
        title: "Bromeliad",
        artist: "Aaron Cherof",
        src: "music/Bromeliad.mp3",
        cover: "images/Echo-in-the-Wind.jpg",
        genre: [
            "Ambient Track"
        ],
        version: "1.20",
        duration: 313,
        visible: false
    }
];





