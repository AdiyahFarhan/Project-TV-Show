// Get Template Elements
const showContainer = document.getElementById("show-container");
const episodeContainer = document.getElementById("episode-container");

let totalEpisodesCount = 0; // Total number of episodes
let shows = []; // Array to hold all shows

/************ Main Setup Function, calls on page load ************/

async function setup() {
  // Hide the episode search container and back link initially
  document.getElementById("episode-search-container").style.display = "none";
  document.getElementById("back-to-shows").style.display = "none";

  // Show loading indicator
  const loadingDiv = document.getElementById("loading");

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Http error! Status: ${response.status}`);
    }
    shows = await response.json();

    setupShowSelector(shows);
    setupShowSearch(shows);
    renderShows(shows);
  } catch (error) {
    loadingDiv.textContent = "Failed to load episodes. Please try again later.";
    console.error("Failed to fetch shows:", error);
  }
}

/******************* Episode Functions *******************/

/* Functions for Rendering Episodes, Make Page for Episodes (creates episode cards) */

function renderEpisodes(episodes) {
  episodeContainer
    .querySelectorAll(".episode-card")
    .forEach((card) => card.remove());

  const backLink = document.getElementById("back-to-shows"); // Back link element

  // Show the relevant UI elements
  document.getElementById("show-search-container").style.display = "none";
  document.getElementById("episode-search-container").style.display = "";
  backLink.style.display = "";

  // Make episode card for each episode
  episodes.forEach(makePageForEpisodes);

  //Display the match count / Total episodes
  episodeMatchCount(episodes.length);

  //Setup the link to get back to the shows listing
  backLink.href = "#";
  backLink.addEventListener("click", (e) => {
    e.preventDefault();

    // Show shows, hide episodes UI
    document.getElementById("show-search-container").style.display = "";
    document.getElementById("episode-search-container").style.display = "none";
    backLink.style.display = "none";
    //document.getElementById("match-count").textContent = "";

    // Remove all episode cards
    episodeContainer
      .querySelectorAll(".episode-card")
      .forEach((card) => card.remove());

    // Show all shows again
    setupShowSelector(shows);
    renderShows(shows);

    // Reset the show selector to the first option
    document.getElementById("show-select").selectedIndex = 0;
    document.getElementById("showSearch").value = "";
  });
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
  episodeContainer.appendChild(episodeCard);
}

/* Function for Setting up episode search, filtering episodes by title or summary */

function setupEpisodeSearch(allEpisodes) {
  const episodeSearch = document.getElementById("episode-search");
  episodeSearch.oninput = function () {
    const term = episodeSearch.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term)
    );
    renderEpisodes(filtered);
    document.getElementById("episode-select").value = "all";
  };
}

/* Function for setting up episode selector */

function setupEpisodeSelector(allEpisodes) {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.innerHTML = '<option value="all">Show all episodes</option>';
  allEpisodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = episodeCode(ep.season, ep.number);
    option.textContent = `${episodeCode(ep.season, ep.number)} - ${ep.name}`;
    episodeSelect.appendChild(option);
  });
  episodeSelect.onchange = function () {
    const value = episodeSelect.value;
    if (value === "all") {
      renderEpisodes(allEpisodes);
    } else {
      const selected = allEpisodes.find(
        (ep) => episodeCode(ep.season, ep.number) === value
      );
      renderEpisodes(selected ? [selected] : []);
    }
    document.getElementById("episode-search").value = "";
  };
}

/* Function for displaying episode match count */

function episodeMatchCount(count) {
  document.getElementById(
    "match-count"
  ).textContent = `Showing ${count}/${totalEpisodesCount} episode(s)`;
}

/* Function for generating episode codes */

function episodeCode(season, episode) {
  return `S${season.toString().padStart(2, "0")}E${episode
    .toString()
    .padStart(2, "0")}`;
}

/****************Shows Functions *******************/

/* Functions for Rendering shows and Making show cards */

function renderShows(shows) {
  showContainer.querySelectorAll(".show-card").forEach((card) => card.remove());
  shows.forEach(makePageForShow);
  showMatchCount(shows.length);
}

function makePageForShow(show) {
  const template = document.getElementById("show-template");
  const showCard = template.content.cloneNode(true);

  showCard.querySelector(".show-title").textContent = show.name;
  showCard.querySelector(".show-summary").innerHTML = show.summary;
  showCard.querySelector(
    ".show-genres"
  ).innerHTML = `<strong>Genres:</strong> ${show.genres.join(", ")}`;
  showCard.querySelector(
    ".show-status"
  ).innerHTML = `<strong>Status:</strong> ${show.status}`;
  showCard.querySelector(".show-rating").innerHTML = show.rating?.average
    ? `<strong>Rating:</strong> ${show.rating.average}`
    : "<strong>Rating:</strong> N/A";
  showCard.querySelector(
    ".show-runtime"
  ).innerHTML = `<strong>Runtime:</strong> ${show.runtime} minutes`;
  const img = showCard.querySelector(".show-image");
  img.src = show.image?.medium || "levels/example-screenshots/placeholder.png";
  img.alt = show.name;

  // Add the click handler to the show title inside this card
  const showTitle = showCard.querySelector(".show-title");
  showTitle.addEventListener("click", async function () {
    showContainer
      .querySelectorAll(".show-card")
      .forEach((card) => card.remove());
    await loadEpisodesForShow(show.id);
  });
  showContainer.appendChild(showCard);
}

/* Function for setting up show search, filtering shows based on user input */

function setupShowSearch(allShows) {
  const showSearch = document.getElementById("showSearch");
  showSearch.oninput = function () {
    const term = showSearch.value.toLowerCase();
    const filtered = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(term) ||
        show.summary.toLowerCase().includes(term) ||
        show.genres.some((genre) => genre.toLowerCase().includes(term))
    );
    renderShows(filtered);
    setupShowSelector(filtered);
    //document.getElementById("show-select").value = "all-shows";
  };
}

/* Function for setting up show selector */

async function setupShowSelector(shows) {
  // Alphabetical order, case-insensitive
  shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  // Populate show select
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = '<option value="all-shows">Show all Shows</option>';

  // Add each show options in alphabetical order
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", async function () {
    showContainer
      .querySelectorAll(".show-card")
      .forEach((card) => card.remove());
    await loadEpisodesForShow(showSelect.value);
  });
}

/* Function for loading episodes for a specific show */

async function loadEpisodesForShow(showId) {
  if (!showId) return;
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );
  const episodes = await response.json();
  totalEpisodesCount = episodes.length;
  renderEpisodes(episodes);
  setupEpisodeSearch(episodes);
  setupEpisodeSelector(episodes);
  document.getElementById("episode-search").value = "";
  document.getElementById("episode-select").value = "all";
}

/* Function for showing the number of matching shows */

function showMatchCount(count) {
  document.getElementById("searchCount").textContent = `Found ${count} show(s)`;
}

window.onload = setup;
