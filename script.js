import { FLOWERS } from "./data/flowers.js";

const STORAGE_KEY = "personalGarden:v1";
const API_CONFIG = {
  wikipediaSummaryBaseUrl: "https://en.wikipedia.org/api/rest_v1/page/summary/",
  wikipediaSearchBaseUrl: "https://en.wikipedia.org/w/rest.php/v1/search/page",
  quoteProvider: "paperquotes"
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
      scientificName: flower.scientificName || "Unknown",
      watering: "Unavailable",
      sunlight: "Unavailable",
      cycle: "Unavailable",
      note:
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
  const fallbackFacts = {
    scientificName: flower.scientificName || "Unknown",
    pageTitle: flower.name,
    encyclopediaDescription: "Archived flower reference",
    summary: flower.description,
    note: "Live reference data is unavailable, so this entry is showing archived flower information."
  };

  const candidateTitles = [flower.name, flower.botanicalLookupTerm, `${flower.name} flower`]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  for (const title of candidateTitles) {
    const summaryUrl = `${API_CONFIG.wikipediaSummaryBaseUrl}${encodeURIComponent(title)}`;
    const response = await fetch(summaryUrl);
    if (!response.ok) continue;

    const payload = await response.json();
    if (payload?.type === "standard" && payload?.extract) {
      return {
        scientificName: flower.scientificName || "Unknown",
        pageTitle: payload.title || title,
        encyclopediaDescription: payload.description || "Wikipedia flower entry",
        summary: payload.extract,
        note: "Live reference data from Wikipedia."
      };
    }
  }

  const searchUrl = new URL(API_CONFIG.wikipediaSearchBaseUrl);
  searchUrl.searchParams.set("q", `${flower.name} flower`);
  searchUrl.searchParams.set("limit", "1");

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    return fallbackFacts;
  }

  const searchData = await searchResponse.json();
  const firstPage = searchData?.pages?.[0];
  if (!firstPage?.title) {
    return fallbackFacts;
  }

  const summaryUrl = `${API_CONFIG.wikipediaSummaryBaseUrl}${encodeURIComponent(firstPage.title)}`;
  const summaryResponse = await fetch(summaryUrl);
  if (!summaryResponse.ok) {
    return fallbackFacts;
  }

  const summaryData = await summaryResponse.json();
  if (summaryData?.type !== "standard" || !summaryData?.extract) {
    return fallbackFacts;
  }

  return {
    scientificName: flower.scientificName || "Unknown",
    pageTitle: summaryData.title || firstPage.title,
    encyclopediaDescription: summaryData.description || "Wikipedia flower entry",
    summary: summaryData.extract,
    note: "Live reference data from Wikipedia."
  };
}

async function fetchQuote(flower) {
  if (API_CONFIG.quoteProvider === "paperquotes") {
    const paperQuotesUrl = new URL("https://api.paperquotes.com/apiv1/quotes/");
    paperQuotesUrl.searchParams.set("limit", "1");
    paperQuotesUrl.searchParams.set("tags", flower.quoteTags.join(","));

    let response = await fetch(paperQuotesUrl);
    if (!response.ok) {
      throw new Error("PaperQuotes did not respond.");
    }

    let payload = await response.json();
    let quote = payload?.results?.[0];

    if (!quote) {
      const fallbackUrl = new URL("https://api.paperquotes.com/apiv1/quotes/");
      fallbackUrl.searchParams.set("limit", "1");
      response = await fetch(fallbackUrl);

      if (!response.ok) {
        throw new Error("PaperQuotes did not respond.");
      }

      payload = await response.json();
      quote = payload?.results?.[0];
    }

    if (!quote) {
      throw new Error("No quote matched the selected mood.");
    }

    return {
      content: quote.quote || "No quote available.",
      author: quote.author || "Unknown"
    };
  }

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
  elements.botanicalFacts.innerHTML = `
    <dl class="facts-list">
      <div><dt>Scientific Name</dt><dd>${result.scientificName}</dd></div>
      <div><dt>Reference Title</dt><dd>${result.pageTitle}</dd></div>
      <div><dt>Reference Type</dt><dd>${result.encyclopediaDescription}</dd></div>
      <div><dt>Summary</dt><dd>${result.summary}</dd></div>
    </dl>
    <p class="status-line">${result.note || ""}</p>
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
