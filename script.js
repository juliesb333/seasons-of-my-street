const SEASON_DURATION = 25000;
const SHARED_AUDIO_SRC = "assets/audio/all.mp3";
const CAT_SPRITES = {
  spring: ["assets/images/cat_spring1.png", "assets/images/cat_spring2.png"],
  summer: ["assets/images/cat_summer1.png", "assets/images/cat_summer2.png"],
  fall: ["assets/images/cat_fall1.png", "assets/images/cat_fall2.png"],
  winter: ["assets/images/cat_winter1.png", "assets/images/cat_winter2.png"]
};
const CAT_FALLBACK_SPRITES = ["assets/images/cat1.png", "assets/images/cat2.png"];
const CAT_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);
const CAT_DRAG_THRESHOLD = 6;
const CAT_WALK_FRAME_MS = 320;
const CAT_MOVE_SPEED = 198;
const CAT_JUMP_MS = 920;
const CAT_JUMP_COOLDOWN_MS = 140;
const CAT_DEFAULT_POSITION = {
  xPercent: 52,
  yPx: 132
};
const CAT_ROAD_INSET_X = 26;
const CAT_ROAD_EDGE_CLEARANCE_RATIO = 0.16;
const CAT_ROAD_TOP_INSET = 20;
const CAT_ROAD_BOTTOM_INSET = 18;
const CAT_ROAD_BOTTOM_LINE_CLEARANCE = 0.14;
const COLLECTIBLE_CHECK_MS = 90;
const COLLECTIBLE_ACTIVE_WINDOW_MS = 280;
const COLLECTIBLE_CAT_INSET = 20;
const COLLECTIBLE_PARTICLE_INSET = 4;
const GIRL_APPEAR_DELAY_MS = 0;
const GIRL_INTERACTION_DISTANCE = 128;
const GIRL_TALK_FRAME_MS = 200;
const GIRL_STAND_SPRITE = "assets/images/girl.png";
const GIRL_SIT_IDLE_SPRITE = "assets/images/girl_sit.png";
const GIRL_SEASONAL_SIT_SPRITES = {
  spring: "assets/images/girl_sit.png",
  summer: "assets/images/girl_sit_summer.png",
  fall: "assets/images/girl_sit_fall.png",
  winter: "assets/images/girl_sit_winter.png"
};
const GIRL_TALK_SPRITES = ["assets/images/girl_sit2.png", "assets/images/girl_sit3.png"];
const CONTROLS_OVERLAY_AUTOHIDE_MS = 4200;
const OBJECTIVE_SCREEN_DURATION_MS = 3200;
const ENDING_MOMENTS_TARGET = 70;
const ENDING_REVEAL_DELAY_MS = 900;
const INTRO_TYPE_MS = 62;
const INTRO_LINE_HOLD_MS = 1400;
const INTRO_LINE_OUT_MS = 620;
const INTRO_TYPE_SOUND_GAP_MS = 82;
const seasons = [
  {
    key: "spring",
    index: "01 / 04",
    label: "Spring",
    line: "Petals wake the river path.",
    note: "The same street keeps time with water, weather, and small footsteps.",
    particleImages: ["assets/images/blossom.png"],
    particleCount: 28
  },
  {
    key: "summer",
    index: "02 / 04",
    label: "Summer",
    line: "Heat rests beside the river.",
    note: "Jamsil glows slowly, held between towers, shade, and late light.",
    particleImages: ["assets/images/bubble.png"],
    particleCount: 24
  },
  {
    key: "fall",
    index: "03 / 04",
    label: "Fall",
    line: "Leaves gather near the benches.",
    note: "The familiar walk turns amber, quieter with every passing window.",
    particleImages: ["assets/images/leaf1.png", "assets/images/leaf2.png", "assets/images/leaf3.png"],
    particleCount: 26
  },
  {
    key: "winter",
    index: "04 / 04",
    label: "Winter",
    line: "Snow hushes the road.",
    note: "Cold air clears the skyline, and the river keeps a pale rhythm.",
    particleImages: ["assets/images/snowflake.png"],
    particleCount: 32
  }
];

const body = document.body;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const particleLayer = document.getElementById("particle-layer");
const seasonIndex = document.getElementById("season-index");
const seasonLabel = document.getElementById("season-label");
const seasonLine = document.getElementById("season-line");
const seasonNote = document.getElementById("season-note");
const progressBar = document.getElementById("season-progress-bar");
const seasonAudio = document.getElementById("season-audio");
const dropAudio = document.getElementById("drop-audio");
const typeAudio = document.getElementById("type-audio");
const girlEvent = document.getElementById("girl-event");
const girlSprite = document.getElementById("girl-sprite");
const girlPrompt = document.getElementById("girl-prompt");
const controlsOverlay = document.getElementById("controls-overlay");
const objectiveScreen = document.getElementById("objective-screen");
const girlDialogue = document.getElementById("girl-dialogue");
const girlDialogueSpeaker = document.getElementById("girl-dialogue-speaker");
const girlDialogueLine = document.getElementById("girl-dialogue-line");
const toggleAudioBtn = document.getElementById("toggle-audio");
const seasonCat = document.getElementById("season-cat");
const catToggle = document.getElementById("cat-toggle");
const sceneShell = document.querySelector(".scene-shell");
const sceneStage = document.getElementById("scene-stage");
const cycleToggle = document.getElementById("cycle-toggle");
const streetLayer = document.getElementById("street-layer");
const memoryCount = document.getElementById("memory-count");
const introScreen = document.getElementById("intro-screen");
const introLines = document.getElementById("intro-lines");
const introPrompt = document.getElementById("intro-prompt");
const endingScreen = document.getElementById("ending-screen");
const root = document.documentElement;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeSeasonIndex = 0;
let seasonTimer = null;
let catFrameIndex = 0;
let isAudioPlaying = false;
let isCyclePaused = false;
let isDraggingCat = false;
let didDragCat = false;
let catDragOffsetX = 0;
let catDragOffsetBottom = 0;
let catPointerStartX = 0;
let catPointerStartY = 0;
const catPosition = { ...CAT_DEFAULT_POSITION };
const pressedCatKeys = new Set();
let catAnimationRequest = null;
let catLastMoveTime = 0;
let catFrameElapsed = 0;
let catFacingDirection = "left";
let catJumpTimeout = null;
let lastCatJumpTime = 0;
let gatheredMoments = 0;
let collectibleCheckRequest = null;
let lastCollectibleCheckTime = 0;
let lastCatCollectibleActivityTime = 0;
let girlVisible = false;
let playerNearGirl = false;
let dialogueActive = false;
let dialogueStep = 0;
let dialogueFinished = false;
let girlAppearanceScheduled = false;
let girlAppearanceTimer = null;
let girlTalkingInterval = null;
let girlTalkingFrameIndex = 0;
let controlsShown = false;
let controlsDismissed = false;
let controlsHideTimeout = null;
let objectiveScreenShown = false;
let objectiveScreenDismissed = false;
let objectiveScreenTimeout = null;
let endingTriggered = false;
let endingRevealTimeout = null;
let isIntroActive = Boolean(introScreen);
let isIntroStarted = false;
let isIntroReady = false;
let isIntroAwaitingFinalInput = false;
let introTimeout = null;
let lastIntroTypeSoundTime = 0;
let isIntroTypeSoundUnlocked = false;

const introText = [
  "There is a street I keep returning to.",
  "Not because it is grand,",
  "but because it changes quietly.",
  "In petals, heat, leaves, and snow,",
  "it became part of how I remember home.",
  "This is Seasons of My Street."
];

const girlDialogueLines = [
  { speaker: "Girl", text: "You came all the way here." },
  { speaker: "Cat", text: "Mrrp." },
  { speaker: "Girl", text: "This street feels different in every season, doesn't it?" }
];

seasonCat.draggable = false;
cycleToggle.title = "Pause seasons";
toggleAudioBtn.title = "Seasonal sound";

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

  if (isIntroActive) {
    return;
  }

  if (!prefersReducedMotion && !isCyclePaused) {
    progressBar.style.animation = `seasonProgress ${SEASON_DURATION}ms linear forwards`;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    introTimeout = window.setTimeout(resolve, ms);
  });
}

function playIntroTypeSound() {
  if (!typeAudio || !isIntroTypeSoundUnlocked) {
    return;
  }

  const now = window.performance.now();
  if (now - lastIntroTypeSoundTime < INTRO_TYPE_SOUND_GAP_MS) {
    return;
  }

  lastIntroTypeSoundTime = now;
  const sound = typeAudio.cloneNode();
  sound.volume = 0.12;

  sound.play().catch(() => {});
  sound.addEventListener("ended", () => {
    sound.remove();
  });
}

function unlockIntroTypeSound() {
  isIntroTypeSoundUnlocked = true;
}

function showIntroPrompt(text) {
  if (!introPrompt) {
    return;
  }

  introPrompt.textContent = text;
  introPrompt.classList.add("is-visible");
  introPrompt.setAttribute("aria-hidden", "false");
}

function hideIntroPrompt() {
  if (!introPrompt) {
    return;
  }

  introPrompt.classList.remove("is-visible");
  introPrompt.setAttribute("aria-hidden", "true");
}

async function typeIntroLine(element, text) {
  element.textContent = "";
  element.classList.remove("is-leaving");
  element.classList.add("is-visible", "is-typing");

  if (prefersReducedMotion) {
    element.textContent = text;
  } else {
    for (let index = 0; index < text.length; index += 1) {
      element.textContent += text[index];
      if (text[index] !== " ") {
        playIntroTypeSound();
      }
      await wait(INTRO_TYPE_MS);
    }
  }

  element.classList.remove("is-typing");
}

function finishIntro() {
  if (!isIntroActive) {
    return;
  }

  isIntroActive = false;
  window.clearTimeout(introTimeout);
  body.classList.remove("intro-playing");
  introScreen.classList.add("is-fading");
  introScreen.setAttribute("aria-hidden", "true");
  createParticles(getActiveSeason());
  setCatPosition(catPosition.xPercent, catPosition.yPx);
  scheduleGirlAppearance();
  restartProgress();
  queueNextSeason();
  showObjectiveScreen();

  window.setTimeout(() => {
    introScreen.remove();
  }, prefersReducedMotion ? 0 : 950);
}

async function startIntro() {
  if (!introScreen || !introLines || !introPrompt) {
    isIntroActive = false;
    body.classList.remove("intro-playing");
    scheduleGirlAppearance();
    showObjectiveScreen();
    return;
  }

  hideIntroPrompt();
  await wait(prefersReducedMotion ? 0 : 320);

  const lineElement = document.createElement("p");
  lineElement.className = "intro-line";
  introLines.appendChild(lineElement);

  for (const line of introText) {
    if (!isIntroActive) {
      return;
    }

    await typeIntroLine(lineElement, line);
    await wait(prefersReducedMotion ? 0 : INTRO_LINE_HOLD_MS);
    lineElement.classList.remove("is-visible");
    lineElement.classList.remove("is-leaving", "is-typing");
    lineElement.textContent = "";
  }

  if (!isIntroActive) {
    return;
  }

  lineElement.remove();
  isIntroReady = true;
  isIntroAwaitingFinalInput = true;
  showIntroPrompt("Press any key / Click to enter");
}

function beginIntroSequence() {
  if (isIntroStarted) {
    return;
  }

  isIntroStarted = true;
  startIntro();
}

function handleIntroAction(event) {
  if (!isIntroActive) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  unlockIntroTypeSound();

  if (!isIntroStarted) {
    beginIntroSequence();
    return;
  }

  finishIntro();
}

function initializeIntro() {
  if (!introScreen || !introLines || !introPrompt) {
    isIntroActive = false;
    body.classList.remove("intro-playing");
    scheduleGirlAppearance();
    showControlsOverlay();
    return;
  }

  showIntroPrompt("Press any key / Click to begin");
}

function clearParticles() {
  particleLayer.innerHTML = "";
}

function markCatCollectibleActivity() {
  lastCatCollectibleActivityTime = window.performance.now();
}

function updateMemoryCount() {
  memoryCount.textContent = String(gatheredMoments);

  if (!endingTriggered && gatheredMoments >= ENDING_MOMENTS_TARGET) {
    triggerEnding();
  }
}

function setGirlPromptVisible(visible) {
  if (!girlPrompt) {
    return;
  }

  girlPrompt.hidden = !visible;
  girlPrompt.classList.toggle("is-visible", visible);
  girlPrompt.setAttribute("aria-hidden", String(!visible));
}

function updateTalkPrompt() {
  setGirlPromptVisible(girlVisible && playerNearGirl && !dialogueActive && !dialogueFinished);
}

function setGirlDialogueVisible(visible) {
  if (!girlDialogue) {
    return;
  }

  girlDialogue.hidden = !visible;
}

function setControlsOverlayVisible(visible) {
  if (!controlsOverlay) {
    return;
  }

  controlsOverlay.hidden = !visible;
  controlsOverlay.classList.toggle("is-visible", visible);
  controlsOverlay.setAttribute("aria-hidden", String(!visible));
}

function setObjectiveScreenVisible(visible) {
  if (!objectiveScreen) {
    return;
  }

  objectiveScreen.hidden = !visible;
  objectiveScreen.classList.toggle("is-visible", visible);
  objectiveScreen.classList.toggle("is-fading", !visible);
  objectiveScreen.setAttribute("aria-hidden", String(!visible));
}

function setEndingVisible(visible) {
  if (!endingScreen) {
    return;
  }

  endingScreen.hidden = !visible;
  endingScreen.classList.toggle("is-visible", visible);
  endingScreen.setAttribute("aria-hidden", String(!visible));
}

function dismissControlsOverlay() {
  if (!controlsOverlay || controlsDismissed) {
    return;
  }

  controlsDismissed = true;
  window.clearTimeout(controlsHideTimeout);
  setControlsOverlayVisible(false);
}

function dismissObjectiveScreen() {
  if (!objectiveScreen || objectiveScreenDismissed) {
    return;
  }

  objectiveScreenDismissed = true;
  window.clearTimeout(objectiveScreenTimeout);
  setObjectiveScreenVisible(false);

  if (!controlsDismissed) {
    showControlsOverlay();
  }
}

function handoffObjectiveToControls() {
  if (!objectiveScreen || objectiveScreen.hidden || objectiveScreenDismissed) {
    return false;
  }

  dismissObjectiveScreen();
  return true;
}

function showControlsOverlay() {
  if (!controlsOverlay || controlsShown || controlsDismissed || isIntroActive || endingTriggered) {
    return;
  }

  controlsShown = true;
  setControlsOverlayVisible(true);
  window.clearTimeout(controlsHideTimeout);
  controlsHideTimeout = window.setTimeout(() => {
    dismissControlsOverlay();
  }, CONTROLS_OVERLAY_AUTOHIDE_MS);
}

function showObjectiveScreen() {
  if (!objectiveScreen || objectiveScreenShown || objectiveScreenDismissed || isIntroActive || endingTriggered) {
    return;
  }

  objectiveScreenShown = true;
  setObjectiveScreenVisible(true);
  window.clearTimeout(objectiveScreenTimeout);
  objectiveScreenTimeout = window.setTimeout(() => {
    dismissObjectiveScreen();
  }, OBJECTIVE_SCREEN_DURATION_MS);
}

function stopCollectibleChecks() {
  if (collectibleCheckRequest !== null) {
    window.cancelAnimationFrame(collectibleCheckRequest);
    collectibleCheckRequest = null;
  }
}

function setGirlSprite(src) {
  if (!girlSprite) {
    return;
  }

  girlSprite.src = src;
}

function getSeasonalGirlSitSprite(seasonKey = getActiveSeason().key) {
  return GIRL_SEASONAL_SIT_SPRITES[seasonKey] || GIRL_SIT_IDLE_SPRITE;
}

function updateGirlSeatedSprite() {
  if (!girlVisible || !girlEvent || dialogueActive || !girlEvent.classList.contains("is-seated")) {
    return;
  }

  setGirlSprite(getSeasonalGirlSitSprite());
}

function triggerEnding() {
  if (endingTriggered) {
    return;
  }

  endingTriggered = true;
  gatheredMoments = ENDING_MOMENTS_TARGET;
  memoryCount.textContent = String(gatheredMoments);
  dismissObjectiveScreen();
  dismissControlsOverlay();
  clearCatMovementInput();
  pressedCatKeys.clear();
  isDraggingCat = false;
  didDragCat = false;
  catToggle.classList.remove("dragging");
  window.clearTimeout(catJumpTimeout);
  catToggle.classList.remove("jumping");
  stopCollectibleChecks();
  window.clearTimeout(seasonTimer);
  setCyclePaused(true);
  dialogueActive = false;
  stopGirlTalking();
  setGirlDialogueVisible(false);
  setGirlPromptVisible(false);

  if (sceneShell) {
    sceneShell.classList.add("is-ending");
  }

  endingRevealTimeout = window.setTimeout(() => {
    setEndingVisible(true);
  }, prefersReducedMotion ? 0 : ENDING_REVEAL_DELAY_MS);
}

function stopGirlTalking() {
  if (girlTalkingInterval !== null) {
    window.clearInterval(girlTalkingInterval);
    girlTalkingInterval = null;
  }

  girlTalkingFrameIndex = 0;
  if (dialogueActive) {
    setGirlSprite(GIRL_SIT_IDLE_SPRITE);
    return;
  }

  updateGirlSeatedSprite();
}

function startGirlTalking() {
  if (!dialogueActive) {
    stopGirlTalking();
    return;
  }

  stopGirlTalking();
  setGirlSprite(GIRL_TALK_SPRITES[girlTalkingFrameIndex]);

  girlTalkingInterval = window.setInterval(() => {
    girlTalkingFrameIndex = (girlTalkingFrameIndex + 1) % GIRL_TALK_SPRITES.length;
    setGirlSprite(GIRL_TALK_SPRITES[girlTalkingFrameIndex]);
  }, GIRL_TALK_FRAME_MS);
}

function renderGirlDialogueStep() {
  const line = girlDialogueLines[dialogueStep];
  if (!line || !girlDialogueSpeaker || !girlDialogueLine) {
    return;
  }

  girlDialogueSpeaker.textContent = line.speaker;
  girlDialogueLine.textContent = line.text;

  if (line.speaker === "Girl") {
    startGirlTalking();
  } else {
    stopGirlTalking();
  }
}

function startGirlDialogue() {
  if (!girlVisible || dialogueFinished || !girlEvent) {
    return;
  }

  dialogueActive = true;
  dialogueStep = 0;
  clearCatMovementInput();
  isDraggingCat = false;
  catToggle.classList.remove("dragging");
  girlEvent.classList.add("is-seated");
  stopGirlTalking();
  updateTalkPrompt();
  setGirlDialogueVisible(true);
  renderGirlDialogueStep();
}

function advanceGirlDialogue() {
  if (!dialogueActive) {
    return;
  }

  dialogueStep += 1;
  if (dialogueStep >= girlDialogueLines.length) {
    dialogueActive = false;
    dialogueFinished = true;
    stopGirlTalking();
    setGirlDialogueVisible(false);
    updateTalkPrompt();
    return;
  }

  renderGirlDialogueStep();
}

function updateGirlInteractionState() {
  if (!girlVisible || !girlEvent) {
    playerNearGirl = false;
    updateTalkPrompt();
    return;
  }

  const catRect = catToggle.getBoundingClientRect();
  const girlRect = girlEvent.getBoundingClientRect();
  const catCenterX = catRect.left + catRect.width / 2;
  const catCenterY = catRect.top + catRect.height / 2;
  const girlCenterX = girlRect.left + girlRect.width / 2;
  const girlCenterY = girlRect.top + girlRect.height / 2;
  const distance = Math.hypot(catCenterX - girlCenterX, catCenterY - girlCenterY);

  playerNearGirl = distance <= GIRL_INTERACTION_DISTANCE;
  updateTalkPrompt();
}

function showGirlEvent() {
  if (!girlEvent || !girlSprite || girlVisible) {
    return;
  }

  girlVisible = true;
  girlEvent.hidden = false;
  girlEvent.setAttribute("aria-hidden", "false");
  girlEvent.classList.add("is-visible");
  setGirlSprite(GIRL_STAND_SPRITE);
  updateGirlInteractionState();
}

function scheduleGirlAppearance() {
  if (!girlEvent || girlAppearanceScheduled || girlVisible) {
    return;
  }

  girlAppearanceScheduled = true;
  const elapsed = window.performance.now();
  const remaining = Math.max(0, GIRL_APPEAR_DELAY_MS - elapsed);

  girlAppearanceTimer = window.setTimeout(() => {
    showGirlEvent();
  }, remaining);
}

function getInsetRect(rect, inset) {
  return {
    left: rect.left + inset,
    right: rect.right - inset,
    top: rect.top + inset,
    bottom: rect.bottom - inset
  };
}

function rectsOverlap(firstRect, secondRect) {
  return (
    firstRect.left < secondRect.right &&
    firstRect.right > secondRect.left &&
    firstRect.top < secondRect.bottom &&
    firstRect.bottom > secondRect.top
  );
}

function createMemorySparkle(particleRect) {
  const layerRect = particleLayer.getBoundingClientRect();
  const sparkle = document.createElement("span");

  sparkle.className = "memory-sparkle";
  sparkle.style.left = `${particleRect.left + particleRect.width / 2 - layerRect.left}px`;
  sparkle.style.top = `${particleRect.top + particleRect.height / 2 - layerRect.top}px`;
  particleLayer.appendChild(sparkle);

  window.setTimeout(() => {
    sparkle.remove();
  }, 720);
}

function playDropSound() {
  if (!dropAudio) {
    return;
  }

  const sound = dropAudio.cloneNode();
  sound.volume = 1;

  sound.play().catch(() => {
    dropAudio.currentTime = 0;
    dropAudio.volume = 1;
    dropAudio.play().catch(() => {});
  });

  sound.addEventListener("ended", () => {
    sound.remove();
  });
}

function collectParticle(particle, particleRect) {
  if (endingTriggered || particle.dataset.collected === "true") {
    return;
  }

  particle.dataset.collected = "true";
  particle.classList.add("collected");
  gatheredMoments += 1;
  updateMemoryCount();
  createMemorySparkle(particleRect);
  playDropSound();

  window.setTimeout(() => {
    particle.remove();
  }, 680);
}

function runCollectibleCheck() {
  if (isIntroActive || endingTriggered) {
    return;
  }

  if (window.performance.now() - lastCatCollectibleActivityTime > COLLECTIBLE_ACTIVE_WINDOW_MS) {
    return;
  }

  const catRect = getInsetRect(catToggle.getBoundingClientRect(), COLLECTIBLE_CAT_INSET);
  const particles = particleLayer.querySelectorAll(".particle:not(.collected)");

  particles.forEach((particle) => {
    const particleRect = particle.getBoundingClientRect();
    const touchRect = getInsetRect(particleRect, COLLECTIBLE_PARTICLE_INSET);

    if (rectsOverlap(catRect, touchRect)) {
      collectParticle(particle, particleRect);
    }
  });
}

function checkCollectibleParticles(timestamp = 0) {
  if (prefersReducedMotion) {
    collectibleCheckRequest = null;
    return;
  }

  if (timestamp - lastCollectibleCheckTime >= COLLECTIBLE_CHECK_MS) {
    runCollectibleCheck();
    lastCollectibleCheckTime = timestamp;
  }

  collectibleCheckRequest = window.requestAnimationFrame(checkCollectibleParticles);
}

function startCollectibleChecks() {
  if (collectibleCheckRequest !== null || prefersReducedMotion || endingTriggered) {
    return;
  }

  lastCollectibleCheckTime = 0;
  collectibleCheckRequest = window.requestAnimationFrame(checkCollectibleParticles);
}

function createParticles(season) {
  clearParticles();

  if (prefersReducedMotion || isIntroActive || endingTriggered) {
    return;
  }

  const seasonalCount = season.key === "summer" ? season.particleCount + 8 : season.particleCount;
  const count = window.innerWidth < 680 ? Math.ceil(seasonalCount * 0.58) : seasonalCount;
  const particleLayerTop = particleLayer.getBoundingClientRect().top;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const image = document.createElement("img");
    const selectedImage = season.particleImages[Math.floor(Math.random() * season.particleImages.length)];
    const sizeBase = season.key === "summer" ? 14 : 18;
    const sizeRange = season.key === "winter" ? 16 : season.key === "summer" ? 34 : 28;
    const size = sizeBase + Math.random() * sizeRange;
    const duration = season.key === "winter" ? 14 + Math.random() * 10 : season.key === "summer" ? 12 + Math.random() * 12 : 10 + Math.random() * 9;
    const delay = season.key === "summer" ? Math.random() * -SEASON_DURATION : Math.random() * 650;
    const driftRange = season.key === "summer" ? 220 : season.key === "winter" ? 82 : 100;
    const drift = -driftRange / 2 + Math.random() * driftRange;
    const spawnY = season.key === "summer" ? 0 : -particleLayerTop - (28 + Math.random() * 72);

    particle.className = `particle particle-${season.key}`;
    particle.style.left = `${season.key === "summer" ? 4 + Math.random() * 92 : Math.random() * 100}%`;
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--drift", `${drift}px`);
    particle.style.setProperty("--spawn-y", `${spawnY}px`);
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}ms`;
    const opacity = season.key === "fall"
      ? 0.78 + Math.random() * 0.18
      : season.key === "winter"
        ? 0.5 + Math.random() * 0.32
        : 0.7 + Math.random() * 0.25;

    particle.style.opacity = `${opacity}`;

    image.src = selectedImage;
    image.alt = "";
    image.draggable = false;
    particle.appendChild(image);
    particleLayer.appendChild(particle);
  }

  startCollectibleChecks();
}

function getCatSprites() {
  return CAT_SPRITES[getActiveSeason().key] || CAT_FALLBACK_SPRITES;
}

function setCatFrame(frameIndex) {
  const frames = getCatSprites();
  catFrameIndex = frameIndex % frames.length;
  seasonCat.dataset.frameIndex = String(catFrameIndex);
  seasonCat.src = frames[catFrameIndex] || CAT_FALLBACK_SPRITES[catFrameIndex] || CAT_FALLBACK_SPRITES[0];
}

function setCatIdleFrame() {
  catFrameElapsed = 0;
  setCatFrame(0);
}

function syncCatFrame() {
  setCatIdleFrame();
}

function ensureSharedAudioSource() {
  const targetSrc = new URL(SHARED_AUDIO_SRC, window.location.href).href;

  if (seasonAudio.src !== targetSrc) {
    seasonAudio.src = SHARED_AUDIO_SRC;
  }

  seasonAudio.loop = true;
}

function syncAudioForSeason() {
  if (isAudioPlaying) {
    ensureSharedAudioSource();
  }
}

function setSeason(nextIndex) {
  activeSeasonIndex = (nextIndex + seasons.length) % seasons.length;
  const season = getActiveSeason();
  const seasonClasses = seasons.map((item) => `season-${item.key}`);

  root.classList.remove(...seasonClasses);
  body.classList.remove(...seasonClasses);
  root.classList.add(`season-${season.key}`);
  body.classList.add(`season-${season.key}`);

  seasonIndex.textContent = season.index;
  seasonLabel.textContent = season.label;
  seasonLine.textContent = season.line;
  seasonNote.textContent = season.note;

  updateThemeColor();
  createParticles(season);
  syncCatFrame();
  updateGirlSeatedSprite();
  restartProgress();
  syncAudioForSeason();
}

function queueNextSeason() {
  window.clearTimeout(seasonTimer);

  if (prefersReducedMotion || isCyclePaused || isIntroActive || endingTriggered) {
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
  cycleToggle.setAttribute("aria-label", paused ? "Resume slow seasonal cycle" : "Pause slow seasonal cycle");
  cycleToggle.title = paused ? "Resume seasons" : "Pause seasons";
  progressBar.style.animationPlayState = paused ? "paused" : "running";

  if (paused) {
    window.clearTimeout(seasonTimer);
    return;
  }

  restartProgress();
  queueNextSeason();
}

function createSeasonBurst(event) {
  if (prefersReducedMotion || endingTriggered) {
    return;
  }

  const season = getActiveSeason();
  const count = window.innerWidth < 680 ? 7 : 11;
  const particleRect = particleLayer.getBoundingClientRect();

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const image = document.createElement("img");
    const selectedImage = season.particleImages[Math.floor(Math.random() * season.particleImages.length)];
    const isBubbleBurst = season.key === "summer";
    const angle = isBubbleBurst
      ? Math.PI + (Math.PI * index) / Math.max(count - 1, 1) + (Math.random() - 0.5) * 0.14
      : (Math.PI * 2 * index) / count + Math.random() * 0.42;
    const distance = isBubbleBurst ? 36 + Math.random() * 58 : 42 + Math.random() * 68;
    const size = isBubbleBurst ? 16 + Math.random() * 18 : 14 + Math.random() * 16;

    particle.className = `burst-particle particle-${season.key}`;
    particle.style.left = `${event.clientX - particleRect.left}px`;
    particle.style.top = `${event.clientY - particleRect.top}px`;
    particle.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.animationDelay = `${isBubbleBurst ? 0 : Math.random() * 90}ms`;

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

function lockViewportScroll() {
  if (window.scrollX !== 0 || window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }
}

function getTranslateY(element) {
  const transform = window.getComputedStyle(element).transform;

  if (!transform || transform === "none") {
    return 0;
  }

  const matrixMatch = transform.match(/^matrix\((.+)\)$/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(",").map((value) => Number.parseFloat(value.trim()));
    return Number.isFinite(values[5]) ? values[5] : 0;
  }

  const matrix3dMatch = transform.match(/^matrix3d\((.+)\)$/);
  if (matrix3dMatch) {
    const values = matrix3dMatch[1].split(",").map((value) => Number.parseFloat(value.trim()));
    return Number.isFinite(values[13]) ? values[13] : 0;
  }

  return 0;
}

function getCatMovementBounds() {
  const stageRect = sceneStage.getBoundingClientRect();
  const roadRect = streetLayer.getBoundingClientRect();
  const catWidth = catToggle.getBoundingClientRect().width;
  const catShiftY = getTranslateY(catToggle);
  const roadEdgeInsetX = Math.max(CAT_ROAD_INSET_X, catWidth * CAT_ROAD_EDGE_CLEARANCE_RATIO);
  const minXPercent = ((roadRect.left + roadEdgeInsetX - stageRect.left) / stageRect.width) * 100;
  const maxXPercent = ((roadRect.right - roadEdgeInsetX - stageRect.left) / stageRect.width) * 100;
  const lowerLineClearance = Math.max(CAT_ROAD_BOTTOM_INSET, roadRect.height * CAT_ROAD_BOTTOM_LINE_CLEARANCE);
  const minYPx = stageRect.bottom + catShiftY - roadRect.bottom + lowerLineClearance;
  const maxYPx = stageRect.bottom + catShiftY - roadRect.top - CAT_ROAD_TOP_INSET;

  if (minYPx > maxYPx) {
    const midpoint = (minYPx + maxYPx) / 2;
    return {
      stageRect,
      roadRect,
      minXPercent,
      maxXPercent,
      minYPx: midpoint,
      maxYPx: midpoint
    };
  }

  return {
    stageRect,
    roadRect,
    minXPercent,
    maxXPercent,
    minYPx,
    maxYPx
  };
}

function setCatPosition(xPercent, yPx) {
  const bounds = getCatMovementBounds();
  catPosition.xPercent = clamp(xPercent, bounds.minXPercent, bounds.maxXPercent);
  catPosition.yPx = clamp(yPx, bounds.minYPx, bounds.maxYPx);
  catToggle.style.setProperty("--cat-x", `${catPosition.xPercent}%`);
  catToggle.style.setProperty("--cat-y", `${catPosition.yPx}px`);
  updateGirlInteractionState();
  runCollectibleCheck();
}

function syncCatPositionFromElement() {
  const bounds = getCatMovementBounds();
  const catRect = catToggle.getBoundingClientRect();
  const catShiftY = getTranslateY(catToggle);
  const xPercent = ((catRect.left + catRect.width / 2 - bounds.stageRect.left) / bounds.stageRect.width) * 100;
  const yPx = bounds.stageRect.bottom + catShiftY - catRect.bottom;
  setCatPosition(
    Number.isFinite(xPercent) ? xPercent : CAT_DEFAULT_POSITION.xPercent,
    Number.isFinite(yPx) ? yPx : CAT_DEFAULT_POSITION.yPx
  );
}

function moveCatToPoint(clientX, clientY) {
  const bounds = getCatMovementBounds();
  const catShiftY = getTranslateY(catToggle);
  const catCenterX = clientX + catDragOffsetX;
  const catBottomY = clientY + catDragOffsetBottom;
  const xPercent = ((catCenterX - bounds.stageRect.left) / bounds.stageRect.width) * 100;
  const bottom = bounds.stageRect.bottom + catShiftY - catBottomY;

  setCatPosition(xPercent, bottom);
}

function setCatMovingFrame(deltaMs) {
  catFrameElapsed += deltaMs;

  if (catFrameElapsed < CAT_WALK_FRAME_MS) {
    return;
  }

  catFrameElapsed %= CAT_WALK_FRAME_MS;
  setCatFrame(catFrameIndex === 0 ? 1 : 0);
}

function updateCatFacing(directionX) {
  if (directionX === 0) {
    return;
  }

  catFacingDirection = directionX < 0 ? "left" : "right";
  catToggle.dataset.facing = catFacingDirection;
  catToggle.classList.toggle("facing-left", catFacingDirection === "left");
}

function stopCatKeyboardMovement() {
  catLastMoveTime = 0;
  catAnimationRequest = null;
  setCatIdleFrame();
}

function jumpCat() {
  if (endingTriggered) {
    return;
  }

  const now = window.performance.now();
  if (now - lastCatJumpTime < CAT_JUMP_COOLDOWN_MS) {
    return;
  }

  lastCatJumpTime = now;
  markCatCollectibleActivity();
  window.clearTimeout(catJumpTimeout);
  catToggle.classList.remove("jumping");
  catToggle.offsetHeight;
  catToggle.classList.add("jumping");

  catJumpTimeout = window.setTimeout(() => {
    catToggle.classList.remove("jumping");
  }, CAT_JUMP_MS);
}

function moveCatWithKeyboard(timestamp) {
  if (endingTriggered) {
    stopCatKeyboardMovement();
    return;
  }

  if (pressedCatKeys.size === 0) {
    stopCatKeyboardMovement();
    return;
  }

  if (!catLastMoveTime) {
    catLastMoveTime = timestamp;
  }

  const deltaMs = Math.min(timestamp - catLastMoveTime, 48);
  catLastMoveTime = timestamp;

  const directionX = Number(pressedCatKeys.has("ArrowRight")) - Number(pressedCatKeys.has("ArrowLeft"));
  const directionY = Number(pressedCatKeys.has("ArrowUp")) - Number(pressedCatKeys.has("ArrowDown"));
  const length = Math.hypot(directionX, directionY) || 1;
  const normalizedX = directionX / length;
  const normalizedY = directionY / length;
  const bounds = getCatMovementBounds();
  const distance = CAT_MOVE_SPEED * (deltaMs / 1000);
  const nextX = catPosition.xPercent + (normalizedX * distance * 100) / bounds.stageRect.width;
  const nextY = catPosition.yPx + normalizedY * distance;

  markCatCollectibleActivity();
  updateCatFacing(directionX);
  setCatPosition(nextX, nextY);

  setCatMovingFrame(deltaMs);
  catAnimationRequest = window.requestAnimationFrame(moveCatWithKeyboard);
}

function startCatKeyboardMovement() {
  if (catAnimationRequest !== null || endingTriggered) {
    return;
  }

  catLastMoveTime = 0;
  catAnimationRequest = window.requestAnimationFrame(moveCatWithKeyboard);
}

function clearCatMovementInput() {
  pressedCatKeys.clear();

  if (catAnimationRequest !== null) {
    window.cancelAnimationFrame(catAnimationRequest);
    stopCatKeyboardMovement();
  }
}

toggleAudioBtn.addEventListener("click", async () => {
  if (isAudioPlaying) {
    seasonAudio.pause();
    seasonAudio.currentTime = 0;
    isAudioPlaying = false;
    toggleAudioBtn.classList.remove("on");
    toggleAudioBtn.classList.add("off");
    toggleAudioBtn.setAttribute("aria-label", "Turn seasonal sound on");
    return;
  }

  try {
    ensureSharedAudioSource();
    await seasonAudio.play();
    isAudioPlaying = true;
    toggleAudioBtn.classList.remove("off");
    toggleAudioBtn.classList.add("on");
    toggleAudioBtn.setAttribute("aria-label", "Turn seasonal sound off");
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

  setCatIdleFrame();
});

seasonCat.addEventListener("error", () => {
  const frameIndex = Number.parseInt(seasonCat.dataset.frameIndex || String(catFrameIndex), 10) || 0;
  const fallbackSrc = CAT_FALLBACK_SPRITES[frameIndex] || CAT_FALLBACK_SPRITES[0];
  const fallbackFile = fallbackSrc.split("/").pop();

  if (!seasonCat.src.endsWith(fallbackFile)) {
    seasonCat.src = fallbackSrc;
  }
});

catToggle.addEventListener("pointerdown", (event) => {
  if (isIntroActive || dialogueActive || endingTriggered || event.button !== 0) {
    return;
  }

  clearCatMovementInput();
  const catRect = catToggle.getBoundingClientRect();
  isDraggingCat = true;
  didDragCat = false;
  catPointerStartX = event.clientX;
  catPointerStartY = event.clientY;
  catDragOffsetX = catRect.left + catRect.width / 2 - event.clientX;
  catDragOffsetBottom = catRect.bottom - event.clientY;
  catToggle.classList.add("dragging");
  catToggle.setPointerCapture(event.pointerId);
});

catToggle.addEventListener("pointermove", (event) => {
  if (!isDraggingCat) {
    return;
  }

  if (!didDragCat) {
    const deltaX = event.clientX - catPointerStartX;
    const deltaY = event.clientY - catPointerStartY;

    if (Math.hypot(deltaX, deltaY) < CAT_DRAG_THRESHOLD) {
      return;
    }
  }

  didDragCat = true;
  event.preventDefault();
  markCatCollectibleActivity();
  moveCatToPoint(event.clientX, event.clientY);
});

function stopCatDrag(event) {
  if (!isDraggingCat) {
    return;
  }

  isDraggingCat = false;
  setCatPosition(catPosition.xPercent, catPosition.yPx);
  catToggle.classList.remove("dragging");

  if (catToggle.hasPointerCapture(event.pointerId)) {
    catToggle.releasePointerCapture(event.pointerId);
  }
}

catToggle.addEventListener("pointerup", stopCatDrag);
catToggle.addEventListener("pointercancel", stopCatDrag);
catToggle.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

if (introScreen) {
  introScreen.addEventListener("pointerdown", handleIntroAction);
  window.addEventListener("keydown", handleIntroAction, { capture: true });
}

window.addEventListener("keydown", (event) => {
  if (isIntroActive) {
    event.preventDefault();
    return;
  }

  if (endingTriggered) {
    if ((event.key === "r" || event.key === "R") && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      window.location.reload();
    }
    return;
  }

  if ((event.key === "z" || event.key === "Z") && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const objectiveHandedOff = handoffObjectiveToControls();
    if (!objectiveHandedOff) {
      dismissControlsOverlay();
    }
    event.preventDefault();
    if (dialogueActive) {
      advanceGirlDialogue();
      return;
    }

    if (girlVisible && playerNearGirl && !dialogueFinished) {
      startGirlDialogue();
    }
    return;
  }

  if (dialogueActive) {
    if (event.code === "Space" || CAT_KEYS.has(event.key)) {
      event.preventDefault();
    }
    return;
  }

  if (event.code === "Space" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const objectiveHandedOff = handoffObjectiveToControls();
    if (!objectiveHandedOff) {
      dismissControlsOverlay();
    }
    event.preventDefault();
    lockViewportScroll();
    if (!event.repeat) {
      jumpCat();
    }
    return;
  }

  if (!CAT_KEYS.has(event.key) || event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  const objectiveHandedOff = handoffObjectiveToControls();
  if (!objectiveHandedOff) {
    dismissControlsOverlay();
  }
  event.preventDefault();
  lockViewportScroll();
  if (event.repeat && pressedCatKeys.has(event.key)) {
    return;
  }

  if (event.key === "ArrowLeft") {
    updateCatFacing(-1);
  } else if (event.key === "ArrowRight") {
    updateCatFacing(1);
  }

  pressedCatKeys.add(event.key);
  startCatKeyboardMovement();
});

window.addEventListener("keyup", (event) => {
  if (isIntroActive) {
    event.preventDefault();
    return;
  }

  if (dialogueActive && (event.code === "Space" || CAT_KEYS.has(event.key))) {
    event.preventDefault();
    return;
  }

  if (!CAT_KEYS.has(event.key)) {
    return;
  }

  event.preventDefault();
  pressedCatKeys.delete(event.key);

  if (pressedCatKeys.size === 0 && catAnimationRequest !== null) {
    window.cancelAnimationFrame(catAnimationRequest);
    stopCatKeyboardMovement();
  }
});

window.addEventListener("blur", () => {
  clearCatMovementInput();
  isDraggingCat = false;
  catToggle.classList.remove("dragging");
});

window.addEventListener("scroll", lockViewportScroll, { passive: true });

cycleToggle.addEventListener("click", () => {
  setCyclePaused(!isCyclePaused);
});

sceneStage.addEventListener("click", (event) => {
  if (endingTriggered) {
    return;
  }

  const objectiveHandedOff = handoffObjectiveToControls();
  if (!objectiveHandedOff) {
    dismissControlsOverlay();
  }
  if (event.target.closest("button")) {
    return;
  }

  createSeasonBurst(event);
});

if (controlsOverlay) {
  controlsOverlay.addEventListener("pointerdown", () => {
    dismissControlsOverlay();
  });
}

window.addEventListener("resize", () => {
  if (endingTriggered) {
    return;
  }

  createParticles(getActiveSeason());
  window.clearTimeout(catJumpTimeout);
  catToggle.classList.remove("jumping");
  setCatPosition(catPosition.xPercent, catPosition.yPx);
  updateGirlInteractionState();
});

setGirlPromptVisible(false);
setGirlDialogueVisible(false);
setObjectiveScreenVisible(false);
setEndingVisible(false);
setSeason(0);
catToggle.dataset.facing = catFacingDirection;
syncCatPositionFromElement();
initializeIntro();
queueNextSeason();
