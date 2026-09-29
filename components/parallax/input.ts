const FULL_TILT_ANGLE = 20;
const TILT_DEAD_ZONE = 0.03;
const TILT_SMOOTHING = 0.12;

type MoveHandler = (x: number, y?: number) => void;

type PermissionCapableOrientation = {
  requestPermission(): Promise<"denied" | "granted">;
};

const clamp = (value: number, min = -1, max = 1) =>
  Math.max(min, Math.min(max, value));

function canRequestOrientationPermission(
  value: object,
): value is PermissionCapableOrientation {
  return (
    "requestPermission" in value &&
    typeof value.requestPermission === "function"
  );
}

function getScreenAngle() {
  if (typeof screen.orientation?.angle === "number") {
    return screen.orientation.angle;
  }

  if ("orientation" in window && typeof window.orientation === "number") {
    return window.orientation;
  }

  return 0;
}

function setupPointerInput(scene: HTMLElement, onMove: MoveHandler) {
  document.addEventListener("pointermove", (event) => {
    const bounds = scene.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) * 2) / bounds.width - 1);
    const y = clamp(
      (event.clientY * 2) / document.documentElement.clientHeight - 1,
    );

    onMove(x, y);
  });
}

function showUnavailableMessage(button: HTMLButtonElement) {
  button.hidden = false;
  button.disabled = true;
  button.textContent = window.isSecureContext
    ? "Tilt unavailable"
    : "Tilt requires HTTPS";
}

function setupTiltInput(button: HTMLButtonElement, onMove: MoveHandler) {
  const DeviceOrientation = window.DeviceOrientationEvent;
  let neutralTilt: number | null = null;
  let smoothedTilt = 0;

  function resetNeutralTilt() {
    neutralTilt = null;
  }

  function handleOrientation(event: DeviceOrientationEvent) {
    if (event.beta === null || event.gamma === null) return;

    const screenAngle = getScreenAngle();
    const isLandscape = Math.abs(screenAngle) === 90;
    const horizontalTilt = isLandscape
      ? event.beta * (screenAngle === 90 ? 1 : -1)
      : event.gamma;

    neutralTilt ??= horizontalTilt;

    const normalizedTilt = clamp(
      (horizontalTilt - neutralTilt) / FULL_TILT_ANGLE,
    );
    const stableTilt =
      Math.abs(normalizedTilt) < TILT_DEAD_ZONE ? 0 : normalizedTilt;

    smoothedTilt += (stableTilt - smoothedTilt) * TILT_SMOOTHING;
    onMove(smoothedTilt);
  }

  function enableTilt() {
    resetNeutralTilt();
    window.addEventListener("deviceorientation", handleOrientation);
    screen.orientation?.addEventListener("change", resetNeutralTilt);
    button.hidden = true;
  }

  if (!canRequestOrientationPermission(DeviceOrientation)) {
    enableTilt();
    return;
  }

  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      const permission = await DeviceOrientation.requestPermission();

      if (permission === "granted") {
        enableTilt();
      } else {
        button.textContent = "Tilt access denied";
      }
    } catch {
      button.textContent = "Could not enable tilt";
    }
  });
}

/**
 * Selects pointer movement or device orientation for the current device.
 */
export function setupParallaxInput(
  scene: HTMLElement,
  tiltPermissionButton: HTMLButtonElement,
  onMove: MoveHandler,
) {
  const usesTouchInput =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(any-pointer: coarse)").matches;

  if (!usesTouchInput) {
    setupPointerInput(scene, onMove);
    return;
  }

  if (!window.isSecureContext || !("DeviceOrientationEvent" in window)) {
    setupPointerInput(scene, onMove);
    showUnavailableMessage(tiltPermissionButton);
    return;
  }

  setupTiltInput(tiltPermissionButton, onMove);
}
