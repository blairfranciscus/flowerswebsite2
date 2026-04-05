import { RAW_FLOWERS } from "./data/flowers.js";

const STORAGE_KEY = "personalGarden:v1";
const REFERENCE_IMAGE_ROOT = "./assets/flowers";
const API_CONFIG = {
  perenualApiKey: "",
  perenualBaseUrl: "https://perenual.com/api/v2",
  quoteProvider: "paperquotes"
};

const FEELINGS = [
  "All",
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

const DETAIL_NOTES = {
  carnation: {
    scientificName: "Dianthus caryophyllus",
    description:
      "Carnations are linked with a mother's eternal love and heartache, especially through Christian symbolism surrounding the Virgin Mary's tears.",
    pairWith: ["Mint", "Snowdrop", "Heather"]
  },
  rose: {
    scientificName: "Rosa",
    description:
      "Roses have signaled many shades of love across cultures, with Victorian color choices shaping whether the message felt innocent, blossoming, or deeply passionate.",
    pairWith: ["Baby's Breath", "Cornflower"]
  },
  lavender: {
    scientificName: "Lavandula",
    description:
      "Lavender's beauty and scent made it attractive, but folklore also tied it to danger and distrust because snakes were said to hide among the plants.",
    pairWith: ["Foxglove", "Datura"]
  },
  yarrow: {
    description:
      "Yarrow carries associations with healing and mending emotional wounds, which is why it often appears in stories of recovery after heartbreak."
  },
  "forget-me-not": {
    description:
      "Forget-me-nots keep remembrance at the center of their symbolism, making them a natural bridge between memory, devotion, and tenderness."
  },
  honeysuckle: {
    description:
      "Honeysuckle's clinging vines and sweet fragrance made it a symbol of devotion and affection in folklore and literature."
  }
};

const IMAGE_MAP = {
  amaryllis: "Amaryllis.png",
  anemone: "Anemone.png",
  "apple-blossom": "Apple Blossom.png",
  azalea: "Azalea.png",
  aster: "Aster.png",
  "baby-s-breath": "Baby's Breath.png",
  basil: "Basil.png",
  begonia: "Begonia.png",
  bluebell: "Bluebell.png",
  buttercup: "Buttercup.png",
  cattail: "Cattail.png",
  camellia: "Camellia.png",
  carnation: "Carnation.png",
  chamomile: "Chamomile.png",
  chrysanthemum: "Chrysanthemum.png",
  clematis: "Celmatis.png",
  clover: "Clover.png",
  columbine: "Columbine.png",
  cornflower: "Cornflower.png",
  crocus: "Crocus.png",
  cypress: "Cypress.png",
  daffodil: "Daffodil.png",
  dahlia: "Dahlia.png",
  daisy: "Daisy.png",
  dandelion: "Dandelion.png",
  datura: "Datura.png",
  dogwood: "Dogwood.png",
  edelweiss: "Edelweiss.png",
  eucalyptus: "Eucalyptus.png",
  fern: "Fern.png",
  "forget-me-not": "Forget-Me-Not.png",
  foxglove: "Foxglove.png",
  gladiolus: "Gladiolus.png",
  hawthorn: "Hawthorn.png",
  heather: "Heather.png",
  hemlock: "Hemlock.png",
  holly: "Holly.png",
  honeysuckle: "Honeysuckle.png",
  hydrangea: "Hydrangea.png",
  hyacinth: "Hyacinth.png",
  hyssop: "Hyssop.png",
  iris: "Iris.png",
  ivy: "Ivy.png",
  jasmine: "Jasmine.png",
  laurel: "Laurel.png",
  lavender: "Lavender.png",
  lilac: "Lilac.png",
  lily: "Lily.png",
  magnolia: "Magnolia.png",
  marigold: "Marigold.png",
  mistletoe: "Mistletoe.png",
  oleander: "Oleander.png",
  olive: "Olive.png",
  orchid: "Orchid.png",
  pansy: "Pansy.png",
  peony: "Peony.png",
  petunia: "Petunia.png",
  poppy: "Poppy.png",
  rose: "Rose.png",
  rosemary: "Rosemary.png",
  snapdragon: "Snapdragon.png",
  sunflower: "Sunflower.png",
  "sweet-pea": "Sweet Pea.png",
  tansy: "Tansy.png",
  thistle: "Thistle.png",
  tulip: "Tulip.png",
  violet: "Violet.png",
  wheat: "Wheat.png",
  yarrow: "Yarrow.png",
  zinnia: "Zinnia.png"
};

const FEELING_MAP = {
  amaryllis: ["Brave", "Reflective"],
  anemone: ["Grieving", "Romantic"],
  "apple-blossom": ["Romantic", "Hopeful"],
  aster: ["Joyful", "Reflective"],
  azalea: ["Cautious", "Reflective"],
  "baby-s-breath": ["Joyful", "Romantic"],
  basil: ["Cautious"],
  begonia: ["Cautious"],
  belladonna: ["Secretive", "Cautious"],
  bluebell: ["Reflective", "Romantic"],
  buttercup: ["Joyful"],
  camellia: ["Romantic"],
  carnation: ["Romantic", "Grieving"],
  cattail: ["Hopeful"],
  chamomile: ["Brave", "Hopeful"],
  chrysanthemum: ["Grieving"],
  clematis: ["Reflective"],
  clover: ["Hopeful", "Joyful"],
  columbine: ["Cautious"],
  cornflower: ["Romantic", "Hopeful"],
  cowslip: ["Joyful"],
  crocus: ["Joyful"],
  cypress: ["Grieving"],
  daffodil: ["Romantic", "Grieving"],
  dahlia: ["Romantic"],
  daisy: ["Joyful"],
  dandelion: ["Reflective"],
  datura: ["Cautious", "Secretive"],
  dogwood: ["Romantic", "Hopeful"],
  edelweiss: ["Brave"],
  eucalyptus: ["Hopeful"],
  fern: ["Secretive"],
  "forget-me-not": ["Nostalgic"],
  foxglove: ["Secretive", "Cautious"],
  gladiolus: ["Romantic", "Brave"],
  hawthorn: ["Hopeful"],
  heather: ["Hopeful"],
  hellebore: ["Brave", "Reflective"],
  hemlock: ["Grieving"],
  holly: ["Secretive", "Reflective"],
  honeysuckle: ["Romantic"],
  hydrangea: ["Cautious"],
  hyacinth: ["Reflective"],
  hyssop: ["Reflective"],
  iris: ["Brave", "Reflective"],
  ivy: ["Romantic", "Reflective"],
  jasmine: ["Joyful", "Friendship"],
  "lady-slipper": ["Cautious"],
  larkspur: ["Joyful"],
  laurel: ["Brave"],
  lavender: ["Cautious"],
  lilac: ["Nostalgic", "Romantic"],
  lily: ["Joyful", "Reflective"],
  "lily-of-the-valley": ["Hopeful", "Joyful"],
  magnolia: ["Reflective"],
  marigold: ["Grieving"],
  mint: ["Hopeful", "Grieving"],
  mistletoe: ["Hopeful"],
  monkshood: ["Brave"],
  myrtle: ["Romantic"],
  nettle: ["Cautious"],
  oak: ["Brave"],
  oleander: ["Cautious"],
  olive: ["Reflective", "Hopeful"],
  "orange-blossom": ["Romantic"],
  orchid: ["Joyful"],
  pansy: ["Nostalgic", "Reflective"],
  passionflower: ["Reflective"],
  peony: ["Reflective"],
  petunia: ["Cautious"],
  poppy: ["Grieving"],
  protea: ["Brave", "Hopeful"],
  "queen-anne-s-lace": ["Hopeful", "Secretive"],
  rose: ["Romantic"],
  rosemary: ["Nostalgic", "Reflective"],
  rue: ["Grieving", "Reflective"],
  snapdragon: ["Cautious"],
  snowdrop: ["Hopeful", "Grieving"],
  sunflower: ["Joyful", "Cautious"],
  "sweet-pea": ["Friendship", "Joyful"],
  "sweet-william": ["Brave", "Romantic"],
  tansy: ["Cautious"],
  thistle: ["Cautious"],
  tulip: ["Romantic"],
  violet: ["Reflective"],
  wheat: ["Hopeful"],
  willow: ["Grieving"],
  wormwood: ["Grieving", "Cautious"],
  yarrow: ["Grieving", "Hopeful"],
  zinnia: ["Friendship", "Nostalgic"]
};

const QUOTE_TAGS = {
  Romantic: ["love"],
  Friendship: ["friendship", "gratitude"],
  Hopeful: ["hope", "inspirational"],
  Joyful: ["happiness", "life"],
  Nostalgic: ["wisdom", "life"],
  Brave: ["courage", "success", "inspirational"],
  Secretive: ["wisdom", "life"],
  Reflective: ["wisdom", "faith", "forgiveness"],
  Grieving: ["sadness", "life"],
  Cautious: ["wisdom", "life"]
};

const state = {
  activeFeeling: "All",
  flowers: normalizeFlowers(RAW_FLOWERS),
  selectedFlowerId: null,
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

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFlowers(flowers) {
  return flowers.map((flower) => {
    const id = slugify(flower.name);
    const feelings = FEELING_MAP[id] || ["Reflective"];
    const quoteTags = [...new Set(feelings.flatMap((feeling) => QUOTE_TAGS[feeling] || ["life"]))];
    const note = DETAIL_NOTES[id] || {};
    const imageFile = IMAGE_MAP[id];
    return {
      id,
      name: flower.name,
      meaning: flower.meaning,
      scientificName: flower.scientificName || note.scientificName || "",
      botanicalLookupTerm: flower.scientificName || note.scientificName || flower.name,
      perenualId: null,
      feelings,
      quoteTags,
      image: imageFile
        ? {
            src: `${REFERENCE_IMAGE_ROOT}/${imageFile}`,
            alt: `${flower.name} illustration`
          }
        : null,
      description:
        note.description || "This entry was migrated from the reference project. Botanical notes can be enriched next.",
      pairWith: note.pairWith || [],
      source: "migrated-reference"
    };
  });
}

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
  const selected = getSelectedFlower();

  if (!selected) {
    elements.flowerList.innerHTML = '<p class="empty-state">No flowers match this feeling yet.</p>';
    elements.filterSummary.textContent = "No flowers available for the current filter.";
    return;
  }

  state.selectedFlowerId = selected.id;
  elements.filterSummary.textContent =
    state.activeFeeling === "All"
      ? `Showing all ${visibleFlowers.length} migrated flowers.`
      : `Showing ${visibleFlowers.length} flowers that feel ${state.activeFeeling.toLowerCase()}.`;

  elements.flowerList.innerHTML = "";
  visibleFlowers.forEach((flower) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `flower-pill ${flower.id === state.selectedFlowerId ? "is-selected" : ""}`;
    button.dataset.flowerId = flower.id;
    button.innerHTML = `<span>${flower.name}</span><small>${flower.meaning}</small>`;
    elements.flowerList.appendChild(button);
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
  elements.flowerScientific.textContent = flower.scientificName || "Scientific name still being migrated";
  elements.flowerMeaning.textContent = flower.meaning;
  elements.flowerDescription.textContent = flower.description;

  if (flower.image) {
    elements.imageFrame.innerHTML = `<img src="${flower.image.src}" alt="${flower.image.alt}">`;
  } else {
    elements.imageFrame.innerHTML = `
      <div class="image-placeholder">
        <span>Image Pending</span>
        <strong>${flower.name}</strong>
      </div>
    `;
  }

  elements.pairList.innerHTML = "";
  if (flower.pairWith.length) {
    flower.pairWith.forEach((pairing) => {
      const item = document.createElement("li");
      item.textContent = pairing;
      elements.pairList.appendChild(item);
    });
  } else {
    elements.pairList.innerHTML = "<li>Pairings will be enriched from the reference detail pages next.</li>";
  }

  elements.botanicalFacts.innerHTML = `<p class="status-line">Loading botanical facts...</p>`;
  elements.quoteBlock.innerHTML = `<p class="status-line">Looking for a matching quote...</p>`;

  fetchDynamicDetails(flower);
}

async function fetchDynamicDetails(flower) {
  const [botanical, quote] = await Promise.allSettled([
    fetchBotanicalFacts(flower),
    fetchQuote(flower)
  ]);

  if (botanical.status === "fulfilled") {
    renderBotanicalFacts(botanical.value);
  } else {
    renderBotanicalFacts({
      error:
        botanical.reason?.message ||
        "Botanical details are unavailable right now, but the flower meaning entry is still available."
    });
  }

  if (quote.status === "fulfilled") {
    renderQuote(quote.value);
  } else {
    renderQuote({
      content: "No quote is available right now. The mood tags are ready for the next API pass.",
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
    throw new Error("Perenual search failed. The static floriography entry is still available.");
  }

  const searchData = await searchResponse.json();
  const match = searchData?.data?.[0];

  if (!match?.id) {
    return {
      error:
        "Perenual could not find this flower yet. The symbolic meaning is still available while we refine the botanical match."
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
    scientificName: detailData.scientific_name?.[0] || flower.scientificName || "",
    watering: detailData.watering || "Unknown",
    sunlight: Array.isArray(detailData.sunlight) ? detailData.sunlight.join(", ") : detailData.sunlight || "Unknown",
    cycle: detailData.cycle || "Unknown"
  };
}

async function fetchQuote(flower) {
  if (API_CONFIG.quoteProvider === "paperquotes") {
    const quoteUrl = new URL("https://api.paperquotes.com/apiv1/quotes/");
    quoteUrl.searchParams.set("tags", flower.quoteTags.join(","));
    quoteUrl.searchParams.set("limit", "1");

    const response = await fetch(quoteUrl);
    if (!response.ok) {
      throw new Error("PaperQuotes did not respond.");
    }

    const payload = await response.json();
    const quote = payload?.results?.[0] || payload?.quotes?.[0] || payload?.[0];
    if (!quote) {
      throw new Error("No quote matched the selected mood.");
    }

    return {
      content: quote.quote || quote.content,
      author: quote.author || "Unknown"
    };
  }

  const quotableUrl = new URL("https://api.quotable.io/random");
  quotableUrl.searchParams.set("tags", flower.quoteTags.join("|"));

  const response = await fetch(quotableUrl);
  if (!response.ok) {
    throw new Error("Quotable did not respond.");
  }

  const payload = await response.json();
  return {
    content: payload.content,
    author: payload.author
  };
}

function renderBotanicalFacts(result) {
  if (result.error) {
    elements.botanicalFacts.innerHTML = `<p class="status-line">${result.error}</p>`;
    return;
  }

  elements.botanicalFacts.innerHTML = `
    <dl class="facts-list">
      <div><dt>Scientific Name</dt><dd>${result.scientificName || "Unknown"}</dd></div>
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
    item.innerHTML = `
      <div>
        <h3>${flower.name}</h3>
        <p>${flower.meaning}</p>
      </div>
      <button type="button" class="text-button" data-remove-id="${flower.id}">Remove</button>
    `;
    elements.gardenList.appendChild(item);
  });
}

function addToGarden() {
  const flower = getSelectedFlower();
  if (!flower) return;

  if (state.garden.some((item) => item.id === flower.id)) {
    elements.gardenButton.textContent = "Already Saved";
    window.setTimeout(() => {
      elements.gardenButton.textContent = "Pick For My Garden";
    }, 1200);
    return;
  }

  state.garden.unshift({
    id: flower.id,
    name: flower.name,
    meaning: flower.meaning,
    image: flower.image?.src || null,
    scientificName: flower.scientificName || "",
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
  state.selectedFlowerId = state.flowers[0]?.id || null;
  renderFeelingFilters();
  renderFlowerList();
  renderFlowerDetails();
  renderGarden();
  setupEvents();
}

init();
