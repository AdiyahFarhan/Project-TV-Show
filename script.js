const rootElem = document.getElementById("root");
let totalEpisodesCount = 0;
const showsCache = {};
const episodesCache = {};

async function setup() {
  await setupShowSelector();
}

async function setupShowSelector() {
  const showSelect = document.getElementById("show-select");
  let shows = showsCache.list;
  if (!shows) {
    const response = await fetch("https://api.tvmaze.com/shows");
    shows = await response.json();
    // Alphabetical order, case-insensitive
    shows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
    showsCache.list = shows;
  }
  // Populate show select
  showSelect.innerHTML = "";
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  // Load first show by default
  await loadEpisodesForShow(shows[0].id);

  showSelect.addEventListener("change", async function () {
    await loadEpisodesForShow(showSelect.value);
  });
}

async function loadEpisodesForShow(showId) {
  if (!showId) return;
  let episodes = episodesCache[showId];
  if (!episodes) {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    episodes = await response.json();
    episodesCache[showId] = episodes;
  }
  totalEpisodesCount = episodes.length;
  renderEpisodes(episodes);
  setupSearch(episodes);
  setupEpisodeSelector(episodes);
  document.getElementById("search-box").value = "";
  document.getElementById("episode-select").value = "all";
}

function renderEpisodes(episodes) {
  rootElem.querySelectorAll(".episode-card").forEach((card) => card.remove());
  episodes.forEach(makePageForEpisodes);
  updateMatchCount(episodes.length);
}

function setupSearch(allEpisodes) {
  const searchBox = document.getElementById("search-box");
  searchBox.oninput = function () {
    const term = searchBox.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term)
    );
    renderEpisodes(filtered);
    document.getElementById("episode-select").value = "all";
  };
}

function updateMatchCount(count) {
  document.getElementById(
    "match-count"
  ).textContent = `Showing ${count}/${totalEpisodesCount} episode(s)`;
}

function setupEpisodeSelector(allEpisodes) {
  const select = document.getElementById("episode-select");
  select.innerHTML = '<option value="all">Show all episodes</option>';
  allEpisodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = episodeCode(ep.season, ep.number);
    option.textContent = `${episodeCode(ep.season, ep.number)} - ${ep.name}`;
    select.appendChild(option);
  });

  select.onchange = function () {
    const value = select.value;
    if (value === "all") {
      renderEpisodes(allEpisodes);
    } else {
      const selected = allEpisodes.find(
        (ep) => episodeCode(ep.season, ep.number) === value
      );
      renderEpisodes(selected ? [selected] : []);
    }
    document.getElementById("search-box").value = "";
  };
}

function makePageForEpisodes(episode) {
  const episodeCard = document
    .getElementById("episode-template")
    .content.cloneNode(true);
  let epCode = episodeCode(episode.season, episode.number);
  episodeCard.querySelector(".episode-title").textContent =
    episode.name + " - " + epCode;
  episodeCard.querySelector(".episode-image").src = episode.image?.medium || "";
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;
  rootElem.appendChild(episodeCard);
}

function episodeCode(season, episode) {
  return `S${season.toString().padStart(2, "0")}E${episode
    .toString()
    .padStart(2, "0")}`;
}

window.onload = setup;
