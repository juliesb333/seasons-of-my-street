const seasonData = {
  spring: {
    title: "Spring",
    description: "A familiar street near my home feels soft, bright, and newly awake in spring.",
    note: "Spring turns the street into a gentler place, full of light movement and quiet energy.",
    effect: "🌸",
    fallingImage: "assets/images/blossom.png",
    bgColor: "#fde4de",
    audio: "assets/audio/spring.mp3",
    images: [
      "assets/images/spring1.jpeg",
      "assets/images/spring2.jpeg",
      "assets/images/spring3.JPG",
      "assets/images/spring4.jpeg",
      "assets/images/spring5.jpeg",
      "assets/images/spring6.jpeg"
    ]
},
  summer: {
    title: "Summer",
    description: "In summer, the street feels greener, warmer, and more alive with movement.",
    note: "Summer gives the neighborhood a full, active feeling, as if everything is breathing more loudly.",
    effect: "🍃",
    fallingImage: "assets/images/bubble.png",
    bgColor: "#c7e3a4",
    audio: "assets/audio/summer.mp3",
    images: [
      "assets/images/summer1.jpeg",
      "assets/images/summer2.jpeg",
      "assets/images/summer3.jpeg",
      "assets/images/summer4.jpeg"
    ]
},
  fall: {
    title: "Fall",
    description: "In fall, the same road becomes quieter, calmer, and touched by change.",
    note: "Falling leaves make the street feel reflective, as if the place is remembering something.",
    effect: "🍂",
    bgColor: "#dd9239",
    audio: "assets/audio/fall.mp3",
    images: [
      "assets/images/fall1.jpeg",
      "assets/images/fall2.jpeg",
      "assets/images/fall3.jpeg",
      "assets/images/fall4.jpeg",
      "assets/images/fall5.jpeg"


    ]
  },
  winter: {
    title: "Winter",
    description: "In winter, the neighborhood feels still, pale, and quietly intimate.",
    note: "Winter makes familiar places feel slower and more fragile, but also more honest.",
    effect: "❄️",
    bgColor: "#79c0d7",
    audio: "assets/audio/winter.mp3",
    images: [
      "assets/images/winter1.jpeg",
      "assets/images/winter2.jpeg",
      "assets/images/winter3.jpeg",
      "assets/images/winter4.jpeg",
      "assets/images/winter5.jpeg"

    ]
  }
};

const seasonTitle = document.getElementById("season-title");
const seasonDescription = document.getElementById("season-description");
const seasonNote = document.getElementById("season-note");
const buttons = document.querySelectorAll(".season-btn");
const fallingContainer = document.getElementById("background-falling");
const prevImageBtn = document.getElementById("prev-image");
const nextImageBtn = document.getElementById("next-image");
const imageCounter = document.getElementById("image-counter");
const seasonImage = document.getElementById("season-image");
const seasonAudio = document.getElementById("season-audio");
const toggleAudioBtn = document.getElementById("toggle-audio");
const introAudio = document.getElementById("intro-audio");



let currentSeason = "spring";
let currentImageIndex = 0;
let isAudioPlaying = false;
let introPlayed = false;
let summerBubbleAnimationId = null;
let summerBubbleState = [];

function stopSummerBubbleAnimation() {
  if (summerBubbleAnimationId !== null) {
    cancelAnimationFrame(summerBubbleAnimationId);
    summerBubbleAnimationId = null;
  }

  summerBubbleState = [];
}

function renderSummerBubble(bubble) {
  const driftX = Math.cos(bubble.floatPhase) * bubble.floatAmplitude;
  const driftY = Math.sin(bubble.floatPhase * 0.85) * bubble.floatAmplitude * 0.7;
  bubble.element.style.transform = `translate3d(${bubble.x + driftX}px, ${bubble.y + driftY}px, 0)`;
}

function createSummerBubble() {
  const item = document.createElement("div");
  const size = 28 + Math.random() * 18;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 0.18 + Math.random() * 0.2;
  const driftAngle = (Math.random() - 0.5) * 0.7;
  const startX = direction === 1
    ? -size - Math.random() * 80
    : width + Math.random() * 80;
  const startY = 24 + Math.random() * Math.max(height - 120, 120);

  item.classList.add("falling-item", "summer-bubble");
  item.classList.add(direction === 1 ? "from-left" : "from-right");
  item.style.left = "0";
  item.style.top = "0";
  item.style.opacity = `${0.62 + Math.random() * 0.22}`;

  const img = document.createElement("img");
  img.src = seasonData.summer.fallingImage;
  img.alt = "";
  img.classList.add("falling-image");
  img.style.width = `${size}px`;
  item.appendChild(img);

  const bubble = {
    element: item,
    size,
    x: startX,
    y: startY,
    vx: Math.cos(driftAngle) * speed * direction,
    vy: Math.sin(driftAngle) * speed,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: 0.0015 + Math.random() * 0.002,
    wander: 0.003 + Math.random() * 0.004,
    baseOpacity: 0.62 + Math.random() * 0.22,
    floatPhase: Math.random() * Math.PI * 2,
    floatSpeed: 0.012 + Math.random() * 0.01,
    floatAmplitude: 4 + Math.random() * 8
  };

  renderSummerBubble(bubble);
  return bubble;
}

function updateSummerBubbles(timestamp) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  summerBubbleState.forEach((bubble, index) => {
    bubble.driftPhase += bubble.driftSpeed * 16;
    bubble.floatPhase += bubble.floatSpeed;

    bubble.vx += Math.cos(bubble.driftPhase + index) * bubble.wander * 0.012;
    bubble.vy += Math.sin(bubble.driftPhase * 0.85 + index) * bubble.wander * 0.012;

    bubble.vx *= 0.998;
    bubble.vy *= 0.998;

    const speed = Math.hypot(bubble.vx, bubble.vy);
    const maxSpeed = 0.4;

    if (speed > maxSpeed) {
      bubble.vx = (bubble.vx / speed) * maxSpeed;
      bubble.vy = (bubble.vy / speed) * maxSpeed;
    }

    bubble.x += bubble.vx * 16;
    bubble.y += bubble.vy * 16;

    const radius = bubble.size / 2;
    const maxX = width - radius;
    const minX = -radius;
    const maxY = height - radius;
    const minY = 8;

    if (bubble.x < minX) {
      bubble.x = minX;
      bubble.vx = Math.abs(bubble.vx) * 0.92;
    } else if (bubble.x > maxX) {
      bubble.x = maxX;
      bubble.vx = -Math.abs(bubble.vx) * 0.92;
    }

    if (bubble.y < minY) {
      bubble.y = minY;
      bubble.vy = Math.abs(bubble.vy) * 0.9;
    } else if (bubble.y > maxY) {
      bubble.y = maxY;
      bubble.vy = -Math.abs(bubble.vy) * 0.9;
    }
  });

  for (let i = 0; i < summerBubbleState.length; i++) {
    for (let j = i + 1; j < summerBubbleState.length; j++) {
      const a = summerBubbleState[i];
      const b = summerBubbleState[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      const minDistance = (a.size + b.size) / 2;

      if (!distance || distance >= minDistance) {
        continue;
      }

      const overlap = (minDistance - distance) / 2;
      const nx = dx / distance;
      const ny = dy / distance;

      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;

      const push = 0.018;
      a.vx -= nx * push;
      a.vy -= ny * push;
      b.vx += nx * push;
      b.vy += ny * push;
    }
  }

  summerBubbleState.forEach((bubble) => {
    const shimmer = 0.5 + Math.sin(bubble.driftPhase) * 0.08;
    bubble.element.style.opacity = `${Math.max(0.34, bubble.baseOpacity * shimmer)}`;
    renderSummerBubble(bubble);
  });

  if (currentSeason === "summer") {
    summerBubbleAnimationId = requestAnimationFrame(updateSummerBubbles);
  }
}

function startSummerBubbleAnimation(count) {
  stopSummerBubbleAnimation();

  for (let i = 0; i < count; i++) {
    const bubble = createSummerBubble();
    summerBubbleState.push(bubble);
    fallingContainer.appendChild(bubble.element);
  }

  summerBubbleAnimationId = requestAnimationFrame(updateSummerBubbles);
}


function createFallingItems(symbol) {
  stopSummerBubbleAnimation();
  fallingContainer.innerHTML = "";

  const count = currentSeason === "summer" ? 40 : 14;
  const data = seasonData[currentSeason];

  if (currentSeason === "summer") {
    startSummerBubbleAnimation(count);
    return;
  }

  for (let i = 0; i < count; i++) {
    const item = document.createElement("div");
    item.classList.add("falling-item");
    item.style.left = `${Math.random() * 100}%`;
    item.style.animationDuration = currentSeason === "spring"
      ? `${6.2 + Math.random() * 2.4}s`
      : `${4 + Math.random() * 2}s`;
    item.style.animationDelay = `${Math.random() * 1.5}s`;

    if (data.fallingImage) {
      const img = document.createElement("img");
      img.src = data.fallingImage;
      img.alt = "";
      img.classList.add("falling-image");
      img.style.width = `${28 + Math.random() * 18}px`;
      item.appendChild(img);
    } else {
      item.textContent = symbol;
      item.style.fontSize = `${22 + Math.random() * 8}px`;
    }

    fallingContainer.appendChild(item);
  }
}

function playIntroOnce() {
  if (introPlayed) return;

  introAudio.play().catch((error) => {
    console.error("Intro playback failed:", error);
  });

  introPlayed = true;
}

function updateAudio() {
  const data = seasonData[currentSeason];
  seasonAudio.src = data.audio || "";
  seasonAudio.pause();
  seasonAudio.currentTime = 0;
  isAudioPlaying = false;
  toggleAudioBtn.classList.remove("on");
  toggleAudioBtn.classList.add("off");
}

toggleAudioBtn.addEventListener("click", async () => {
  if (!seasonAudio.src) return;

  if (isAudioPlaying) {
    seasonAudio.pause();
    isAudioPlaying = false;
    toggleAudioBtn.classList.remove("on");
    toggleAudioBtn.classList.add("off");
  } else {
    try {
      await seasonAudio.play();
      isAudioPlaying = true;
      toggleAudioBtn.classList.remove("off");
      toggleAudioBtn.classList.add("on");
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  }
});

seasonAudio.addEventListener("ended", () => {
  isAudioPlaying = false;
  toggleAudioBtn.classList.remove("on");
  toggleAudioBtn.classList.add("off");
});


function updateImage() {
  const data = seasonData[currentSeason];
  const imagePath = data.images[currentImageIndex];

  seasonImage.src = imagePath;
  seasonImage.alt = `${data.title} image ${currentImageIndex + 1}`;
  imageCounter.textContent = `${currentImageIndex + 1} / ${data.images.length}`;
}

function setSeason(season) {
  currentSeason = season;
  currentImageIndex = 0;

  const data = seasonData[season];

  seasonTitle.textContent = data.title;
  seasonDescription.textContent = data.description;
  seasonNote.textContent = data.note;

  document.body.style.backgroundColor = data.bgColor;


  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.season === season);
  });

  createFallingItems(data.effect);
  updateImage();
  updateAudio();
}

function showNextImage() {
  const totalImages = seasonData[currentSeason].images.length;
  currentImageIndex = (currentImageIndex + 1) % totalImages;
  updateImage();
}

function showPrevImage() {
  const totalImages = seasonData[currentSeason].images.length;
  currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
  updateImage();
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    playIntroOnce();
    setSeason(button.dataset.season);
  });
});

nextImageBtn.addEventListener("click", showNextImage);
prevImageBtn.addEventListener("click", showPrevImage);

window.addEventListener("resize", () => {
  if (currentSeason === "summer") {
    createFallingItems(seasonData.summer.effect);
  }
});

setSeason("spring");
