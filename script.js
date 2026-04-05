import { FLOWERS } from "./data/flowers.js";

const STORAGE_KEY = "personalGarden:v1";
const API_CONFIG = {
  perenualApiKey: "86ecr6ab988o",
  perenualBaseUrl: "https://perenual.com/api/v2",
  quoteProvider: "quotable"
};

const FEELING_ORDER = [
  "Romantic",
  "Friendship",
  "Hopeful",
  "Joyful",
  "Reflective",
  "Nostalgic",
  "Brave",
  "Secretive",
  "Grieving",
  "Cautious"
];

const FEELINGS = [
  "All",
  ...FEELING_ORDER.filter((feeling) => FLOWERS.some((flower) => flower.feelings.includes(feeling)))
];

const state = {
  activeFeeling: "All",
  flowers: FLOWERS,
  selectedFlowerId: FLOWERS[0]?.id || null,
  garden: loadGarden()
};

const elements = {
  feelingFilters: document.querySelector("#feelingFilters"),
  filterSummary: document.querySelector("#filterSummary"),
  flowerList: document.querySelector("#flowerList"),
  flowerMood: document.querySelector("#flowerMood"),
  flowerName: document.querySelector("#flowerName"),
  flowerScientific: document.querySelector("#flowerScientific"),
  flowerMeaning: document.querySelector("#flowerMeaning"),
  flowerDescription: document.querySelector("#flowerDescription"),
  imageFrame: document.querySelector("#imageFrame"),
  botanicalFacts: document.querySelector("#botanicalFacts"),
  quoteBlock: document.querySelector("#quoteBlock"),
  pairList: document.querySelector("#pairList"),
  gardenList: document.querySelector("#gardenList"),
  gardenButton: document.querySelector("#gardenButton"),
  clearGardenButton: document.querySelector("#clearGardenButton")
};

function loadGarden() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGarden() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.garden));
}

function getVisibleFlowers() {
  const flowers =
    state.activeFeeling === "All"
      ? state.flowers
      : state.flowers.filter((flower) => flower.feelings.includes(state.activeFeeling));

  return [...flowers].sort((left, right) => left.name.localeCompare(right.name));
}

function getSelectedFlower() {
  const visibleFlowers = getVisibleFlowers();
  return visibleFlowers.find((flower) => flower.id === state.selectedFlowerId) || visibleFlowers[0] || null;
}

function renderFeelingFilters() {
  elements.feelingFilters.innerHTML = "";

  FEELINGS.forEach((feeling) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${feeling === state.activeFeeling ? "is-active" : ""}`;
    button.textContent = feeling;
    button.dataset.feeling = feeling;
    button.setAttribute("aria-pressed", String(feeling === state.activeFeeling));
    elements.feelingFilters.appendChild(button);
  });
}

function renderFlowerList() {
  const visibleFlowers = getVisibleFlowers();
  const selectedFlower = getSelectedFlower();

  if (!selectedFlower) {
    elements.flowerList.innerHTML = '<p class="empty-state">No flowers match this feeling yet.</p>';
    elements.filterSummary.textContent = "No flowers are available for the current filter.";
    return;
  }

  state.selectedFlowerId = selectedFlower.id;
  elements.filterSummary.textContent =
    state.activeFeeling === "All"
      ? `Showing all ${visibleFlowers.length} curated flowers in the digital floriography book.`
      : `Showing ${visibleFlowers.length} flowers that match a ${state.activeFeeling.toLowerCase()} mood.`;

  elements.flowerList.innerHTML = "";
  visibleFlowers.forEach((flower) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `flower-pill ${flower.id === state.selectedFlowerId ? "is-selected" : ""}`;
    button.dataset.flowerId = flower.id;

    const title = document.createElement("span");
    title.textContent = flower.name;

    const subtitle = document.createElement("small");
    subtitle.textContent = flower.meaning;

    button.append(title, subtitle);
    elements.flowerList.appendChild(button);
  });
}

function renderPairings(flower) {
  elements.pairList.innerHTML = "";

  if (!flower.pairWith.length) {
    const item = document.createElement("li");
    item.textContent = "No pairing note was preserved for this flower in the archived source.";
    elements.pairList.appendChild(item);
    return;
  }

  flower.pairWith.forEach((pairing) => {
    const item = document.createElement("li");
    item.textContent = pairing;
    elements.pairList.appendChild(item);
  });
}

function renderFlowerDetails() {
  const flower = getSelectedFlower();
  if (!flower) return;

  state.selectedFlowerId = flower.id;
  elements.gardenButton.textContent = state.garden.some((item) => item.id === flower.id)
    ? "Already In Garden"
    : "Pick For My Garden";
  elements.flowerMood.textContent = flower.feelings.join(" • ");
  elements.flowerName.textContent = flower.name;
  elements.flowerScientific.textContent = flower.scientificName || "Scientific name still being refined";
  elements.flowerMeaning.textContent = flower.meaning;
  elements.flowerDescription.textContent = flower.description;

  elements.imageFrame.innerHTML = "";
  const image = document.createElement("img");
  image.src = flower.image.src;
  image.alt = flower.image.alt;
  elements.imageFrame.appendChild(image);

  renderPairings(flower);
  elements.botanicalFacts.innerHTML = '<p class="status-line">Loading botanical facts...</p>';
  elements.quoteBlock.innerHTML = '<p class="status-line">Looking for a matching quote...</p>';

  fetchDynamicDetails(flower);
}

async function fetchDynamicDetails(flower) {
  const requestId = flower.id;
  const [botanical, quote] = await Promise.allSettled([
    fetchBotanicalFacts(flower),
    fetchQuote(flower)
  ]);

  if (state.selectedFlowerId !== requestId) return;

  if (botanical.status === "fulfilled") {
    renderBotanicalFacts(botanical.value);
  } else {
    renderBotanicalFacts({
      error:
        botanical.reason?.message ||
        "Botanical details are unavailable right now, but the floriography entry still works."
    });
  }

  if (quote.status === "fulfilled") {
    renderQuote(quote.value);
  } else {
    renderQuote({
      content: "No quote is available right now, so the flower's meaning takes center stage.",
      author: "Quote service unavailable"
    });
  }
}

async function fetchBotanicalFacts(flower) {
  if (!API_CONFIG.perenualApiKey) {
    return {
      error:
        "Add your Perenual API key in script.js to load live watering, sunlight, and cycle details."
    };
  }

  const searchUrl = new URL(`${API_CONFIG.perenualBaseUrl}/species-list`);
  searchUrl.searchParams.set("key", API_CONFIG.perenualApiKey);
  searchUrl.searchParams.set("q", flower.botanicalLookupTerm);

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    if (searchResponse.status === 429) {
      return {
        error: "Perenual free-tier limit reached. Try again later for live botanical facts."
      };
    }

    throw new Error("Perenual search failed. The static floriography entry is still available.");
  }

  const searchData = await searchResponse.json();
  const match = searchData?.data?.[0];

  if (!match?.id) {
    return {
      error:
        "Perenual could not find this flower yet. The symbolic meaning is still available while the botanical match is refined."
    };
  }

  const detailUrl = new URL(`${API_CONFIG.perenualBaseUrl}/species/details/${match.id}`);
  detailUrl.searchParams.set("key", API_CONFIG.perenualApiKey);

  const detailResponse = await fetch(detailUrl);
  if (!detailResponse.ok) {
    const errorText =
      detailResponse.status === 429
        ? "Perenual free-tier limit reached. Try again later for live botanical facts."
        : "Perenual details are unavailable right now.";
    return { error: errorText };
  }

  const detailData = await detailResponse.json();
  return {
    scientificName: detailData.scientific_name?.[0] || flower.scientificName || "Unknown",
    watering: detailData.watering || "Unknown",
    sunlight: Array.isArray(detailData.sunlight) ? detailData.sunlight.join(", ") : detailData.sunlight || "Unknown",
    cycle: detailData.cycle || "Unknown"
  };
}

async function fetchQuote(flower) {
  const quotableUrl = new URL("https://api.quotable.io/quotes/random");
  quotableUrl.searchParams.set("limit", "1");
  quotableUrl.searchParams.set("maxLength", "160");
  quotableUrl.searchParams.set("tags", flower.quoteTags.join("|"));

  let response = await fetch(quotableUrl);
  if (!response.ok) {
    throw new Error("Quotable did not respond.");
  }

  let payload = await response.json();
  let quote = payload?.[0];

  if (!quote) {
    const fallbackUrl = new URL("https://api.quotable.io/quotes/random");
    fallbackUrl.searchParams.set("limit", "1");
    fallbackUrl.searchParams.set("maxLength", "160");
    response = await fetch(fallbackUrl);

    if (!response.ok) {
      throw new Error("Quotable did not respond.");
    }

    payload = await response.json();
    quote = payload?.[0];
  }

  if (!quote) {
    throw new Error("No quote matched the selected mood.");
  }

  return {
    content: quote.content,
    author: quote.author
  };
}

function renderBotanicalFacts(result) {
  if (result.error) {
    elements.botanicalFacts.innerHTML = `<p class="status-line">${result.error}</p>`;
    return;
  }

  elements.botanicalFacts.innerHTML = `
    <dl class="facts-list">
      <div><dt>Scientific Name</dt><dd>${result.scientificName}</dd></div>
      <div><dt>Watering</dt><dd>${result.watering}</dd></div>
      <div><dt>Sunlight</dt><dd>${result.sunlight}</dd></div>
      <div><dt>Cycle</dt><dd>${result.cycle}</dd></div>
    </dl>
  `;
}

function renderQuote(result) {
  elements.quoteBlock.innerHTML = `
    <p class="quote-text">"${result.content}"</p>
    <footer class="quote-author">${result.author}</footer>
  `;
}

function renderGarden() {
  if (!state.garden.length) {
    elements.gardenList.innerHTML = '<p class="empty-state">No flowers saved yet. Pick one from the entry panel.</p>';
    return;
  }

  elements.gardenList.innerHTML = "";
  state.garden.forEach((flower) => {
    const item = document.createElement("article");
    item.className = "garden-item";

    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = flower.name;
    const meaning = document.createElement("p");
    meaning.textContent = flower.meaning;
    copy.append(title, meaning);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "text-button";
    button.dataset.removeId = flower.id;
    button.textContent = "Remove";

    item.append(copy, button);
    elements.gardenList.appendChild(item);
  });
}

function addToGarden() {
  const flower = getSelectedFlower();
  if (!flower) return;

  if (state.garden.some((item) => item.id === flower.id)) {
    elements.gardenButton.textContent = "Already Saved";
    window.setTimeout(() => {
      elements.gardenButton.textContent = "Already In Garden";
    }, 1200);
    return;
  }

  state.garden.unshift({
    id: flower.id,
    name: flower.name,
    meaning: flower.meaning,
    image: flower.image.src,
    scientificName: flower.scientificName,
    perenualId: flower.perenualId,
    savedAt: new Date().toISOString()
  });

  saveGarden();
  renderGarden();
  renderFlowerDetails();
}

function handleFlowerSelection(id) {
  state.selectedFlowerId = id;
  renderFlowerList();
  renderFlowerDetails();
}

function setupEvents() {
  elements.feelingFilters.addEventListener("click", (event) => {
    const target = event.target.closest("[data-feeling]");
    if (!target) return;

    state.activeFeeling = target.dataset.feeling;
    renderFeelingFilters();
    renderFlowerList();
    renderFlowerDetails();
  });

  elements.flowerList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-flower-id]");
    if (!target) return;
    handleFlowerSelection(target.dataset.flowerId);
  });

  elements.gardenButton.addEventListener("click", addToGarden);

  elements.gardenList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-remove-id]");
    if (!target) return;

    state.garden = state.garden.filter((flower) => flower.id !== target.dataset.removeId);
    saveGarden();
    renderGarden();
    renderFlowerDetails();
  });

  elements.clearGardenButton.addEventListener("click", () => {
    state.garden = [];
    saveGarden();
    renderGarden();
    renderFlowerDetails();
  });
}

function init() {
  renderFeelingFilters();
  renderFlowerList();
  renderFlowerDetails();
  renderGarden();
  setupEvents();
}

init();
