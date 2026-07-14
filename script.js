/* =========================================================
   GEOM-EIA · SCRIPT.JS
========================================================= */

/* =========================================================
   1. PRESENTACIÓN
========================================================= */

let currentSlide = 0;

const slides = document.querySelectorAll(".slide");
const slideCounter = document.getElementById("slideCounter");

function showSlide(index) {
  if (!slides.length) return;

  slides.forEach((slide) => {
    slide.classList.remove("active");
    slide.scrollTop = 0;
  });

  currentSlide = Math.max(
    0,
    Math.min(index, slides.length - 1)
  );

  const activeSlide = slides[currentSlide];

  activeSlide.classList.add("active");

  requestAnimationFrame(() => {
    activeSlide.scrollTop = 0;
  });

  updateSlideCounter();
  restartSlideAnimations(activeSlide);

  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([activeSlide])
      .then(() => {
        activeSlide.scrollTop = 0;
      })
      .catch((error) => {
        console.warn(
          "MathJax no pudo actualizar la diapositiva:",
          error
        );
      });
  }
}

function updateSlideCounter() {
  if (!slideCounter || !slides.length) return;

  slideCounter.textContent =
    `${currentSlide + 1} / ${slides.length}`;
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function goToSlide(index) {
  showSlide(index);
}

function restartSlideAnimations(slide) {
  if (!slide) return;

  const animatedElements = slide.querySelectorAll(
    ".draw, .appear, .delay"
  );

  animatedElements.forEach((element) => {
    element.style.animation = "none";

    void element.offsetWidth;

    element.style.animation = "";
  });
}

document.addEventListener("keydown", (event) => {
  const activeTag =
    document.activeElement?.tagName?.toLowerCase();

  const isTyping =
    activeTag === "input" ||
    activeTag === "textarea" ||
    activeTag === "select";

  if (isTyping) return;

  if (
    event.key === "ArrowRight" ||
    event.key === "PageDown"
  ) {
    nextSlide();
  }

  if (
    event.key === "ArrowLeft" ||
    event.key === "PageUp"
  ) {
    prevSlide();
  }

  if (event.key === "Home") {
    showSlide(0);
  }

  if (event.key === "End") {
    showSlide(slides.length - 1);
  }
});

/* =========================================================
   2. UTILIDADES
========================================================= */

function clamp(value, minimum, maximum) {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

function getSvgX(svgElement, event, viewBoxWidth) {
  const rect = svgElement.getBoundingClientRect();

  return (
    ((event.clientX - rect.left) / rect.width) *
    viewBoxWidth
  );
}

function getSvgPoint(
  svgElement,
  event,
  viewBoxWidth,
  viewBoxHeight
) {
  const rect = svgElement.getBoundingClientRect();

  return {
    x:
      ((event.clientX - rect.left) / rect.width) *
      viewBoxWidth,

    y:
      ((event.clientY - rect.top) / rect.height) *
      viewBoxHeight
  };
}

function renderMath(element) {
  if (!element || !window.MathJax?.typesetPromise) {
    return;
  }

  MathJax.typesetPromise([element]).catch((error) => {
    console.warn(
      "No se pudo renderizar la expresión:",
      error
    );
  });
}

/* =========================================================
   3. TARJETAS GIRATORIAS
========================================================= */

function flipCard(card) {
  if (!card) return;

  card.classList.toggle("flipped");
}

document
  .querySelectorAll(".flip-card")
  .forEach((card) => {
    card.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        flipCard(card);
      }
    });
  });

/* =========================================================
   4. SEGMENTO INTERACTIVO
========================================================= */

const simpleSegmentSvg =
  document.getElementById("simpleSegmentSvg");

const simplePointA =
  document.getElementById("simplePointA");

const simplePointB =
  document.getElementById("simplePointB");

const simpleSegmentLine =
  document.getElementById("simpleSegmentLine");

const simpleLabelA =
  document.getElementById("simpleLabelA");

const simpleLabelB =
  document.getElementById("simpleLabelB");

const simpleLengthText =
  document.getElementById("simpleLengthText");

let selectedSimplePoint = null;

const simpleSegmentSettings = {
  viewBoxWidth: 900,
  centerY: 165,
  minimumX: 150,
  maximumX: 750,
  minimumDistance: 70
};

function updateSimpleSegment() {
  if (
    !simplePointA ||
    !simplePointB ||
    !simpleSegmentLine
  ) {
    return;
  }

  const ax = Number(
    simplePointA.getAttribute("cx")
  );

  const bx = Number(
    simplePointB.getAttribute("cx")
  );

  simpleSegmentLine.setAttribute("x1", ax);
  simpleSegmentLine.setAttribute("x2", bx);

  simpleLabelA?.setAttribute("x", ax);
  simpleLabelB?.setAttribute("x", bx);

  const length = Math.abs(bx - ax);

  if (simpleLengthText) {
    simpleLengthText.textContent =
      `AB = ${length.toFixed(0)} unidades`;
  }
}

function moveSimplePoint(point, rawX) {
  if (!simplePointA || !simplePointB) return;

  const ax = Number(
    simplePointA.getAttribute("cx")
  );

  const bx = Number(
    simplePointB.getAttribute("cx")
  );

  let safeX = clamp(
    rawX,
    simpleSegmentSettings.minimumX,
    simpleSegmentSettings.maximumX
  );

  if (point === simplePointA) {
    safeX = Math.min(
      safeX,
      bx - simpleSegmentSettings.minimumDistance
    );
  }

  if (point === simplePointB) {
    safeX = Math.max(
      safeX,
      ax + simpleSegmentSettings.minimumDistance
    );
  }

  point.setAttribute("cx", safeX);
  point.setAttribute(
    "cy",
    simpleSegmentSettings.centerY
  );

  updateSimpleSegment();
}

function initializeSimpleSegment() {
  if (
    !simpleSegmentSvg ||
    !simplePointA ||
    !simplePointB
  ) {
    return;
  }

  simplePointA.addEventListener(
    "pointerdown",
    (event) => {
      selectedSimplePoint = simplePointA;

      simplePointA.setPointerCapture(
        event.pointerId
      );
    }
  );

  simplePointB.addEventListener(
    "pointerdown",
    (event) => {
      selectedSimplePoint = simplePointB;

      simplePointB.setPointerCapture(
        event.pointerId
      );
    }
  );

  simpleSegmentSvg.addEventListener(
    "pointermove",
    (event) => {
      if (!selectedSimplePoint) return;

      event.preventDefault();

      moveSimplePoint(
        selectedSimplePoint,
        getSvgX(
          simpleSegmentSvg,
          event,
          simpleSegmentSettings.viewBoxWidth
        )
      );
    }
  );

  const stopDrag = () => {
    selectedSimplePoint = null;
  };

  simpleSegmentSvg.addEventListener(
    "pointerup",
    stopDrag
  );

  simpleSegmentSvg.addEventListener(
    "pointercancel",
    stopDrag
  );

  simpleSegmentSvg.addEventListener(
    "pointerleave",
    (event) => {
      if (event.buttons === 0) {
        stopDrag();
      }
    }
  );

  updateSimpleSegment();
}

/* =========================================================
   5. PUNTO MEDIO INTERACTIVO
========================================================= */

const midpointSvg =
  document.getElementById("midpointSvg");

const midpointPointA =
  document.getElementById("midpointPointA");

const midpointPointB =
  document.getElementById("midpointPointB");

const midpointPointM =
  document.getElementById("midpointPointM");

const midpointSegmentLine =
  document.getElementById("midpointSegmentLine");

const midpointLeftHalf =
  document.getElementById("midpointLeftHalf");

const midpointRightHalf =
  document.getElementById("midpointRightHalf");

const midpointLabelA =
  document.getElementById("midpointLabelA");

const midpointLabelB =
  document.getElementById("midpointLabelB");

const midpointLabelM =
  document.getElementById("midpointLabelM");

const midpointLengthAB =
  document.getElementById("midpointLengthAB");

const midpointLengthAM =
  document.getElementById("midpointLengthAM");

const midpointLengthMB =
  document.getElementById("midpointLengthMB");

let selectedMidpointPoint = null;

const midpointSettings = {
  viewBoxWidth: 900,
  centerY: 165,
  minimumX: 150,
  maximumX: 750,
  minimumDistance: 70
};

function updateMidpointSegment() {
  if (
    !midpointPointA ||
    !midpointPointB ||
    !midpointPointM ||
    !midpointSegmentLine
  ) {
    return;
  }

  const ax = Number(
    midpointPointA.getAttribute("cx")
  );

  const bx = Number(
    midpointPointB.getAttribute("cx")
  );

  const mx = (ax + bx) / 2;
  const length = Math.abs(bx - ax);

  midpointSegmentLine.setAttribute("x1", ax);
  midpointSegmentLine.setAttribute("x2", bx);

  midpointLeftHalf?.setAttribute("x1", ax);
  midpointLeftHalf?.setAttribute("x2", mx);

  midpointRightHalf?.setAttribute("x1", mx);
  midpointRightHalf?.setAttribute("x2", bx);

  midpointPointM.setAttribute("cx", mx);
  midpointPointM.setAttribute(
    "cy",
    midpointSettings.centerY
  );

  midpointLabelA?.setAttribute("x", ax);
  midpointLabelB?.setAttribute("x", bx);
  midpointLabelM?.setAttribute("x", mx);

  midpointLengthAB.textContent =
    `AB = ${length.toFixed(0)}`;

  midpointLengthAM.textContent =
    `AM = ${(length / 2).toFixed(0)}`;

  midpointLengthMB.textContent =
    `MB = ${(length / 2).toFixed(0)}`;
}

function moveMidpointEndpoint(point, rawX) {
  if (!midpointPointA || !midpointPointB) {
    return;
  }

  const ax = Number(
    midpointPointA.getAttribute("cx")
  );

  const bx = Number(
    midpointPointB.getAttribute("cx")
  );

  let safeX = clamp(
    rawX,
    midpointSettings.minimumX,
    midpointSettings.maximumX
  );

  if (point === midpointPointA) {
    safeX = Math.min(
      safeX,
      bx - midpointSettings.minimumDistance
    );
  }

  if (point === midpointPointB) {
    safeX = Math.max(
      safeX,
      ax + midpointSettings.minimumDistance
    );
  }

  point.setAttribute("cx", safeX);
  point.setAttribute(
    "cy",
    midpointSettings.centerY
  );

  updateMidpointSegment();
}

function initializeMidpointSegment() {
  if (
    !midpointSvg ||
    !midpointPointA ||
    !midpointPointB
  ) {
    return;
  }

  midpointPointA.addEventListener(
    "pointerdown",
    (event) => {
      selectedMidpointPoint = midpointPointA;

      midpointPointA.setPointerCapture(
        event.pointerId
      );
    }
  );

  midpointPointB.addEventListener(
    "pointerdown",
    (event) => {
      selectedMidpointPoint = midpointPointB;

      midpointPointB.setPointerCapture(
        event.pointerId
      );
    }
  );

  midpointSvg.addEventListener(
    "pointermove",
    (event) => {
      if (!selectedMidpointPoint) return;

      event.preventDefault();

      moveMidpointEndpoint(
        selectedMidpointPoint,
        getSvgX(
          midpointSvg,
          event,
          midpointSettings.viewBoxWidth
        )
      );
    }
  );

  const stopDrag = () => {
    selectedMidpointPoint = null;
  };

  midpointSvg.addEventListener(
    "pointerup",
    stopDrag
  );

  midpointSvg.addEventListener(
    "pointercancel",
    stopDrag
  );

  midpointSvg.addEventListener(
    "pointerleave",
    (event) => {
      if (event.buttons === 0) {
        stopDrag();
      }
    }
  );

  updateMidpointSegment();
}

/* =========================================================
   6. CONSTRUCTOR INTERACTIVO DE ÁNGULOS
========================================================= */

const angleSvg =
  document.getElementById("angleSvg");

const angleRayA =
  document.getElementById("angleRayA");

const angleRayB =
  document.getElementById("angleRayB");

const angleVertexO =
  document.getElementById("angleVertexO");

const anglePointA =
  document.getElementById("anglePointA");

const anglePointB =
  document.getElementById("anglePointB");

const angleLabelB =
  document.getElementById("angleLabelB");

const angleArc =
  document.getElementById("angleArc");

const angleMeasureSvg =
  document.getElementById("angleMeasureSvg");

const angleMeasureText =
  document.getElementById("angleMeasureText");

const angleTypeText =
  document.getElementById("angleTypeText");

let draggingAnglePoint = false;

/*
 * El constructor se sitúa en una zona segura del SVG.
 * La longitud se reduce para impedir que B salga del panel.
 */
const angleSettings = {
  viewBoxWidth: 900,
  viewBoxHeight: 380,

  centerX: 450,
  centerY: 220,

  rayLength: 150,
  labelDistance: 178,
  arcRadius: 62,

  labelMarginX: 35,
  labelMarginY: 42
};

function classifyAngleValue(degrees) {
  const rounded = Math.round(degrees);

  if (rounded === 0) {
    return "Ángulo nulo";
  }

  if (rounded > 0 && rounded < 90) {
    return "Ángulo agudo";
  }

  if (rounded === 90) {
    return "Ángulo recto";
  }

  if (rounded > 90 && rounded < 180) {
    return "Ángulo obtuso";
  }

  return "Ángulo llano";
}

function polarPoint(
  degrees,
  radius = angleSettings.rayLength
) {
  const radians =
    (-degrees * Math.PI) / 180;

  return {
    x:
      angleSettings.centerX +
      radius * Math.cos(radians),

    y:
      angleSettings.centerY +
      radius * Math.sin(radians)
  };
}

/*
 * Ajusta también la semirrecta fija, el vértice y A.
 * Así no necesitas cambiar las coordenadas del HTML.
 */
function configureStaticAngleElements() {
  const endpointA = polarPoint(
    0,
    angleSettings.rayLength
  );

  angleRayA?.setAttribute(
    "x1",
    angleSettings.centerX
  );

  angleRayA?.setAttribute(
    "y1",
    angleSettings.centerY
  );

  angleRayA?.setAttribute(
    "x2",
    endpointA.x
  );

  angleRayA?.setAttribute(
    "y2",
    endpointA.y
  );

  angleRayB?.setAttribute(
    "x1",
    angleSettings.centerX
  );

  angleRayB?.setAttribute(
    "y1",
    angleSettings.centerY
  );

  angleVertexO?.setAttribute(
    "cx",
    angleSettings.centerX
  );

  angleVertexO?.setAttribute(
    "cy",
    angleSettings.centerY
  );

  anglePointA?.setAttribute(
    "cx",
    endpointA.x
  );

  anglePointA?.setAttribute(
    "cy",
    endpointA.y
  );

  /*
   * Reubica las etiquetas O y A aunque no tengan ID.
   */
  const labels =
    angleSvg?.querySelectorAll(".angle-label");

  labels?.forEach((label) => {
    const text = label.textContent.trim();

    if (text === "O") {
      label.setAttribute(
        "x",
        angleSettings.centerX
      );

      label.setAttribute(
        "y",
        angleSettings.centerY + 45
      );
    }

    if (text === "A") {
      label.setAttribute(
        "x",
        endpointA.x + 26
      );

      label.setAttribute(
        "y",
        endpointA.y + 6
      );
    }
  });
}

function updateAngle(degrees) {
  if (
    !angleRayB ||
    !anglePointB ||
    !angleLabelB ||
    !angleArc
  ) {
    return;
  }

  const safeDegrees = Math.round(
    clamp(degrees, 0, 180)
  );

  const endpoint = polarPoint(
    safeDegrees,
    angleSettings.rayLength
  );

  const rawLabelPoint = polarPoint(
    safeDegrees,
    angleSettings.labelDistance
  );

  /*
   * Impide que la etiqueta B toque los bordes.
   */
  const safeLabelX = clamp(
    rawLabelPoint.x,
    angleSettings.labelMarginX,
    angleSettings.viewBoxWidth -
      angleSettings.labelMarginX
  );

  const safeLabelY = clamp(
    rawLabelPoint.y,
    angleSettings.labelMarginY,
    angleSettings.viewBoxHeight -
      angleSettings.labelMarginY
  );

  angleRayB.setAttribute(
    "x1",
    angleSettings.centerX
  );

  angleRayB.setAttribute(
    "y1",
    angleSettings.centerY
  );

  angleRayB.setAttribute("x2", endpoint.x);
  angleRayB.setAttribute("y2", endpoint.y);

  anglePointB.setAttribute("cx", endpoint.x);
  anglePointB.setAttribute("cy", endpoint.y);

  angleLabelB.setAttribute("x", safeLabelX);
  angleLabelB.setAttribute("y", safeLabelY);

  const arcStart = polarPoint(
    0,
    angleSettings.arcRadius
  );

  const arcEnd = polarPoint(
    safeDegrees,
    angleSettings.arcRadius
  );

  if (safeDegrees === 0) {
    angleArc.setAttribute("d", "");
  } else {
    const path = [
      "M",
      arcStart.x,
      arcStart.y,
      "A",
      angleSettings.arcRadius,
      angleSettings.arcRadius,
      0,
      0,
      0,
      arcEnd.x,
      arcEnd.y
    ].join(" ");

    angleArc.setAttribute("d", path);
  }

  const classification =
    classifyAngleValue(safeDegrees);

  if (angleMeasureSvg) {
    angleMeasureSvg.textContent =
      `${safeDegrees}°`;

    /*
     * Mantiene la medida dentro del SVG.
     */
    angleMeasureSvg.setAttribute(
      "x",
      angleSettings.centerX
    );

    angleMeasureSvg.setAttribute(
      "y",
      350
    );
  }

  if (angleMeasureText) {
    angleMeasureText.textContent =
      `${safeDegrees}°`;
  }

  if (angleTypeText) {
    angleTypeText.textContent =
      classification;
  }
}

function setAngle(degrees) {
  updateAngle(degrees);
}

function initializeAngleBuilder() {
  if (!angleSvg || !anglePointB) return;

  configureStaticAngleElements();

  anglePointB.addEventListener(
    "pointerdown",
    (event) => {
      draggingAnglePoint = true;

      anglePointB.setPointerCapture(
        event.pointerId
      );
    }
  );

  angleSvg.addEventListener(
    "pointermove",
    (event) => {
      if (!draggingAnglePoint) return;

      event.preventDefault();

      const point = getSvgPoint(
        angleSvg,
        event,
        angleSettings.viewBoxWidth,
        angleSettings.viewBoxHeight
      );

      const dx =
        point.x - angleSettings.centerX;

      const dy =
        angleSettings.centerY - point.y;

      let degrees =
        Math.atan2(dy, dx) *
        (180 / Math.PI);

      /*
       * Si el puntero baja por debajo del eje horizontal,
       * se conserva el extremo más cercano: 0° o 180°.
       */
      if (point.y > angleSettings.centerY) {
        degrees =
          point.x >= angleSettings.centerX
            ? 0
            : 180;
      }

      degrees = clamp(degrees, 0, 180);

      updateAngle(degrees);
    }
  );

  const stopDrag = () => {
    draggingAnglePoint = false;
  };

  angleSvg.addEventListener(
    "pointerup",
    stopDrag
  );

  angleSvg.addEventListener(
    "pointercancel",
    stopDrag
  );

  angleSvg.addEventListener(
    "pointerleave",
    (event) => {
      if (event.buttons === 0) {
        stopDrag();
      }
    }
  );

  updateAngle(40);
}

/* =========================================================
   7. ACTIVIDAD DE CLASIFICACIÓN
========================================================= */

function classifyAngleInput() {
  const input =
    document.getElementById("angleInput");

  const answer =
    document.getElementById("angleAnswer");

  if (!input || !answer) return;

  const value = Number(input.value);

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 180
  ) {
    answer.innerHTML = `
      <strong>Revisa la medida.</strong>
      Debe estar entre
      \\(0^\\circ\\) y
      \\(180^\\circ\\).
    `;

    renderMath(answer);
    return;
  }

  const classification =
    classifyAngleValue(value);

  answer.innerHTML = `
    El ángulo de
    \\(${value}^\\circ\\)
    se clasifica como
    <strong>
      ${classification.toLowerCase()}
    </strong>.
  `;

  renderMath(answer);
}

const angleInput =
  document.getElementById("angleInput");

angleInput?.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      classifyAngleInput();
    }
  }
);

/* =========================================================
   8. INICIALIZACIÓN
========================================================= */

function initializeApp() {
  initializeSimpleSegment();
  initializeMidpointSegment();
  initializeAngleBuilder();

  showSlide(0);
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );
} else {
  initializeApp();
}
/* DIAPOSITIVA 2 (TRIÁNGULOS) /*
function restartTriangleAnimation(){

const svg=document.getElementById("triangleDefinition");

if(!svg)return;

const clone=svg.cloneNode(true);

svg.parentNode.replaceChild(clone,svg);

}
/* =========================================================
   ELEMENTOS DEL TRIÁNGULO
========================================================= */

function highlightTriangleElements(type, button) {
  const layout = document.querySelector(
    ".triangle-elements-layout"
  );

  const description = document.getElementById(
    "triangleElementDescription"
  );

  if (!layout || !description) {
    return;
  }

  layout.classList.remove(
    "show-all",
    "show-vertices",
    "show-sides",
    "show-angles"
  );

  layout.classList.add(`show-${type}`);

  document
    .querySelectorAll(".element-selector")
    .forEach((selector) => {
      selector.classList.remove("active");
    });

  button?.classList.add("active");

  const descriptions = {
    all: `
      <strong>\\(\\triangle ABC\\)</strong>

      <p>
        Está formado por tres vértices, tres lados
        y tres ángulos interiores.
      </p>
    `,

    vertices: `
      <strong>Vértices</strong>

      <p>
        Los vértices son los puntos
        \\(A\\), \\(B\\) y \\(C\\).
      </p>
    `,

    sides: `
      <strong>Lados</strong>

      <p>
        Los lados son los segmentos
        \\(\\overline{AB}\\),
        \\(\\overline{BC}\\) y
        \\(\\overline{CA}\\).
      </p>
    `,

    angles: `
      <strong>Ángulos interiores</strong>

      <p>
        Los ángulos interiores están determinados
        por cada par de lados que se encuentran
        en un vértice.
      </p>
    `
  };

  description.innerHTML = descriptions[type];

  renderMath(description);
}
