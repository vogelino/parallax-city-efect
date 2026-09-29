function updateParallax(x, y) {
  document.documentElement.style.setProperty("--mouse-x", x);
  document.documentElement.style.setProperty("--mouse-y", y);
}

let rafId = 0;
let pointerX = 0;
let pointerY = 0;

document.addEventListener("pointermove", (event) => {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  pointerX = Math.max(-1, Math.min(1, (event.clientX * 2) / viewportWidth - 1));
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
