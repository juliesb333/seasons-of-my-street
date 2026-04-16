const SEASON_DURATION = 20000;
const seasons = [
  {
    key: "spring",
    index: "01 / 04",
    label: "Spring",
    kicker: "Tender light, first bloom",
    line: "Petals loosen above the apartment road, and Jamsil feels newly awake.",
    note: "A familiar walk by the towers softens into blossom light.",
    particleImages: ["assets/images/blossom.png"],
    audio: "assets/audio/spring.mp3",
    catFrames: ["assets/images/cat_spring1.png", "assets/images/cat_spring2.png"],
    particleCount: 24
  },
  {
    key: "summer",
    index: "02 / 04",
    label: "Summer",
    kicker: "Heat, brightness, breath",
    line: "Heat gathers along the Hangang path; shade becomes its own address.",
    note: "The city breathes in green, glass, and slow evening air.",
    particleImages: ["assets/images/bubble.png"],
    audio: "assets/audio/summer.mp3",
    catFrames: ["assets/images/cat_summer1.png", "assets/images/cat_summer2.png"],
    particleCount: 20
  },
  {
    key: "fall",
    index: "03 / 04",
    label: "Fall",
    kicker: "Amber quiet, growing memory",
    line: "Lower light settles between buildings, benches, and turning leaves.",
    note: "The same route becomes quieter, as if memory has a color.",
    particleImages: ["assets/images/leaf1.png", "assets/images/leaf2.png", "assets/images/leaf3.png"],
    audio: "assets/audio/fall.mp3",
    catFrames: ["assets/images/cat_fall1.png", "assets/images/cat_fall2.png"],
    particleCount: 22
  },
  {
    key: "winter",
    index: "04 / 04",
    label: "Winter",
    kicker: "Pale air, honest stillness",
    line: "Snow makes the road honest; windows hold their small warm lights.",
    note: "Cold air sharpens the skyline, but the street keeps glowing.",
    particleImages: ["assets/images/snowflake.png"],
    audio: "assets/audio/winter.mp3",
    catFrames: ["assets/images/cat_winter1.png", "assets/images/cat_winter2.png"],
    particleCount: 28
  }
];

const body = document.body;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const particleLayer = document.getElementById("particle-layer");
const seasonIndex = document.getElementById("season-index");
const seasonLabel = document.getElementById("season-label");
const seasonLine = document.getElementById("season-line");
const seasonKicker = document.getElementById("season-kicker");
const seasonNote = document.getElementById("season-note");
const progressBar = document.getElementById("season-progress-bar");
const seasonAudio = document.getElementById("season-audio");
const toggleAudioBtn = document.getElementById("toggle-audio");
const seasonCat = document.getElementById("season-cat");
const catToggle = document.getElementById("cat-toggle");
const sceneStage = document.getElementById("scene-stage");
const cycleToggle = document.getElementById("cycle-toggle");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeSeasonIndex = 0;
let seasonTimer = null;
let catFrameIndex = 0;
let isAudioPlaying = false;
let catVariantOffset = 0;
let isCyclePaused = false;
let isDraggingCat = false;
let didDragCat = false;
let catDragOffsetX = 0;
let catDragOffsetBottom = 0;

function getActiveSeason() {
  return seasons[activeSeasonIndex];
}

function updateThemeColor() {
  const color = getComputedStyle(body).getPropertyValue("--bg").trim();
  document.documentElement.style.backgroundColor = color;

  if (themeColorMeta && color) {
    themeColorMeta.setAttribute("content", color);
  }
}

function restartProgress() {
  progressBar.style.animation = "none";
  progressBar.offsetHeight;

  if (!prefersReducedMotion && !isCyclePaused) {
    progressBar.style.animation = `seasonProgress ${SEASON_DURATION}ms linear forwards`;
  }
}

function clearParticles() {
  particleLayer.innerHTML = "";
}

function createParticles(season) {
  clearParticles();

  if (prefersReducedMotion) {
    return;
  }

  const count = window.innerWidth < 680 ? Math.ceil(season.particleCount * 0.58) : season.particleCount;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const image = document.createElement("img");
    const selectedImage = season.particleImages[Math.floor(Math.random() * season.particleImages.length)];
    const size = 18 + Math.random() * (season.key === "winter" ? 18 : 28);
    const duration = 10 + Math.random() * 9;
    const delay = Math.random() * -SEASON_DURATION;
    const drift = -50 + Math.random() * 100;

    particle.className = `particle particle-${season.key}`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--drift", `${drift}px`);
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}ms`;
    particle.style.opacity = `${0.45 + Math.random() * 0.42}`;

    image.src = selectedImage;
    image.alt = "";
    image.draggable = false;
    particle.appendChild(image);
    particleLayer.appendChild(particle);
  }
}

function updateCatFrame() {
  const season = getActiveSeason();
  const frames = season.catFrames;
  seasonCat.src = frames[(catFrameIndex + catVariantOffset) % frames.length];
}

function syncCatFrame() {
  catFrameIndex = 0;
  updateCatFrame();
}

async function syncAudioForSeason() {
  const season = getActiveSeason();

  if (!isAudioPlaying) {
    seasonAudio.src = season.audio;
    return;
  }

  const targetSrc = new URL(season.audio, window.location.href).href;

  if (seasonAudio.src !== targetSrc) {
    seasonAudio.src = season.audio;
  }

  try {
    await seasonAudio.play();
  } catch (error) {
    isAudioPlaying = false;
    toggleAudioBtn.classList.remove("on");
    toggleAudioBtn.classList.add("off");
    console.error("Audio playback failed:", error);
  }
}

function setSeason(nextIndex) {
  activeSeasonIndex = (nextIndex + seasons.length) % seasons.length;
  const season = getActiveSeason();

  body.classList.remove(...seasons.map((item) => `season-${item.key}`));
  body.classList.add(`season-${season.key}`);

  seasonIndex.textContent = season.index;
  seasonLabel.textContent = season.label;
  seasonLine.textContent = season.line;
  seasonKicker.textContent = season.kicker;
  seasonNote.textContent = season.note;

  updateThemeColor();
  createParticles(season);
  syncCatFrame();
  restartProgress();
  syncAudioForSeason();
}

function queueNextSeason() {
  window.clearTimeout(seasonTimer);

  if (prefersReducedMotion || isCyclePaused) {
    return;
  }

  seasonTimer = window.setTimeout(() => {
    setSeason(activeSeasonIndex + 1);
    queueNextSeason();
  }, SEASON_DURATION);
}

function setCyclePaused(paused) {
  isCyclePaused = paused;
  cycleToggle.classList.toggle("paused", paused);
  cycleToggle.setAttribute("aria-pressed", String(paused));
  cycleToggle.setAttribute("aria-label", paused ? "Resume seasonal cycle" : "Pause seasonal cycle");
  progressBar.style.animationPlayState = paused ? "paused" : "running";

  if (paused) {
    window.clearTimeout(seasonTimer);
    return;
  }

  restartProgress();
  queueNextSeason();
}

function createSeasonBurst(event) {
  if (prefersReducedMotion) {
    return;
  }

  const season = getActiveSeason();
  const count = window.innerWidth < 680 ? 7 : 11;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const image = document.createElement("img");
    const selectedImage = season.particleImages[Math.floor(Math.random() * season.particleImages.length)];
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.42;
    const distance = 42 + Math.random() * 68;
    const size = 14 + Math.random() * 16;

    particle.className = `burst-particle particle-${season.key}`;
    particle.style.left = `${event.clientX}px`;
    particle.style.top = `${event.clientY}px`;
    particle.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.animationDelay = `${Math.random() * 90}ms`;

    image.src = selectedImage;
    image.alt = "";
    image.draggable = false;
    particle.appendChild(image);
    particleLayer.appendChild(particle);

    window.setTimeout(() => {
      particle.remove();
    }, 1200);
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function moveCatToPoint(clientX, clientY) {
  const stageRect = sceneStage.getBoundingClientRect();
  const catRect = catToggle.getBoundingClientRect();
  const catCenterX = clientX + catDragOffsetX;
  const catBottomY = clientY + catDragOffsetBottom;
  const xPercent = clamp(((catCenterX - stageRect.left) / stageRect.width) * 100, 14, 86);
  const bottom = clamp(stageRect.bottom - catBottomY, 68, stageRect.height * 0.42);

  catToggle.style.setProperty("--cat-x", `${xPercent}%`);
  catToggle.style.setProperty("--cat-y", `${bottom}px`);
}

toggleAudioBtn.addEventListener("click", async () => {
  const season = getActiveSeason();

  if (isAudioPlaying) {
    seasonAudio.pause();
    seasonAudio.currentTime = 0;
    isAudioPlaying = false;
    toggleAudioBtn.classList.remove("on");
    toggleAudioBtn.classList.add("off");
    return;
  }

  try {
    seasonAudio.src = season.audio;
    seasonAudio.loop = true;
    await seasonAudio.play();
    isAudioPlaying = true;
    toggleAudioBtn.classList.remove("off");
    toggleAudioBtn.classList.add("on");
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
});

catToggle.addEventListener("click", (event) => {
  if (didDragCat) {
    event.preventDefault();
    didDragCat = false;
    return;
  }

  catVariantOffset = (catVariantOffset + 1) % 2;
  updateCatFrame();
});

catToggle.addEventListener("pointerdown", (event) => {
  const catRect = catToggle.getBoundingClientRect();
  isDraggingCat = true;
  didDragCat = false;
  catDragOffsetX = catRect.left + catRect.width / 2 - event.clientX;
  catDragOffsetBottom = catRect.bottom - event.clientY;
  catToggle.classList.add("dragging");
  catToggle.setPointerCapture(event.pointerId);
});

catToggle.addEventListener("pointermove", (event) => {
  if (!isDraggingCat) {
    return;
  }

  didDragCat = true;
  moveCatToPoint(event.clientX, event.clientY);
});

function stopCatDrag(event) {
  if (!isDraggingCat) {
    return;
  }

  isDraggingCat = false;
  catToggle.classList.remove("dragging");

  if (catToggle.hasPointerCapture(event.pointerId)) {
    catToggle.releasePointerCapture(event.pointerId);
  }
}

catToggle.addEventListener("pointerup", stopCatDrag);
catToggle.addEventListener("pointercancel", stopCatDrag);

cycleToggle.addEventListener("click", () => {
  setCyclePaused(!isCyclePaused);
});

sceneStage.addEventListener("click", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  createSeasonBurst(event);
});

window.addEventListener("resize", () => {
  createParticles(getActiveSeason());
});

setSeason(0);
queueNextSeason();
