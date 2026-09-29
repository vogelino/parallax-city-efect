# Parallax city effect

A parallax city scene built with vanilla JavaScript, CSS, and Vite.

## Development

Use Node.js 22.12+ (or Node.js 24+) and pnpm 12.6.0.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite (usually http://localhost:5173).
`pnpm start` also starts the development server.

## Production

```sh
pnpm build
pnpm preview
```

The production build is written to `dist/`. The preview command serves that
build locally (usually http://localhost:4173).

`index.html` is the Vite entry point, with the interaction in `index.js`, styles
in `styles.css`, and scene assets in `images/`.
