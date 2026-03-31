const seasonData = {
  spring: {
    title: "Spring",
    description: "A familiar street near my home feels soft, bright, and newly awake in spring.",
    note: "Spring turns the street into a gentler place, full of light movement and quiet energy.",
    effect: "🌸",
    bgColor: "#fde4de",
    audio: "assets/audio/spring.mp3",
    images: [
      "assets/images/spring1.png",
      "assets/images/spring2.png",
      "assets/images/spring3.png"
    ]
},
  summer: {
    title: "Summer",
    description: "In summer, the street feels greener, warmer, and more alive with movement.",
    note: "Summer gives the neighborhood a full, active feeling, as if everything is breathing more loudly.",
    effect: "🍃",
    bgColor: "#c7e3a4",
    audio: "assets/audio/summer.mp3",
    images: [
      "assets/images/summer1.png",
      "assets/images/summer2.png",
      "assets/images/summer3.png"
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
      "assets/images/fall1.png",
      "assets/images/fall2.png",
      "assets/images/fall3.png"
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
      "assets/images/winter1.png",
      "assets/images/winter2.png",
      "assets/images/winter3.png"
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


function createFallingItems(symbol) {
  fallingContainer.innerHTML = "";

  const count = currentSeason === "summer" ? 12 : 14;

  for (let i = 0; i < count; i++) {
    const item = document.createElement("div");
    item.classList.add("falling-item");
    item.textContent = symbol;
    item.style.left = `${Math.random() * 100}%`;
    item.style.animationDuration = `${4 + Math.random() * 2}s`;
    item.style.animationDelay = `${Math.random() * 1.5}s`;
    item.style.fontSize = `${22 + Math.random() * 8}px`;
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

setSeason("spring");

