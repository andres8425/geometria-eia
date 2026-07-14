/* =========================================================
   GEOM-EIA
   SCRIPT.JS GENERAL

   Incluye:
   - motor de diapositivas;
   - navegación por teclado;
   - tarjetas giratorias;
   - segmento interactivo;
   - punto medio interactivo;
   - constructor de ángulos;
   - actividad de clasificación;
   - reinicio de animaciones.
========================================================= */

/* =========================================================
   1. MOTOR DE DIAPOSITIVAS
========================================================= */

let currentSlide = 0;

const slides = document.querySelectorAll(".slide");
const slideCounter = document.getElementById("slideCounter");

/**
 * Muestra una diapositiva y oculta las demás.
 *
 * @param {number} index Índice de la diapositiva.
 */
function showSlide(index) {
  if (!slides.length) {
    return;
  }

  slides.forEach((slide) => {
    slide.classList.remove("active");

    /*
     * Evita que una diapositiva conserve una posición de
     * desplazamiento anterior.
     */
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

  /*
   * MathJax renderiza únicamente la diapositiva activa.
   */
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

  restartSlideAnimations(activeSlide);
}

/**
 * Actualiza el contador inferior.
 */
function updateSlideCounter() {
  if (!slideCounter || !slides.length) {
    return;
  }

  slideCounter.textContent =
    `${currentSlide + 1} / ${slides.length}`;
}

/**
 * Avanza una diapositiva.
 */
function nextSlide() {
  showSlide(currentSlide + 1);
}

/**
 * Retrocede una diapositiva.
 */
function prevSlide() {
  showSlide(currentSlide - 1);
}

/**
 * Salta directamente a una diapositiva.
 *
 * @param {number} index Índice de destino.
 */
function goToSlide(index) {
  showSlide(index);
}

/**
 * Reinicia las animaciones CSS de la diapositiva activa.
 *
 * @param {HTMLElement} slide Diapositiva activa.
 */
function restartSlideAnimations(slide) {
  if (!slide) {
    return;
  }

  const animatedElements = slide.querySelectorAll(
    ".draw, .appear, .delay"
  );

  animatedElements.forEach((element) => {
    const animationName =
      window.getComputedStyle(element).animationName;

    element.style.animation = "none";

    /*
     * Fuerza al navegador a recalcular el estilo.
     */
    void element.offsetWidth;

    element.style.animation = "";

    if (animationName === "none") {
      element.removeAttribute("style");
    }
  });
}

/* Navegación con teclado */

document.addEventListener("keydown", (event) => {
  const activeTag =
    document.activeElement?.tagName?.toLowerCase();

  const isTyping =
    activeTag === "input" ||
    activeTag === "textarea" ||
    activeTag === "select";

  if (isTyping) {
    return;
  }

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

/**
 * Restringe un valor a un intervalo.
 *
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
function clamp(value, minimum, maximum) {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

/**
 * Convierte la coordenada horizontal del puntero
 * al sistema de coordenadas de un SVG.
 *
 * @param {SVGElement} svgElement
 * @param {PointerEvent} event
 * @param {number} viewBoxWidth
 * @returns {number}
 */
function getSvgX(
  svgElement,
  event,
  viewBoxWidth
) {
  const rect =
    svgElement.getBoundingClientRect();

  return (
    (event.clientX - rect.left) /
    rect.width
  ) * viewBoxWidth;
}

/**
 * Convierte el puntero al sistema de coordenadas
 * completo de un SVG.
 *
 * @param {SVGElement} svgElement
 * @param {PointerEvent} event
 * @param {number} viewBoxWidth
 * @param {number} viewBoxHeight
 * @returns {{x:number,y:number}}
 */
function getSvgPoint(
  svgElement,
  event,
  viewBoxWidth,
  viewBoxHeight
) {
  const rect =
    svgElement.getBoundingClientRect();

  return {
    x:
      ((event.clientX - rect.left) /
        rect.width) *
      viewBoxWidth,

    y:
      ((event.clientY - rect.top) /
        rect.height) *
      viewBoxHeight
  };
}

/* =========================================================
   3. TARJETAS GIRATORIAS
========================================================= */

/**
 * Gira una tarjeta.
 *
 * @param {HTMLElement} card
 */
function flipCard(card) {
  if (!card) {
    return;
  }

  card.classList.toggle("flipped");
}

/*
 * Permite activar las tarjetas con Enter o espacio
 * sin necesidad de escribir eventos inline.
 */
document
  .querySelectorAll(".flip-card")
  .forEach((card) => {
    card.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          flipCard(card);
        }
      }
    );
  });

/* =========================================================
   4. SEGMENTO INTERACTIVO
========================================================= */

const simpleSegmentSvg =
  document.getElementById(
    "simpleSegmentSvg"
  );

const simplePointA =
  document.getElementById(
    "simplePointA"
  );

const simplePointB =
  document.getElementById(
    "simplePointB"
  );

const simpleSegmentLine =
  document.getElementById(
    "simpleSegmentLine"
  );

const simpleLabelA =
  document.getElementById(
    "simpleLabelA"
  );

const simpleLabelB =
  document.getElementById(
    "simpleLabelB"
  );

const simpleLengthText =
  document.getElementById(
    "simpleLengthText"
  );

let selectedSimplePoint = null;

const simpleSegmentSettings = {
  viewBoxWidth: 900,
  centerY: 165,
  minimumX: 150,
  maximumX: 750,
  minimumDistance: 70
};

/**
 * Actualiza línea, etiquetas y longitud.
 */
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

  simpleSegmentLine.setAttribute(
    "x1",
    ax
  );

  simpleSegmentLine.setAttribute(
    "x2",
    bx
  );

  simpleLabelA?.setAttribute(
    "x",
    ax
  );

  simpleLabelB?.setAttribute(
    "x",
    bx
  );

  const length = Math.abs(bx - ax);

  if (simpleLengthText) {
    simpleLengthText.textContent =
      `AB = ${length.toFixed(0)} unidades`;
  }
}

/**
 * Mueve uno de los extremos sin permitir que
 * los puntos se crucen ni abandonen la línea.
 *
 * @param {SVGCircleElement} point
 * @param {number} rawX
 */
function moveSimplePoint(
  point,
  rawX
) {
  if (
    !simplePointA ||
    !simplePointB
  ) {
    return;
  }

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
      bx -
        simpleSegmentSettings.minimumDistance
    );
  }

  if (point === simplePointB) {
    safeX = Math.max(
      safeX,
      ax +
        simpleSegmentSettings.minimumDistance
    );
  }

  point.setAttribute(
    "cx",
    safeX
  );

  point.setAttribute(
    "cy",
    simpleSegmentSettings.centerY
  );

  updateSimpleSegment();
}

/**
 * Inicializa el segmento interactivo.
 */
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
      selectedSimplePoint =
        simplePointA;

      simplePointA.setPointerCapture(
        event.pointerId
      );
    }
  );

  simplePointB.addEventListener(
    "pointerdown",
    (event) => {
      selectedSimplePoint =
        simplePointB;

      simplePointB.setPointerCapture(
        event.pointerId
      );
    }
  );

  simpleSegmentSvg.addEventListener(
    "pointermove",
    (event) => {
      if (!selectedSimplePoint) {
        return;
      }

      event.preventDefault();

      const x = getSvgX(
        simpleSegmentSvg,
        event,
        simpleSegmentSettings
          .viewBoxWidth
      );

      moveSimplePoint(
        selectedSimplePoint,
        x
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
      if (
        event.buttons === 0
      ) {
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
  document.getElementById(
    "midpointSvg"
  );

const midpointPointA =
  document.getElementById(
    "midpointPointA"
  );

const midpointPointB =
  document.getElementById(
    "midpointPointB"
  );

const midpointPointM =
  document.getElementById(
    "midpointPointM"
  );

const midpointSegmentLine =
  document.getElementById(
    "midpointSegmentLine"
  );

const midpointLeftHalf =
  document.getElementById(
    "midpointLeftHalf"
  );

const midpointRightHalf =
  document.getElementById(
    "midpointRightHalf"
  );

const midpointLabelA =
  document.getElementById(
    "midpointLabelA"
  );

const midpointLabelB =
  document.getElementById(
    "midpointLabelB"
  );

const midpointLabelM =
  document.getElementById(
    "midpointLabelM"
  );

const midpointLengthAB =
  document.getElementById(
    "midpointLengthAB"
  );

const midpointLengthAM =
  document.getElementById(
    "midpointLengthAM"
  );

const midpointLengthMB =
  document.getElementById(
    "midpointLengthMB"
  );

let selectedMidpointPoint = null;

const midpointSettings = {
  viewBoxWidth: 900,
  centerY: 165,
  minimumX: 150,
  maximumX: 750,
  minimumDistance: 70
};

/**
 * Actualiza el segmento y calcula M.
 */
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

  midpointSegmentLine.setAttribute(
    "x1",
    ax
  );

  midpointSegmentLine.setAttribute(
    "x2",
    bx
  );

  midpointLeftHalf?.setAttribute(
    "x1",
    ax
  );

  midpointLeftHalf?.setAttribute(
    "x2",
    mx
  );

  midpointRightHalf?.setAttribute(
    "x1",
    mx
  );

  midpointRightHalf?.setAttribute(
    "x2",
    bx
  );

  midpointPointM.setAttribute(
    "cx",
    mx
  );

  midpointPointM.setAttribute(
    "cy",
    midpointSettings.centerY
  );

  midpointLabelA?.setAttribute(
    "x",
    ax
  );

  midpointLabelB?.setAttribute(
    "x",
    bx
  );

  midpointLabelM?.setAttribute(
    "x",
    mx
  );

  if (midpointLengthAB) {
    midpointLengthAB.textContent =
      `AB = ${length.toFixed(0)}`;
  }

  if (midpointLengthAM) {
    midpointLengthAM.textContent =
      `AM = ${(length / 2).toFixed(0)}`;
  }

  if (midpointLengthMB) {
    midpointLengthMB.textContent =
      `MB = ${(length / 2).toFixed(0)}`;
  }
}

/**
 * Mueve un extremo y conserva el punto medio.
 *
 * @param {SVGCircleElement} point
 * @param {number} rawX
 */
function moveMidpointEndpoint(
  point,
  rawX
) {
  if (
    !midpointPointA ||
    !midpointPointB
  ) {
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
      bx -
        midpointSettings.minimumDistance
    );
  }

  if (point === midpointPointB) {
    safeX = Math.max(
      safeX,
      ax +
        midpointSettings.minimumDistance
    );
  }

  point.setAttribute(
    "cx",
    safeX
  );

  point.setAttribute(
    "cy",
    midpointSettings.centerY
  );

  updateMidpointSegment();
}

/**
 * Inicializa la construcción del punto medio.
 */
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
      selectedMidpointPoint =
        midpointPointA;

      midpointPointA.setPointerCapture(
        event.pointerId
      );
    }
  );

  midpointPointB.addEventListener(
    "pointerdown",
    (event) => {
      selectedMidpointPoint =
        midpointPointB;

      midpointPointB.setPointerCapture(
        event.pointerId
      );
    }
  );

  midpointSvg.addEventListener(
    "pointermove",
    (event) => {
      if (!selectedMidpointPoint) {
        return;
      }

      event.preventDefault();

      const x = getSvgX(
        midpointSvg,
        event,
        midpointSettings.viewBoxWidth
      );

      moveMidpointEndpoint(
        selectedMidpointPoint,
        x
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
      if (
        event.buttons === 0
      ) {
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
  document.getElementById(
    "angleSvg"
  );

const angleRayB =
  document.getElementById(
    "angleRayB"
  );

const anglePointB =
  document.getElementById(
    "anglePointB"
  );

const angleLabelB =
  document.getElementById(
    "angleLabelB"
  );

const angleArc =
  document.getElementById(
    "angleArc"
  );

const angleMeasureSvg =
  document.getElementById(
    "angleMeasureSvg"
  );

const angleMeasureText =
  document.getElementById(
    "angleMeasureText"
  );

const angleTypeText =
  document.getElementById(
    "angleTypeText"
  );

let draggingAnglePoint = false;

const angleSettings = {
  viewBoxWidth: 900,
  viewBoxHeight: 380,
  centerX: 450,
  centerY: 210,
  rayLength: 250,
  arcRadius: 75
};

/**
 * Clasifica un ángulo entre 0° y 180°.
 *
 * @param {number} degrees
 * @returns {string}
 */
function classifyAngleValue(degrees) {
  const rounded =
    Math.round(degrees);

  if (rounded === 0) {
    return "Ángulo nulo";
  }

  if (
    rounded > 0 &&
    rounded < 90
  ) {
    return "Ángulo agudo";
  }

  if (rounded === 90) {
    return "Ángulo recto";
  }

  if (
    rounded > 90 &&
    rounded < 180
  ) {
    return "Ángulo obtuso";
  }

  return "Ángulo llano";
}

/**
 * Calcula un punto mediante coordenadas polares.
 *
 * El signo negativo permite que los ángulos positivos
 * se dibujen visualmente hacia arriba.
 *
 * @param {number} degrees
 * @param {number} radius
 * @returns {{x:number,y:number}}
 */
function polarPoint(
  degrees,
  radius =
    angleSettings.rayLength
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

/**
 * Actualiza la posición de B, el segundo lado,
 * el arco y la clasificación.
 *
 * @param {number} degrees
 */
function updateAngle(degrees) {
  if (
    !angleRayB ||
    !anglePointB ||
    !angleLabelB ||
    !angleArc
  ) {
    return;
  }

  const safeDegrees =
    Math.round(
      clamp(
        degrees,
        0,
        180
      )
    );

  const endpoint =
    polarPoint(safeDegrees);

  const labelPoint =
    polarPoint(
      safeDegrees,
      angleSettings.rayLength + 30
    );

  angleRayB.setAttribute(
    "x2",
    endpoint.x
  );

  angleRayB.setAttribute(
    "y2",
    endpoint.y
  );

  anglePointB.setAttribute(
    "cx",
    endpoint.x
  );

  anglePointB.setAttribute(
    "cy",
    endpoint.y
  );

  angleLabelB.setAttribute(
    "x",
    labelPoint.x
  );

  angleLabelB.setAttribute(
    "y",
    labelPoint.y
  );

  const arcStart =
    polarPoint(
      0,
      angleSettings.arcRadius
    );

  const arcEnd =
    polarPoint(
      safeDegrees,
      angleSettings.arcRadius
    );

  if (safeDegrees === 0) {
    angleArc.setAttribute(
      "d",
      ""
    );
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

    angleArc.setAttribute(
      "d",
      path
    );
  }

  const classification =
    classifyAngleValue(
      safeDegrees
    );

  if (angleMeasureSvg) {
    angleMeasureSvg.textContent =
      `${safeDegrees}°`;
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

/**
 * Construye un ángulo preestablecido.
 *
 * @param {number} degrees
 */
function setAngle(degrees) {
  updateAngle(degrees);
}

/**
 * Inicializa la interacción del constructor.
 */
function initializeAngleBuilder() {
  if (
    !angleSvg ||
    !anglePointB
  ) {
    return;
  }

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
      if (!draggingAnglePoint) {
        return;
      }

      event.preventDefault();

      const point = getSvgPoint(
        angleSvg,
        event,
        angleSettings.viewBoxWidth,
        angleSettings.viewBoxHeight
      );

      const dx =
        point.x -
        angleSettings.centerX;

      const dy =
        angleSettings.centerY -
        point.y;

      let degrees =
        Math.atan2(
          dy,
          dx
        ) *
        (180 / Math.PI);

      /*
       * Solo usamos la región superior,
       * correspondiente a 0°–180°.
       */
      degrees = clamp(
        degrees,
        0,
        180
      );

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
      if (
        event.buttons === 0
      ) {
        stopDrag();
      }
    }
  );

  updateAngle(40);
}

/* =========================================================
   7. ACTIVIDAD DE CLASIFICACIÓN
========================================================= */

/**
 * Clasifica el valor escrito por el estudiante.
 */
function classifyAngleInput() {
  const input =
    document.getElementById(
      "angleInput"
    );

  const answer =
    document.getElementById(
      "angleAnswer"
    );

  if (!input || !answer) {
    return;
  }

  const value =
    Number(input.value);

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

/**
 * Renderiza MathJax dentro de un elemento.
 *
 * @param {HTMLElement} element
 */
function renderMath(element) {
  if (
    !element ||
    !window.MathJax?.typesetPromise
  ) {
    return;
  }

  MathJax.typesetPromise([element])
    .catch((error) => {
      console.warn(
        "No se pudo renderizar la expresión:",
        error
      );
    });
}

/* Permite ejecutar la actividad con Enter */

const angleInput =
  document.getElementById(
    "angleInput"
  );

angleInput?.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      classifyAngleInput();
    }
  }
);

/* =========================================================
   8. INICIALIZACIÓN GENERAL
========================================================= */

function initializeApp() {
  initializeSimpleSegment();
  initializeMidpointSegment();
  initializeAngleBuilder();

  showSlide(0);
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );
} else {
  initializeApp();
}
