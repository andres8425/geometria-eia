/* =========================================================
   NAVEGACIÓN DE LA PRESENTACIÓN
========================================================= */

let currentSlide = 0;

const slides = document.querySelectorAll(".slide");
const counter = document.getElementById("slideCounter");

function showSlide(index) {
  if (!slides.length) return;

  slides.forEach((slide) => {
    slide.classList.remove("active");
  });

  currentSlide = Math.max(0, Math.min(index, slides.length - 1));

  const activeSlide = slides[currentSlide];
  activeSlide.classList.add("active");

  if (counter) {
    counter.textContent = `${currentSlide + 1} / ${slides.length}`;
  }

  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([activeSlide]).catch((error) => {
      console.warn("MathJax no pudo actualizar la diapositiva:", error);
    });
  }
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextSlide();
  }

  if (event.key === "ArrowLeft") {
    prevSlide();
  }
});

/* =========================================================
   TARJETAS GIRATORIAS
========================================================= */

function flipCard(card) {
  if (!card) return;
  card.classList.toggle("flipped");
}

/* =========================================================
   SEGMENTO INTERACTIVO SIN PUNTO MEDIO
========================================================= */

const simpleSvg = document.getElementById("simpleSegmentSvg");
const simplePointA = document.getElementById("simplePointA");
const simplePointB = document.getElementById("simplePointB");
const simpleLine = document.getElementById("simpleSegmentLine");
const simpleLabelA = document.getElementById("simpleLabelA");
const simpleLabelB = document.getElementById("simpleLabelB");
const simpleLengthText = document.getElementById("simpleLengthText");

let selectedSimplePoint = null;

const SVG_WIDTH = 900;
const SIMPLE_MIN_X = 150;
const SIMPLE_MAX_X = 750;
const SIMPLE_CENTER_Y = 165;
const MIN_DISTANCE = 70;

function getSvgX(svgElement, event) {
  const rect = svgElement.getBoundingClientRect();

  return ((event.clientX - rect.left) / rect.width) * SVG_WIDTH;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function updateSimpleSegment() {
  if (
    !simplePointA ||
    !simplePointB ||
    !simpleLine ||
    !simpleLabelA ||
    !simpleLabelB
  ) {
    return;
  }

  const ax = Number(simplePointA.getAttribute("cx"));
  const bx = Number(simplePointB.getAttribute("cx"));

  simpleLine.setAttribute("x1", ax);
  simpleLine.setAttribute("x2", bx);

  simpleLabelA.setAttribute("x", ax);
  simpleLabelB.setAttribute("x", bx);

  const length = Math.abs(bx - ax);

  if (simpleLengthText) {
    simpleLengthText.textContent = `AB = ${length.toFixed(0)} unidades`;
  }
}

function moveSimplePoint(point, rawX) {
  if (!point || !simplePointA || !simplePointB) return;

  const ax = Number(simplePointA.getAttribute("cx"));
  const bx = Number(simplePointB.getAttribute("cx"));

  let safeX = clamp(rawX, SIMPLE_MIN_X, SIMPLE_MAX_X);

  if (point === simplePointA) {
    safeX = Math.min(safeX, bx - MIN_DISTANCE);
  }

  if (point === simplePointB) {
    safeX = Math.max(safeX, ax + MIN_DISTANCE);
  }

  point.setAttribute("cx", safeX);
  point.setAttribute("cy", SIMPLE_CENTER_Y);

  updateSimpleSegment();
}

function initializeSimpleSegment() {
  if (!simpleSvg || !simplePointA || !simplePointB) return;

  simplePointA.addEventListener("pointerdown", (event) => {
    selectedSimplePoint = simplePointA;
    simplePointA.setPointerCapture(event.pointerId);
  });

  simplePointB.addEventListener("pointerdown", (event) => {
    selectedSimplePoint = simplePointB;
    simplePointB.setPointerCapture(event.pointerId);
  });

  simpleSvg.addEventListener("pointermove", (event) => {
    if (!selectedSimplePoint) return;

    event.preventDefault();

    const x = getSvgX(simpleSvg, event);
    moveSimplePoint(selectedSimplePoint, x);
  });

  simpleSvg.addEventListener("pointerup", () => {
    selectedSimplePoint = null;
  });

  simpleSvg.addEventListener("pointercancel", () => {
    selectedSimplePoint = null;
  });

  updateSimpleSegment();
}

/* =========================================================
   SEGMENTO INTERACTIVO CON PUNTO MEDIO
========================================================= */

const midpointSvg = document.getElementById("midpointSvg");
const midpointPointA = document.getElementById("midpointPointA");
const midpointPointB = document.getElementById("midpointPointB");
const midpointPointM = document.getElementById("midpointPointM");

const midpointLine = document.getElementById("midpointSegmentLine");
const midpointLeftHalf = document.getElementById("midpointLeftHalf");
const midpointRightHalf = document.getElementById("midpointRightHalf");

const midpointLabelA = document.getElementById("midpointLabelA");
const midpointLabelB = document.getElementById("midpointLabelB");
const midpointLabelM = document.getElementById("midpointLabelM");

const midpointLengthAB = document.getElementById("midpointLengthAB");
const midpointLengthAM = document.getElementById("midpointLengthAM");
const midpointLengthMB = document.getElementById("midpointLengthMB");

let selectedMidpointPoint = null;

const MIDPOINT_MIN_X = 150;
const MIDPOINT_MAX_X = 750;
const MIDPOINT_CENTER_Y = 165;

function updateMidpointSegment() {
  if (
    !midpointPointA ||
    !midpointPointB ||
    !midpointPointM ||
    !midpointLine
  ) {
    return;
  }

  const ax = Number(midpointPointA.getAttribute("cx"));
  const bx = Number(midpointPointB.getAttribute("cx"));
  const mx = (ax + bx) / 2;

  midpointLine.setAttribute("x1", ax);
  midpointLine.setAttribute("x2", bx);

  if (midpointLeftHalf) {
    midpointLeftHalf.setAttribute("x1", ax);
    midpointLeftHalf.setAttribute("x2", mx);
  }

  if (midpointRightHalf) {
    midpointRightHalf.setAttribute("x1", mx);
    midpointRightHalf.setAttribute("x2", bx);
  }

  midpointPointM.setAttribute("cx", mx);
  midpointPointM.setAttribute("cy", MIDPOINT_CENTER_Y);

  midpointLabelA?.setAttribute("x", ax);
  midpointLabelB?.setAttribute("x", bx);
  midpointLabelM?.setAttribute("x", mx);

  const ab = Math.abs(bx - ax);
  const am = ab / 2;
  const mb = ab / 2;

  if (midpointLengthAB) {
    midpointLengthAB.textContent = `AB = ${ab.toFixed(0)}`;
  }

  if (midpointLengthAM) {
    midpointLengthAM.textContent = `AM = ${am.toFixed(0)}`;
  }

  if (midpointLengthMB) {
    midpointLengthMB.textContent = `MB = ${mb.toFixed(0)}`;
  }
}

function moveMidpointEndpoint(point, rawX) {
  if (!point || !midpointPointA || !midpointPointB) return;

  const ax = Number(midpointPointA.getAttribute("cx"));
  const bx = Number(midpointPointB.getAttribute("cx"));

  let safeX = clamp(rawX, MIDPOINT_MIN_X, MIDPOINT_MAX_X);

  if (point === midpointPointA) {
    safeX = Math.min(safeX, bx - MIN_DISTANCE);
  }

  if (point === midpointPointB) {
    safeX = Math.max(safeX, ax + MIN_DISTANCE);
  }

  point.setAttribute("cx", safeX);
  point.setAttribute("cy", MIDPOINT_CENTER_Y);

  updateMidpointSegment();
}

function initializeMidpointSegment() {
  if (!midpointSvg || !midpointPointA || !midpointPointB) return;

  midpointPointA.addEventListener("pointerdown", (event) => {
    selectedMidpointPoint = midpointPointA;
    midpointPointA.setPointerCapture(event.pointerId);
  });

  midpointPointB.addEventListener("pointerdown", (event) => {
    selectedMidpointPoint = midpointPointB;
    midpointPointB.setPointerCapture(event.pointerId);
  });

  midpointSvg.addEventListener("pointermove", (event) => {
    if (!selectedMidpointPoint) return;

    event.preventDefault();

    const x = getSvgX(midpointSvg, event);
    moveMidpointEndpoint(selectedMidpointPoint, x);
  });

  midpointSvg.addEventListener("pointerup", () => {
    selectedMidpointPoint = null;
  });

  midpointSvg.addEventListener("pointercancel", () => {
    selectedMidpointPoint = null;
  });

  updateMidpointSegment();
}

/* =========================================================
   CALCULADORA DE PUNTO MEDIO
========================================================= */

function calculateMidpoint() {
  const input = document.getElementById("inputAB");
  const answer = document.getElementById("midpointAnswer");

  if (!input || !answer) return;

  const ab = Number(input.value);

  if (!Number.isFinite(ab) || ab <= 0) {
    answer.innerHTML =
      '<span class="answer-error">Escribe una longitud positiva.</span>';
    return;
  }

  const half = ab / 2;

  answer.innerHTML = `
    <p>Como \\(M\\) es el punto medio de \\(\\overline{AB}\\), entonces:</p>
    \\[
      AM = MB = \\frac{AB}{2}
      = \\frac{${ab}}{2}
      = ${half}
    \\]
  `;

  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([answer]).catch((error) => {
      console.warn("No se pudo renderizar la respuesta:", error);
    });
  }
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */

initializeSimpleSegment();
initializeMidpointSegment();
showSlide(0);
