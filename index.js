function updateParallax(x, y) {
  document.documentElement.style.setProperty("--mouse-x", x);
  document.documentElement.style.setProperty("--mouse-y", y);
}

let rafId;

document.addEventListener("mousemove", (e) => {
  cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

    updateParallax(x, y);
  });
});
