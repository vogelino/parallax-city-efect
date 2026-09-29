/**
 * Batches scene movement into a single update per animation frame.
 */
export function createParallaxMotion(root: HTMLElement) {
  let animationFrameId = 0;
  let nextX = 0;
  let nextY = 0;

  function render() {
    root.style.setProperty("--mouse-x", String(nextX));
    root.style.setProperty("--mouse-y", String(nextY));
    animationFrameId = 0;
  }

  function schedule(x: number, y = 0) {
    nextX = x;
    nextY = y;

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  return { schedule };
}
