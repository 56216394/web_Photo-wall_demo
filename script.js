const viewport = document.querySelector("[data-viewport]");
const board = document.querySelector("[data-board]");
const resetButton = document.querySelector("[data-reset]");

let pan = { x: 0, y: 0 };
let drag = null;

function render() {
  board.style.setProperty("--pan-x", `${pan.x}px`);
  board.style.setProperty("--pan-y", `${pan.y}px`);
}

function clampPan() {
  pan.x = Math.max(-760, Math.min(760, pan.x));
  pan.y = Math.max(-620, Math.min(520, pan.y));
}

function startDrag(event) {
  if (window.matchMedia("(max-width: 760px)").matches) return;
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: pan.x,
    originY: pan.y,
  };
  document.body.classList.add("is-dragging");
  viewport.setPointerCapture(event.pointerId);
}

function moveDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  pan.x = drag.originX + event.clientX - drag.startX;
  pan.y = drag.originY + event.clientY - drag.startY;
  clampPan();
  render();
}

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag = null;
  document.body.classList.remove("is-dragging");
  if (viewport.hasPointerCapture(event.pointerId)) {
    viewport.releasePointerCapture(event.pointerId);
  }
}

viewport.addEventListener("pointerdown", startDrag);
viewport.addEventListener("pointermove", moveDrag);
viewport.addEventListener("pointerup", endDrag);
viewport.addEventListener("pointercancel", endDrag);

viewport.addEventListener(
  "wheel",
  (event) => {
    if (window.matchMedia("(max-width: 760px)").matches) return;
    event.preventDefault();
    pan.x -= event.deltaX || event.deltaY * 0.85;
    pan.y -= event.deltaY * 0.45;
    clampPan();
    render();
  },
  { passive: false },
);

resetButton.addEventListener("click", () => {
  pan = { x: 0, y: 0 };
  render();
});

render();
