import { FLOWERS } from "./data/flowers.js";

const STORAGE_KEY = "personalGarden:v1";
const API_CONFIG = {
  wikipediaSummaryBaseUrl: "https://en.wikipedia.org/api/rest_v1/page/summary/",
  wikipediaSearchBaseUrl: "https://en.wikipedia.org/w/rest.php/v1/search/page",
  geocodingBaseUrl: "https://geocoding-api.open-meteo.com/v1/search",
  observationBaseUrl: "https://api.inaturalist.org/v1/observations"
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

const DEFAULT_GRACEFUL_MESSAGE =
  "Something did not come through cleanly, but the flower entry is still here for you.";
let gardenStatusMessage = "";

const state = {
  activeFeeling: "All",
  flowers: FLOWERS,
  selectedFlowerId: FLOWERS[0]?.id || null,
  garden: loadGarden(),
  locationRequestId: 0
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
  pairList: document.querySelector("#pairList"),
  gardenList: document.querySelector("#gardenList"),
  gardenButton: document.querySelector("#gardenButton"),
  clearGardenButton: document.querySelector("#clearGardenButton"),
  gardenStatus: document.querySelector("#gardenStatus"),
  useLocationButton: document.querySelector("#useLocationButton"),
  cityInput: document.querySelector("#cityInput"),
  citySearchButton: document.querySelector("#citySearchButton"),
  locationResult: document.querySelector("#locationResult")
};

function loadGarden() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    gardenStatusMessage =
      "Your saved garden could not be opened just now, so the page is starting with a fresh one.";
    return [];
  }
}

function saveGarden() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.garden));
    gardenStatusMessage = "Your garden has been safely tucked away in this browser.";
    return true;
  } catch {
    gardenStatusMessage =
      "This browser would not hold onto the garden right now, so your latest change may not stay after refresh.";
    return false;
  }
}

function renderGardenStatus() {
  elements.gardenStatus.textContent = gardenStatusMessage;
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
    elements.flowerList.innerHTML = '<p class="empty-state">Nothing in the collection matches that mood just yet.</p>';
    elements.filterSummary.textContent = "Try another feeling to browse the collection from a different angle.";
    return;
  }

  state.selectedFlowerId = selectedFlower.id;
  elements.filterSummary.textContent =
    state.activeFeeling === "All"
      ? `Showing all ${visibleFlowers.length} curated flowers in Digital Floriography.`
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
    item.textContent = "This flower stands beautifully on its own, even without a preserved pairing note.";
    elements.pairList.appendChild(item);
    return;
  }

  flower.pairWith.forEach((pairing) => {
    const item = document.createElement("li");
    item.textContent = pairing;
    elements.pairList.appendChild(item);
  });
}

function renderLocationPrompt() {
  elements.locationResult.innerHTML = `
    <p class="status-line">
      Use your location or enter a city to see whether this flower has been observed nearby.
    </p>
  `;
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
  renderLocationPrompt();
  elements.botanicalFacts.innerHTML = '<p class="status-line">Gathering a few reference notes for this flower...</p>';

  fetchReferenceDetails(flower);
}

async function fetchReferenceDetails(flower) {
  const requestId = flower.id;
  try {
    const result = await fetchFlowerReference(flower);
    if (state.selectedFlowerId !== requestId) return;
    renderFlowerReference(result);
  } catch (error) {
    if (state.selectedFlowerId !== requestId) return;
    renderFlowerReference({
      scientificName: flower.scientificName || "Unknown",
      pageTitle: flower.name,
      encyclopediaDescription: "Saved flower note",
      summary: flower.description,
      note: error.message || "The live reference is resting for the moment, so the entry is leaning on its saved notes."
    });
  }
}

async function fetchFlowerReference(flower) {
  const fallbackFacts = {
    scientificName: flower.scientificName || "Unknown",
    pageTitle: flower.name,
    encyclopediaDescription: "Saved flower note",
    summary: flower.description,
    note: "A live reference note was not available, so this entry is drawing from the saved flower record instead."
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
        note: "Reference note gathered from Wikipedia."
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
    note: "Reference note gathered from Wikipedia."
  };
}

function renderFlowerReference(result) {
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

function setLocationBusy(isBusy, buttonLabel) {
  elements.useLocationButton.disabled = isBusy;
  elements.citySearchButton.disabled = isBusy;
  elements.useLocationButton.textContent = isBusy && buttonLabel === "geo" ? "Locating..." : "Use My Location";
  elements.citySearchButton.textContent = isBusy && buttonLabel === "city" ? "Searching..." : "Search By City";
}

async function geocodePlace(query) {
  const url = new URL(API_CONFIG.geocodingBaseUrl);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("The place search is taking a pause right now. You can try again in a moment or use your current location instead.");
  }

  const payload = await response.json();
  const place = payload?.results?.[0];
  if (!place) {
    throw new Error("That place did not come through clearly. Try a nearby city, a fuller place name, or your current location.");
  }

  const placeLabel = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  return {
    label: placeLabel,
    latitude: place.latitude,
    longitude: place.longitude
  };
}

async function fetchNearbyObservations(flower, location) {
  const url = new URL(API_CONFIG.observationBaseUrl);
  url.searchParams.set("taxon_name", flower.scientificName || flower.name);
  url.searchParams.set("lat", String(location.latitude));
  url.searchParams.set("lng", String(location.longitude));
  url.searchParams.set("radius", "50");
  url.searchParams.set("per_page", "3");
  url.searchParams.set("order_by", "observed_on");
  url.searchParams.set("order", "desc");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("The nearby observation service is quiet right now. Please try again in a moment.");
  }

  const payload = await response.json();
  return {
    total: payload?.total_results || 0,
    results: payload?.results || []
  };
}

function renderLocationResult({ flower, location, observations }) {
  const intro =
    observations.total > 0
      ? `${flower.name} has ${observations.total.toLocaleString()} recorded observations within 50 km of ${location.label}.`
      : `No nearby ${flower.name} observations appeared within 50 km of ${location.label} this time.`;

  const listMarkup = observations.results.length
    ? `
        <ul class="location-list">
          ${observations.results
            .map((result) => {
              const observedOn = result.observed_on || result.time_observed_at || "Date unavailable";
              const placeGuess = result.place_guess || result.location || location.label;
              return `<li><strong>${observedOn}</strong> • ${placeGuess}</li>`;
            })
            .join("")}
        </ul>
      `
    : '<p class="status-line">You might try a nearby city, a wider regional place name, or your current location for a fuller picture.</p>';

  elements.locationResult.innerHTML = `
    <p>${intro}</p>
    ${listMarkup}
    <p class="status-line">
      This view is based on public iNaturalist observations, so it offers a gentle clue rather than a strict botanical boundary.
    </p>
  `;
}

async function runNearbyCheck({ source, placeQuery } = {}) {
  const flower = getSelectedFlower();
  if (!flower) return;

  const requestId = ++state.locationRequestId;
  setLocationBusy(true, source === "geo" ? "geo" : "city");
  elements.locationResult.innerHTML = '<p class="status-line">Checking nearby observations...</p>';

  try {
    let location;

    if (source === "geo") {
      if (!("geolocation" in navigator)) {
        throw new Error("This browser cannot share location here, but you can still search by city.");
      }

      location = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({
              label: "your current location",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              reject(new Error("Location access was declined, so the city search is ready for you instead."));
              return;
            }

            reject(new Error("Your location could not be placed with confidence. A city search will be the easier path."));
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      });
    } else {
      location = await geocodePlace(placeQuery);
    }

    const observations = await fetchNearbyObservations(flower, location);
    if (requestId !== state.locationRequestId) return;
    renderLocationResult({ flower, location, observations });
  } catch (error) {
    if (requestId !== state.locationRequestId) return;
    elements.locationResult.innerHTML = `<p class="status-line">${error.message || DEFAULT_GRACEFUL_MESSAGE}</p>`;
  } finally {
    if (requestId === state.locationRequestId) {
      setLocationBusy(false);
    }
  }
}

function renderGarden() {
  if (!state.garden.length) {
    elements.gardenList.innerHTML = '<p class="empty-state">Your garden is empty for now. Save a flower to begin your collection.</p>';
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
    gardenStatusMessage = `${flower.name} is already resting in your garden.`;
    renderGardenStatus();
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
    savedAt: new Date().toISOString()
  });

  saveGarden();
  renderGarden();
  renderGardenStatus();
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
    renderGardenStatus();
    renderFlowerDetails();
  });

  elements.clearGardenButton.addEventListener("click", () => {
    state.garden = [];
    saveGarden();
    renderGarden();
    renderGardenStatus();
    renderFlowerDetails();
  });

  elements.useLocationButton.addEventListener("click", () => {
    runNearbyCheck({ source: "geo" });
  });

  elements.citySearchButton.addEventListener("click", () => {
    const query = elements.cityInput.value.trim();
    if (!query) {
      elements.locationResult.innerHTML =
        "<p class=\"status-line\">Add a city or place name first, and the page will take it from there.</p>";
      return;
    }

    runNearbyCheck({ source: "city", placeQuery: query });
  });

  elements.cityInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    elements.citySearchButton.click();
  });
}

function init() {
  renderFeelingFilters();
  renderFlowerList();
  renderFlowerDetails();
  renderGarden();
  renderGardenStatus();
  setupEvents();
}

init();
