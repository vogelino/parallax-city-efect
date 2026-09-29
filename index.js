function updateParallax(x, y) {
  document.documentElement.style.setProperty("--mouse-x", x);
  document.documentElement.style.setProperty("--mouse-y", y);
}

let rafId = 0;
let pointerX = 0;
let pointerY = 0;
const parallax = document.querySelector(".parallax");
const tiltPermissionButton = document.querySelector(".tilt-permission");
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

function scheduleParallaxUpdate(x, y = 0) {
  pointerX = x;
  pointerY = y;

  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    updateParallax(pointerX, pointerY);
    rafId = 0;
  });
}

function handlePointerMove(event) {
  const parallaxBounds = parallax.getBoundingClientRect();
  const viewportHeight = document.documentElement.clientHeight;

  const x = Math.max(
    -1,
    Math.min(
      1,
      ((event.clientX - parallaxBounds.left) * 2) / parallaxBounds.width - 1,
    ),
  );
  const y = Math.max(
    -1,
    Math.min(1, (event.clientY * 2) / viewportHeight - 1),
  );

  scheduleParallaxUpdate(x, y);
}

const usesTouchInput =
  navigator.maxTouchPoints > 0 ||
  window.matchMedia("(any-pointer: coarse)").matches;

if (!usesTouchInput) {
  document.addEventListener("pointermove", handlePointerMove);
} else if (!window.isSecureContext || !("DeviceOrientationEvent" in window)) {
  // Sensor APIs are unavailable over a phone's plain-http LAN URL. Keep touch
  // movement as a fallback, but explain why the permission control cannot run.
  document.addEventListener("pointermove", handlePointerMove);
  tiltPermissionButton.hidden = false;
  tiltPermissionButton.disabled = true;
  tiltPermissionButton.textContent = window.isSecureContext
    ? "Tilt unavailable"
    : "Tilt requires HTTPS";
} else {
  let neutralTilt = null;
  let smoothedTilt = 0;
  const DeviceOrientation = window.DeviceOrientationEvent;

  function handleDeviceOrientation(event) {
    if (event.beta === null || event.gamma === null) return;

    const screenAngle = screen.orientation?.angle ?? window.orientation ?? 0;
    let horizontalTilt = event.gamma;

    if (Math.abs(screenAngle) === 90) {
      horizontalTilt = event.beta * (screenAngle === 90 ? 1 : -1);
    }

    if (neutralTilt === null) neutralTilt = horizontalTilt;

    // About 20 degrees of movement reaches the full parallax range. A small
    // dead zone and smoothing keep sensor noise from making the scene twitch.
    const relativeTilt = horizontalTilt - neutralTilt;
    const normalizedTilt = Math.max(-1, Math.min(1, relativeTilt / 20));
    const withDeadZone = Math.abs(normalizedTilt) < 0.03 ? 0 : normalizedTilt;

    smoothedTilt += (withDeadZone - smoothedTilt) * 0.12;
    scheduleParallaxUpdate(smoothedTilt);
  }

  function enableTilt() {
    neutralTilt = null;
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    screen.orientation?.addEventListener("change", () => {
      neutralTilt = null;
    });
    tiltPermissionButton.hidden = true;
  }

  const requestPermission = DeviceOrientation.requestPermission;

  if (typeof requestPermission === "function") {
    tiltPermissionButton.hidden = false;
    tiltPermissionButton.addEventListener("click", async () => {
      try {
        if ((await requestPermission.call(DeviceOrientation)) === "granted") {
          enableTilt();
        } else {
          tiltPermissionButton.textContent = "Tilt access denied";
        }
      } catch {
        tiltPermissionButton.textContent = "Could not enable tilt";
      }
    });
  } else {
    enableTilt();
  }
}
