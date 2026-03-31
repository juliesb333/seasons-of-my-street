const seasonData = {
  spring: {
    title: "Spring",
    description: "A familiar street near my home feels soft, bright, and newly awake in spring.",
    note: "Spring turns the street into a gentler place, full of light movement and quiet energy.",
    effect: "🌸"
  },
  summer: {
    title: "Summer",
    description: "In summer, the street feels greener, warmer, and more alive with movement.",
    note: "Summer gives the neighborhood a full, active feeling, as if everything is breathing more loudly.",
    effect: "✨"
  },
  fall: {
    title: "Fall",
    description: "In fall, the same road becomes quieter, calmer, and touched by change.",
    note: "Falling leaves make the street feel reflective, as if the place is remembering something.",
    effect: "🍂"
  },
  winter: {
    title: "Winter",
    description: "In winter, the neighborhood feels still, pale, and quietly intimate.",
    note: "Winter makes familiar places feel slower and more fragile, but also more honest.",
    effect: "❄️"
  }
};

const hero = document.querySelector(".hero");
const seasonTitle = document.getElementById("season-title");
const seasonDescription = document.getElementById("season-description");
const seasonNote = document.getElementById("season-note");
const buttons = document.querySelectorAll(".season-btn");
const fallingContainer = document.getElementById("falling-container");

function createFallingItems(symbol) {
  fallingContainer.innerHTML = "";

  for (let i = 0; i < 18; i++) {
    const item = document.createElement("div");
    item.classList.add("falling-item");
    item.textContent = symbol;
    item.style.left = `${Math.random() * 100}%`;
    item.style.animationDuration = `${6 + Math.random() * 6}s`;
    item.style.animationDelay = `${Math.random() * 4}s`;
    item.style.fontSize = `${16 + Math.random() * 14}px`;
    fallingContainer.appendChild(item);
  }
}

function setSeason(season) {
  const data = seasonData[season];

  hero.classList.remove("spring", "summer", "fall", "winter");
  hero.classList.add(season);

  seasonTitle.textContent = data.title;
  seasonDescription.textContent = data.description;
  seasonNote.textContent = data.note;

  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.season === season);
  });

  createFallingItems(data.effect);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    setSeason(button.dataset.season);
  });
});

setSeason("spring");