function setup() {
  const allEpisodes = getAllEpisodes();
  renderEpisodes(allEpisodes);
  setupSearch(allEpisodes);
  setupEpisodeSelector(allEpisodes);
}

// Renders the given episodes array to the DOM
function renderEpisodes(episodes) {
  const rootElem = document.getElementById("root");
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

// Updates the match count display
function updateMatchCount(count) {
  const matchCount = document.getElementById("match-count");
  matchCount.textContent = count === 1 ? "1 match" : `${count} matches`;
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

function episodeCode(season, episode) {
  // Format the season and episode numbers to be two digits
  // to create a code like "S01E01"
  const code = `S${season.toString().padStart(2, "0")}E${episode
    .toString()
    .padStart(2, "0")}`;
  return code;
}

window.onload = setup;
