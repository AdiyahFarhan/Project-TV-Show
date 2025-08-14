const rootElem = document.getElementById("root"); // The main container for episode cards
let totalEpisodesCount = 0;

//Setup function to initialize the page / called on page load
async function setup() {
  // Fetch all episodes from the API
  const apiURL = "https://api.tvmaze.com/shows/82/episodes";
  const loadingDiv = document.getElementById("loading");
  try {
    // Show loading message
    loadingDiv.style.display = "block";
    rootElem.style.display = "none";

    // Fetch the episodes
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`Http error! Status: ${response.status}`);
    }
    const allEpisodes = await response.json();
    totalEpisodesCount = allEpisodes.length; // Store total count for later use

    // Hide loading message, show root element
    loadingDiv.style.display = "none";
    rootElem.style.display = "flex";

    // Initialize the page with episodes
    renderEpisodes(allEpisodes);
    setupSearch(allEpisodes);
    setupEpisodeSelector(allEpisodes);
  } catch (error) {
    loadingDiv.textContent = "Failed to load episodes. Please try again later.";
    loadingDiv.style.display = "block";
    console.error("Error fetching episodes:", error);
  }
}

// Renders the given episodes array to the DOM
function renderEpisodes(episodes) {
  //const rootElem = document.getElementById("root");
  // Remove all episode cards except the template
  rootElem.querySelectorAll(".episode-card").forEach((card) => card.remove());
  episodes.forEach(makePageForEpisodes);
  updateMatchCount(episodes.length);
}

// Sets up the live search functionality
function setupSearch(allEpisodes) {
  const searchBox = document.getElementById("search-box");
  searchBox.addEventListener("input", function () {
    const term = searchBox.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term)
    );

    renderEpisodes(filtered);
    // Reset selector to "all" when searching
    document.getElementById("episode-select").value = "all";
  });
}

// Update match count in the format "Showing 10/73 episodes"
function updateMatchCount(count) {
  document.getElementById(
    "match-count"
  ).textContent = `Showing ${count}/${totalEpisodesCount} episode(s)`;
}

// Sets up the episode selector dropdown
function setupEpisodeSelector(allEpisodes) {
  const select = document.getElementById("episode-select");
  // Populate the select options
  allEpisodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = episodeCode(ep.season, ep.number);
    option.textContent = `${episodeCode(ep.season, ep.number)} - ${ep.name}`;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    const value = select.value;
    if (value === "all") {
      renderEpisodes(allEpisodes);
    } else {
      const selected = allEpisodes.find(
        (ep) => episodeCode(ep.season, ep.number) === value
      );
      renderEpisodes(selected ? [selected] : []);
    }
    // Clear search box when selecting from dropdown
    document.getElementById("search-box").value = "";
  });
}

function makePageForEpisodes(episode) {
  const rootElem = document.getElementById("root");

  // Clone the template content
  // and fill it with episode data
  const episodeCard = document
    .getElementById("episode-template")
    .content.cloneNode(true);

  // Set the episode title, image, and summary
  // using the data from the episode
  let epCode = episodeCode(episode.season, episode.number);
  episodeCard.querySelector(".episode-title").textContent =
    episode.name + " - " + epCode;
  episodeCard.querySelector(".episode-image").src = episode.image.medium;
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;

  // Append the episode card to the root element
  rootElem.appendChild(episodeCard);
}

// Format the season and episode numbers to be two digits
// to create a code like "S01E01"
function episodeCode(season, episode) {
  const code = `S${season.toString().padStart(2, "0")}E${episode
    .toString()
    .padStart(2, "0")}`;
  return code;
}

window.onload = setup;
