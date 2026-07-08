const svg = document.getElementById("segmentCanvas");
const pointA = document.getElementById("pointA");
const pointB = document.getElementById("pointB");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const lengthText = document.getElementById("lengthText");

let selectedPoint = null;

function getMousePosition(event) {
  const rect = svg.getBoundingClientRect();

  const x = ((event.clientX - rect.left) / rect.width) * 800;
  const y = ((event.clientY - rect.top) / rect.height) * 260;

  return { x, y };
}

function updateLength() {
  const ax = Number(pointA.getAttribute("cx"));
  const bx = Number(pointB.getAttribute("cx"));

  const length = Math.abs(bx - ax);

  lengthText.textContent = `AB = ${length.toFixed(0)} unidades`;
}

function movePoint(point, label, x) {
  const minX = 80;
  const maxX = 720;

  x = Math.max(minX, Math.min(maxX, x));

  point.setAttribute("cx", x);
  label.setAttribute("x", x);

  updateLength();
}

pointA.addEventListener("mousedown", () => {
  selectedPoint = "A";
});

pointB.addEventListener("mousedown", () => {
  selectedPoint = "B";
});

svg.addEventListener("mousemove", (event) => {
  if (!selectedPoint) return;

  const { x } = getMousePosition(event);

  if (selectedPoint === "A") {
    movePoint(pointA, labelA, x);
  }

  if (selectedPoint === "B") {
    movePoint(pointB, labelB, x);
  }
});

window.addEventListener("mouseup", () => {
  selectedPoint = null;
});

updateLength();
