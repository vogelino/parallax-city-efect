function updateParallax(x, y) {
  document.documentElement.style.setProperty("--mouse-x", x);
  document.documentElement.style.setProperty("--mouse-y", y);
}

let rafId = 0;
let pointerX = 0;
let pointerY = 0;
const parallax = document.querySelector(".parallax");
const baseTileWidth = 2000;
const cssTileCountPerSide = 1;
const tileOverlap = 4;
let renderedTileCountPerSide = cssTileCountPerSide;

function updateAdditionalTiles(viewportWidth) {
  const requiredTileCountPerSide = Math.max(
    cssTileCountPerSide,
    Math.ceil(Math.max(0, (viewportWidth - baseTileWidth) / 2) / baseTileWidth),
  );

  if (requiredTileCountPerSide === renderedTileCountPerSide) return;

  for (const layer of parallax.querySelectorAll(".scene-layer")) {
    const strip = layer.querySelector(".scene-strip");

    strip.querySelectorAll(".layer-tile--dynamic").forEach((tile) => {
      tile.remove();
    });

    const centerTile = strip.querySelector(".layer-tile");

    for (
      let offset = cssTileCountPerSide + 1;
      offset <= requiredTileCountPerSide;
      offset += 1
    ) {
      for (const side of ["left", "right"]) {
        const extension = centerTile.cloneNode();
        const mirroredClass = offset % 2 === 1 ? " layer-tile--mirrored" : "";

        extension.className = `layer-tile layer-tile--extension layer-tile--dynamic layer-tile--${side}${mirroredClass}`;
        extension.style.setProperty(
          "--tile-position",
          `calc(${offset * 100}% - ${offset * tileOverlap}px)`,
        );
        extension.alt = "";
        extension.draggable = false;
        strip.append(extension);
      }
    }
  }

  renderedTileCountPerSide = requiredTileCountPerSide;
}

const parallaxResizeObserver = new ResizeObserver(([entry]) => {
  updateAdditionalTiles(entry.contentRect.width);
});

parallaxResizeObserver.observe(parallax);

document.addEventListener("pointermove", (event) => {
  const parallaxBounds = parallax.getBoundingClientRect();
  const viewportHeight = document.documentElement.clientHeight;

  pointerX = Math.max(
    -1,
    Math.min(
      1,
      ((event.clientX - parallaxBounds.left) * 2) / parallaxBounds.width - 1,
    ),
  );
  pointerY = Math.max(
    -1,
    Math.min(1, (event.clientY * 2) / viewportHeight - 1),
  );

  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    updateParallax(pointerX, pointerY);
    rafId = 0;
  });
});
