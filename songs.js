const songs = [
    {
        "id": "lena_raine-otherside",
        "title": "Otherside",
        "artist": "Lena Raine",
        "src": "music/otherside.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.18",
        "duration": 195
    },
    {
        "id": "lena_raine-pigstep",
        "title": "Pigstep",
        "artist": "Lena Raine",
        "src": "music/pigstep.mp3",
        "cover": "images/pigstep.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.16",
        "duration": 149
    },
    {
        "id": "aaron_cherof-relic",
        "title": "Relic",
        "artist": "Aaron Cherof",
        "src": "music/relic.mp3",
        "cover": "images/relic.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.20",
        "duration": 219
    },
    {
        "id": "c418-13",
        "title": "13",
        "artist": "C418",
        "src": "music/Thirteen.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "Alpha 1.0.14",
        "duration": 176
    },
    {
        "id": "c418-cat",
        "title": "Cat",
        "artist": "C418",
        "src": "music/Cat.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "Alpha 1.0.14",
        "duration": 186
    },
    {
        "id": "c418-blocks",
        "title": "Blocks",
        "artist": "C418",
        "src": "music/Blocks.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 343
    },
    {
        "id": "c418-chirp",
        "title": "Chirp",
        "artist": "C418",
        "src": "music/Chirp.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 187
    },
    {
        "id": "c418-far",
        "title": "Far",
        "artist": "C418",
        "src": "music/Far.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 191
    },
    {
        "id": "c418-mall",
        "title": "Mall",
        "artist": "C418",
        "src": "music/Mall.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 197
    },
    {
        "id": "c418-mellohi",
        "title": "Mellohi",
        "artist": "C418",
        "src": "music/Mellohi.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 98
    },
    {
        "id": "c418-stal",
        "title": "Stal",
        "artist": "C418",
        "src": "music/Stal.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 151
    },
    {
        "id": "c418-strad",
        "title": "Strad",
        "artist": "C418",
        "src": "music/Strad.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 188
    },
    {
        "id": "c418-ward",
        "title": "Ward",
        "artist": "C418",
        "src": "music/Ward.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 249
    },
    {
        "id": "c418-11",
        "title": "11",
        "artist": "C418",
        "src": "music/11.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.0.0",
        "duration": 72
    },
    {
        "id": "lena_raine-creator-music-box",
        "title": "Creator (Music Box)",
        "artist": "Lena Raine",
        "src": "music/Creator-Music-Box.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Music Disc"
        ],
        "version": "1.21",
        "duration": 74
    },
    {
        "id": "c418-wait",
        "title": "Wait",
        "artist": "C418",
        "src": "music/Wait.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.4.4",
        "duration": 234
    },
    {
        "id": "lena_raine-creator",
        "title": "Creator",
        "artist": "Lena Raine",
        "src": "music/Creator.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Music Disc"
        ],
        "version": "1.21",
        "duration": 177
    },
    {
        "id": "aaron_cherof-precipice",
        "title": "Precipice",
        "artist": "Aaron Cherof",
        "src": "music/Precipice.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Music Disc"
        ],
        "version": "1.21",
        "duration": 299
    },
    {
        "id": "samuel_aberg-5",
        "title": "5",
        "artist": "Samuel Åberg",
        "src": "music/Five.mp3",
        "cover": "images/five.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.19",
        "duration": 178
    },
    {
        "id": "amos_roddy-tears",
        "title": "Tears",
        "artist": "Amos Roddy",
        "src": "music/Tears.mp3",
        "cover": "images/Tears.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.21.6",
        "duration": 175
    },
    {
        "id": "hyper_potions-lava-chicken",
        "title": "Lava Chicken",
        "artist": "Hyper Potions",
        "src": "music/lava.mp3",
        "cover": "images/lava.jpg",
        "genre": [
            "Music Disc"
        ],
        "version": "1.21.7",
        "duration": 134
    },
    {
        "id": "amos_roddy-fireflies",
        "title": "Fireflies",
        "artist": "Amos Roddy",
        "src": "music/Fireflies.mp3",
        "cover": "images/tears.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21.6",
        "duration": 156
    },
    {
        "id": "amos_roddy-lilypad",
        "title": "Lilypad",
        "artist": "Amos Roddy",
        "src": "music/Lilypad.mp3",
        "cover": "images/tears.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21.6",
        "duration": 236
    },
    {
        "id": "amos_roddy-below_and_above",
        "title": "Below and Above",
        "artist": "Amos Roddy",
        "src": "music/Below-and-Above.mp3",
        "cover": "images/tears.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21.6",
        "duration": 213
    },
    {
        "id": "amos_roddy-os_piano",
        "title": "O's Piano",
        "artist": "Amos Roddy",
        "src": "music/O's-Piano.mp3",
        "cover": "images/tears.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21.6",
        "duration": 276
    },
    {
        "id": "amos_roddy-broken_clocks",
        "title": "Broken Clocks",
        "artist": "Amos Roddy",
        "src": "music/Broken-Clocks.mp3",
        "cover": "images/tears.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21.6",
        "duration": 214
    },
    {
        "id": "lena_raine-aerie",
        "title": "Aerie",
        "artist": "Lena Raine",
        "src": "music/Aerie.mp3",
        "cover": "images/five.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.19",
        "duration": 297
    },
    {
        "id": "lena_raine-firebugs",
        "title": "Firebugs",
        "artist": "Lena Raine",
        "src": "music/Firebugs.mp3",
        "cover": "images/five.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.19",
        "duration": 313
    },
    {
        "id": "lena_raine-labyrinthine",
        "title": "Labyrinthine",
        "artist": "Lena Raine",
        "src": "music/Labyrinthine.mp3",
        "cover": "images/five.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.19",
        "duration": 325
    },
    {
        "id": "aaron_cherof-echo_in_the_wind",
        "title": "Echo in the Wind",
        "artist": "Aaron Cherof",
        "src": "music/Echo-in-the-Wind.mp3",
        "cover": "images/Echo-in-the-Wind.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.20",
        "duration": 297
    },
    {
        "id": "aaron_cherof-a_familiar_room",
        "title": "A Familiar Room",
        "artist": "Aaron Cherof",
        "src": "music/A-Familiar-Room.mp3",
        "cover": "images/Echo-in-the-Wind.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.20",
        "duration": 242
    },
    {
        "id": "aaron_cherof-bromeliad",
        "title": "Bromeliad",
        "artist": "Aaron Cherof",
        "src": "music/Bromeliad.mp3",
        "cover": "images/Echo-in-the-Wind.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.20",
        "duration": 313
    },
    {
        "id": "aaron_cherof-crescent_dunes",
        "title": "Crescent Dunes",
        "artist": "Aaron Cherof",
        "src": "music/Crescent-Dunes.mp3",
        "cover": "images/Echo-in-the-Wind.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.20",
        "duration": 249
    },
    {
        "id": "aaron_cherof-featherfall",
        "title": "Featherfall",
        "artist": "Aaron Cherof",
        "src": "music/Featherfall.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 345
    },
    {
        "id": "aaron_cherof-watcher",
        "title": "Watcher",
        "artist": "Aaron Cherof",
        "src": "music/Watcher.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 333
    },
    {
        "id": "aaron_cherof-puzzlebox",
        "title": "Puzzlebox",
        "artist": "Aaron Cherof",
        "src": "music/Puzzlebox.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 300
    },
    {
        "id": "kumi_tanioka-komorebi",
        "title": "komorebi",
        "artist": "Kumi Tanioka",
        "src": "music/komorebi.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 288
    },
    {
        "id": "kumi_tanioka-pokopoko",
        "title": "pokopoko",
        "artist": "Kumi Tanioka",
        "src": "music/pokopoko.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 305
    },
    {
        "id": "kumi_tanioka-yakusoku",
        "title": "yakusoku",
        "artist": "Kumi Tanioka",
        "src": "music/yakusoku.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 272
    },
    {
        "id": "lena_raine-deeper",
        "title": "Deeper",
        "artist": "Lena Raine",
        "src": "music/Deeper.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 304
    },
    {
        "id": "lena_raine-eld_unknown",
        "title": "Eld Unknown",
        "artist": "Lena Raine",
        "src": "music/Eld-Unknown.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 297
    },
    {
        "id": "lena_raine-endless",
        "title": "Endless",
        "artist": "Lena Raine",
        "src": "music/Endless.mp3",
        "cover": "images/tricky.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.21",
        "duration": 403
    },
    {
        "id": "lena_raine-chrysopoeia",
        "title": "Chrysopoeia",
        "artist": "Lena Raine",
        "src": "music/Chrysopoeia.mp3",
        "cover": "images/pigstep.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.16",
        "duration": 304
    },
    {
        "id": "lena_raine-rubedo",
        "title": "Rubedo",
        "artist": "Lena Raine",
        "src": "music/Rubedo.mp3",
        "cover": "images/pigstep.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.16",
        "duration": 313
    },
    {
        "id": "lena_raine-so_below",
        "title": "So Below",
        "artist": "Lena Raine",
        "src": "music/So-Below.mp3",
        "cover": "images/pigstep.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.16",
        "duration": 319
    },
    {
        "id": "lena_raine-stand_tall",
        "title": "Stand Tall",
        "artist": "Lena Raine",
        "src": "music/Stand-Tall.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 309
    },
    {
        "id": "lena_raine-left_to_bloom",
        "title": "Left to Bloom",
        "artist": "Lena Raine",
        "src": "music/Left-to-Bloom.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 343
    },
    {
        "id": "lena_raine-ancestry",
        "title": "Ancestry",
        "artist": "Lena Raine",
        "src": "music/Ancestry.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 344
    },
    {
        "id": "lena_raine-wending",
        "title": "Wending",
        "artist": "Lena Raine",
        "src": "music/Wending.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 315
    },
    {
        "id": "lena_raine-infinite_amethyst",
        "title": "Infinite Amethyst",
        "artist": "Lena Raine",
        "src": "music/Infinite-Amethyst.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 272
    },
    {
        "id": "lena_raine-one_more_day",
        "title": "One More Day",
        "artist": "Lena Raine",
        "src": "music/One-More-Day.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 279
    },
    {
        "id": "kumi_tanioka-floating_dream",
        "title": "Floating Dream",
        "artist": "Kumi Tanioka",
        "src": "music/Floating-Dream.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 206
    },
    {
        "id": "kumi_tanioka-comforting_memories",
        "title": "Comforting Memories",
        "artist": "Kumi Tanioka",
        "src": "music/Comforting-Memories.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 276
    },
    {
        "id": "kumi_tanioka-an_ordinary_day",
        "title": "An Ordinary Day",
        "artist": "Kumi Tanioka",
        "src": "music/An-Ordinary-Day.mp3",
        "cover": "images/otherside.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.18",
        "duration": 332
    },
    {
        "id": "c418-aria_math",
        "title": "Aria Math",
        "artist": "C418",
        "src": "music/Aria-Math.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.7.4",
        "duration": 310,
        "visible": true
    },
    {
        "id": "c418-biome_fest",
        "title": "Biome Fest",
        "artist": "C418",
        "src": "music/Biome-Fest.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.7.4",
        "duration": 378,
        "visible": true
    },
    {
        "id": "c418-blind_spots",
        "title": "Blind Spots",
        "artist": "C418",
        "src": "music/Blind-Spots.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.7.4",
        "duration": 332,
        "visible": true
    },
    {
        "id": "c418-clark",
        "title": "Clark",
        "artist": "C418",
        "src": "music/Clark.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.0.14",
        "duration": 192,
        "visible": true
    },
    {
        "id": "c418-danny",
        "title": "Danny",
        "artist": "C418",
        "src": "music/Danny.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.2.0",
        "duration": 255,
        "visible": true
    },
    {
        "id": "c418-dreiton",
        "title": "Dreiton",
        "artist": "C418",
        "src": "music/Dreiton.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.7.4",
        "duration": 497,
        "visible": true
    },
    {
        "id": "c418-dry_hands",
        "title": "Dry Hands",
        "artist": "C418",
        "src": "music/Dry-Hands.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.0.14",
        "duration": 69,
        "visible": true
    },
    {
        "id": "c418-haggstrom",
        "title": "Haggstrom",
        "artist": "C418",
        "src": "music/Haggstrom.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.2.0",
        "duration": 204,
        "visible": true
    },
    {
        "id": "c418-haunt_muskie",
        "title": "Haunt Muskie",
        "artist": "C418",
        "src": "music/Haunt-Muskie.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.7.4",
        "duration": 361,
        "visible": true
    },
    {
        "id": "c418-key",
        "title": "Key",
        "artist": "C418",
        "src": "music/Key.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.2.0",
        "duration": 65,
        "visible": true
    },
    {
        "id": "c418-living_mice",
        "title": "Living Mice",
        "artist": "C418",
        "src": "music/Living-Mice.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.2.0",
        "duration": 178,
        "visible": true
    },
    {
        "id": "c418-mice_on_venus",
        "title": "Mice on Venus",
        "artist": "C418",
        "src": "music/Mice-on-Venus.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.0.14",
        "duration": 282,
        "visible": true
    },
    {
        "id": "c418-minecraft",
        "title": "Minecraft",
        "artist": "C418",
        "src": "music/Minecraft.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Classic 0.0.22a",
        "duration": 254,
        "visible": true
    },
    {
        "id": "c418-oxygne",
        "title": "Oxygène",
        "artist": "C418",
        "src": "music/Oxygene.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v.1.2.0",
        "duration": 66,
        "visible": true
    },
    {
        "id": "c418-subwoofer_lullaby",
        "title": "Subwoofer Lullaby",
        "artist": "C418",
        "src": "music/Subwoofer-Lullaby.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v.1.2.0",
        "duration": 209,
        "visible": true
    },
    {
        "id": "c418-sweden",
        "title": "Sweden",
        "artist": "C418",
        "src": "music/Sweden.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Classic 0.0.22a",
        "duration": 216,
        "visible": true
    },
    {
        "id": "c418-taswell",
        "title": "Taswell",
        "artist": "C418",
        "src": "music/Taswell.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "1.7.4",
        "duration": 515,
        "visible": true
    },
    {
        "id": "c418-wet_hands",
        "title": "Wet Hands",
        "artist": "C418",
        "src": "music/Wet-Hands.mp3",
        "cover": "images/thirteen.jpg",
        "genre": [
            "Ambient Track"
        ],
        "version": "Alpha v1.0.14",
        "duration": 90,
        "visible": true
    },
    {
        "id": "fingerspit-bounce",
        "title": "Bounce",
        "artist": "Fingerspit",
        "src": "music/Bounce.mp3",
        "cover": "images/bounce.png",
        "genre": [
            "Music Disc"
        ],
        "version": "26.2",
        "duration": 234
    },
    {
        "id": "fingerspit-shores",
        "title": "Shores",
        "artist": "Fingerspit",
        "src": "music/Shores.mp3",
        "cover": "images/bounce.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "26.2",
        "duration": 320
    },
    {
        "id": "fingerspit-memories",
        "title": "Memories",
        "artist": "Fingerspit",
        "src": "music/Memories.mp3",
        "cover": "images/bounce.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "26.2",
        "duration": 245
    },
    {
        "id": "fingerspit-nightly",
        "title": "Nightly",
        "artist": "Fingerspit",
        "src": "music/Nightly.mp3",
        "cover": "images/bounce.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "26.2",
        "duration": 302
    },
    {
        "id": "fingerspit-home",
        "title": "Home",
        "artist": "Fingerspit",
        "src": "music/home.mp3",
        "cover": "images/bounce.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "26.2",
        "duration": 380
    },
    {
        "id": "fingerspit-ebb",
        "title": "Ebb",
        "artist": "Fingerspit",
        "src": "music/Ebb.mp3",
        "cover": "images/bounce.png",
        "genre": [
            "Ambient Track"
        ],
        "version": "26.2",
        "duration": 306
    },
    {
        "id": "minecraft-the-milion-villager-song",
        "title": "THE 20 MILLION VILLAGER SONG",
        "artist": "Minecraft",
        "src": "music/THEMILLIONVILLAGERSONG.mp3",
        "cover": "images/villagersong.png",
        "genre": [
            "Special"
        ],
        "version": "None",
        "duration": 60
    },
    {
        "id": "c418-axolotl",
        "title": "Axolotl",
        "artist": "C418",
        "src": "music/axolotl.mp3",
        "cover": "images/axolotl.png",
        "genre": [
            "Ambient Track",
            "Underwater"
        ],
        "version": "1.13",
        "duration": 303
    },
    {
        "id": "c418-dragon-fish",
        "title": "Dragon Fish",
        "artist": "C418",
        "src": "music/dragon-fish.mp3",
        "cover": "images/axolotl.png",
        "genre": [
            "Ambient Track",
            "Underwater"
        ],
        "version": "1.13",
        "duration": 372
    },
    {
        "id": "c418-shuniji",
        "title": "Shuniji",
        "artist": "C418",
        "src": "music/shuniji.mp3",
        "cover": "images/axolotl.png",
        "genre": [
            "Ambient Track",
            "Underwater"
        ],
        "version": "1.13",
        "duration": 244
    },
    {
        "id": "c418-ballad-of-the-cats",
        "title": "Ballad of the Cats",
        "artist": "C418",
        "src": "music/Ballad-of-the-Cats.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Nether"
        ],
        "version": "1.7.4",
        "duration": 275
    },
    {
        "id": "c418-concrete-halls",
        "title": "Concrete Halls",
        "artist": "C418",
        "src": "music/Concrete-Halls.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Nether"
        ],
        "version": "1.7.4",
        "duration": 254
    },
    {
        "id": "c418-dead-voxel",
        "title": "Dead Voxel",
        "artist": "C418",
        "src": "music/dead-voxel.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Nether"
        ],
        "version": "1.7.4",
        "duration": 296
    },
    {
        "id": "c418-warmth",
        "title": "Warmth",
        "artist": "C418",
        "src": "music/warmth.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Nether"
        ],
        "version": "1.7.4",
        "duration": 239
    },
    {
        "id": "c418-the-end",
        "title": "The End",
        "artist": "C418",
        "src": "music/the-end.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "End"
        ],
        "version": "1.7.4",
        "duration": 904
    },
    {
        "id": "c418-boss",
        "title": "Boss",
        "artist": "C418",
        "src": "music/boss.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "End"
        ],
        "version": "1.7.4",
        "duration": 344
    },
    {
        "id": "c418-alpha",
        "title": "Alpha",
        "artist": "C418",
        "src": "music/alpha.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Extras"
        ],
        "version": "1.7.4",
        "duration": 603
    },
    {
        "id": "c418-beginning_2",
        "title": "Beginning 2",
        "artist": "C418",
        "src": "music/beginning-2.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Extras"
        ],
        "version": "1.7.4",
        "duration": 176
    },
    {
        "id": "c418-floating_trees",
        "title": "Floating Trees",
        "artist": "C418",
        "src": "music/Floating-Trees.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Extras"
        ],
        "version": "1.7.4",
        "duration": 244
    },
    {
        "id": "c418-moog_city_2",
        "title": "Moog City 2",
        "artist": "C418",
        "src": "music/Moog-City-2.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Extras"
        ],
        "version": "1.7.4",
        "duration": 180
    },
    {
        "id": "c418-mutation",
        "title": "Mutation",
        "artist": "C418",
        "src": "music/Mutation.mp3",
        "cover": "images/miniaturka_r87ECi9RR_M.jpg",
        "genre": [
            "Ambient Track",
            "Extras"
        ],
        "version": "1.7.4",
        "duration": 185
    },
    {
        "id": "minecraft-happy_ghast_music",
        "title": "Happy Ghast Music",
        "artist": "Element Animation",
        "src": "music/HAPPY-GHAST-MUSIC.mp3",
        "cover": "images/happy_gOwno.png",
        "genre": [
            "Special"
        ],
        "version": "None",
        "duration": 97
    },
    {
        "id": "camilo_forero-copper_golem",
        "title": "Copper Golem",
        "artist": "Camilo Forero",
        "src": "music/Copper-Golem.mp3",
        "cover": "images/copper-golem.png",
        "genre": [
            "Special"
        ],
        "version": "None",
        "duration": 164
    }
];
