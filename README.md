# ZeppBlockBlast

A lightweight **Block Blast-style block puzzle game for Zepp OS**, built for the Amazfit Bip 6 and powered by [ZeppCore](https://github.com/Ruimtewese/ZeppCore).

## Features

- 8×8 puzzle board
- Three random pieces at a time
- Tap a piece, then tap where it should be placed
- Clear complete rows and columns
- Local high score
- Pastel block colors on a black UI
- Placement and line-clear animations
- Vibration feedback
- Built-in Zepp system sounds
- No custom image assets required

## Project

The app keeps the standard Zepp OS template structure:

```
app/
├── app.js
├── app.json
├── package.json
└── page/
    └── gt/
        └── home/
            └── index.page.js
```

## Install ZeppCore

Inside the app directory:

```bash
npm install
```

The package depends on the public `Ruimtewese/ZeppCore` GitHub repository.

## Controls

1. Tap one of the three pieces at the bottom.
2. Tap the top-left grid cell where the piece should start.
3. Full rows and columns clear automatically.
4. Tap **NEW** at any time to restart.

The game uses tap-to-place rather than drag-and-drop because it gives more reliable input on a small watch screen.

## License

MIT
