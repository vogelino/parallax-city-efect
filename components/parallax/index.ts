import { setupParallaxInput } from "./input";
import { createParallaxMotion } from "./motion";
import { observeSceneTiles } from "./scene-tiles";

/**
 * Initializes a parallax experience and keeps its internal behavior encapsulated.
 */
export function setupParallax(root: HTMLElement) {
  const scene = root.querySelector(".parallax");
  const tiltPermissionButton = root.querySelector(".tilt-permission");

  if (
    !(scene instanceof HTMLElement) ||
    !(tiltPermissionButton instanceof HTMLButtonElement)
  ) {
    throw new Error("The parallax scene is missing required markup.");
  }

  const motion = createParallaxMotion(root);

  observeSceneTiles(scene);
  setupParallaxInput(scene, tiltPermissionButton, motion.schedule);
}
