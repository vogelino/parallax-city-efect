const BASE_TILE_WIDTH = 2000;
const CSS_TILE_COUNT_PER_SIDE = 1;
const TILE_OVERLAP = 4;

function getRequiredTileCount(viewportWidth: number) {
  const uncoveredWidth = Math.max(0, viewportWidth - BASE_TILE_WIDTH) / 2;

  return Math.max(
    CSS_TILE_COUNT_PER_SIDE,
    Math.ceil(uncoveredWidth / BASE_TILE_WIDTH),
  );
}

function createExtensionTile(
  centerTile: HTMLImageElement,
  side: "left" | "right",
  offset: number,
) {
  const tile = centerTile.cloneNode();

  if (!(tile instanceof HTMLImageElement)) {
    throw new Error("Could not clone a parallax scene tile.");
  }

  tile.classList.add(
    "layer-tile--extension",
    "layer-tile--dynamic",
    `layer-tile--${side}`,
  );

  if (offset % 2 === 1) {
    tile.classList.add("layer-tile--mirrored");
  }

  tile.style.setProperty(
    "--tile-position",
    `calc(${offset * 100}% - ${offset * TILE_OVERLAP}px)`,
  );
  tile.alt = "";
  tile.draggable = false;

  return tile;
}

function renderAdditionalTiles(scene: HTMLElement, countPerSide: number) {
  for (const layer of scene.querySelectorAll(".scene-layer")) {
    const strip = layer.querySelector(".scene-strip");
    const centerTile = strip?.querySelector(".layer-tile");

    if (
      !(strip instanceof HTMLElement) ||
      !(centerTile instanceof HTMLImageElement)
    ) {
      continue;
    }

    strip.querySelectorAll(".layer-tile--dynamic").forEach((tile) => {
      tile.remove();
    });

    for (
      let offset = CSS_TILE_COUNT_PER_SIDE + 1;
      offset <= countPerSide;
      offset += 1
    ) {
      strip.append(
        createExtensionTile(centerTile, "left", offset),
        createExtensionTile(centerTile, "right", offset),
      );
    }
  }
}

/**
 * Adds image tiles only when the viewport is wider than the CSS-only scene.
 */
export function observeSceneTiles(scene: HTMLElement) {
  let renderedTileCount = CSS_TILE_COUNT_PER_SIDE;

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];

    if (!entry) return;

    const requiredTileCount = getRequiredTileCount(entry.contentRect.width);

    if (requiredTileCount === renderedTileCount) return;

    renderAdditionalTiles(scene, requiredTileCount);
    renderedTileCount = requiredTileCount;
  });

  observer.observe(scene);
  return observer;
}
