let currentSlide = 0;

const slides = document.querySelectorAll(".slide");
const counter = document.getElementById("slideCounter");

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));

  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  slides[currentSlide].classList.add("active");

  counter.textContent = `${currentSlide + 1} / ${slides.length}`;

  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowRight") nextSlide();
  if (event.key === "ArrowLeft") prevSlide();
});

function flipCard(card) {
  card.classList.toggle("flipped");
}

/* Segmento interactivo */

const svg = document.getElementById("segmentSvg");
const pointA = document.getElementById("pointA");
const pointB = document.getElementById("pointB");
const pointM = document.getElementById("pointM");
const segmentLine = document.getElementById("segmentLine");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const labelM = document.getElementById("labelM");
const lengthText = document.getElementById("lengthText");

let selectedPoint = null;

const minX = 140;
const maxX = 760;
const centerY = 165;

function svgMousePosition(event) {
  const rect = svg.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * 900,
    y: ((event.clientY - rect.top) / rect.height) * 330
  };
}

function updateSegment() {
  const ax = Number(pointA.getAttribute("cx"));
  const bx = Number(pointB.getAttribute("cx"));
  const mx = (ax + bx) / 2;

  segmentLine.setAttribute("x1", ax);
  segmentLine.setAttribute("x2", bx);

  pointM.setAttribute("cx", mx);

  labelA.setAttribute("x", ax);
  labelB.setAttribute("x", bx);
  labelM.setAttribute("x", mx);

  const length = Math.abs(bx - ax);
  lengthText.textContent = `AB = ${length.toFixed(0)} unidades`;
}

function movePoint(point, x) {
  const safeX = Math.max(minX, Math.min(maxX, x));

  point.setAttribute("cx", safeX);
  point.setAttribute("cy", centerY);

  updateSegment();
}

function startDrag(point) {
  selectedPoint = point;
}

function stopDrag() {
  selectedPoint = null;
}

if (svg) {
  pointA.addEventListener("mousedown", () => startDrag(pointA));
  pointB.addEventListener("mousedown", () => startDrag(pointB));

  svg.addEventListener("mousemove", event => {
    if (!selectedPoint) return;
    const { x } = svgMousePosition(event);
    movePoint(selectedPoint, x);
  });

  window.addEventListener("mouseup", stopDrag);

  pointA.addEventListener("touchstart", () => startDrag(pointA));
  pointB.addEventListener("touchstart", () => startDrag(pointB));

  svg.addEventListener("touchmove", event => {
    if (!selectedPoint) return;

    event.preventDefault();
    const touch = event.touches[0];
    const { x } = svgMousePosition(touch);

    movePoint(selectedPoint, x);
  });

  window.addEventListener("touchend", stopDrag);

  updateSegment();
}

/* Calculadora */

function calculateMidpoint() {
  const input = document.getElementById("inputAB");
  const answer = document.getElementById("midpointAnswer");

  const ab = Number(input.value);

  if (!ab || ab <= 0) {
    answer.innerHTML = "Escribe una longitud positiva.";
    return;
  }

  answer.innerHTML = `
    Si \\(AB = ${ab}\\), entonces:
    \\[
      AM = MB = \\frac{${ab}}{2} = ${ab / 2}
    \\]
  `;

  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}

showSlide(0);
