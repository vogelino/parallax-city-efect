import { setupParallax } from "./components/parallax";

const parallax = document.querySelector(".parallax-experience");

if (parallax instanceof HTMLElement) {
  setupParallax(parallax);
}
