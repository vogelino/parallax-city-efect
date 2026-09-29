# Parallax city effect

A parallax city scene built with vanilla TypeScript, CSS, and Vite.

## Development

Use Node.js 22.12+ (or Node.js 24+) and pnpm 12.6.0.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite (usually http://localhost:5173).
`pnpm start` also starts the development server.

Run the strict TypeScript check independently with:

```sh
pnpm typecheck
```

### Test mobile sensors over HTTPS

iOS only exposes motion and orientation sensors to secure pages. Start Vite and
a temporary HTTPS tunnel together with:

```sh
pnpm tunnel
```

Open the printed `https://…loca.lt` URL on the iPhone and tap **Enable tilt**.
Keep the command running while testing and press Ctrl+C when finished. The URL
is temporary and publicly reachable, so do not share it or expose secrets
through the development server.

## Production

```sh
pnpm build
pnpm preview
```

The production build is written to `dist/`. The preview command serves that
build locally (usually http://localhost:4173).

`index.html` is the Vite entry point. `index.ts` and `styles.css` are lightweight
page-level entry files. The parallax feature keeps its behavior and scoped styles
together in `components/parallax/`; global page styles live in `styles/`, and
scene assets live in `images/`.
