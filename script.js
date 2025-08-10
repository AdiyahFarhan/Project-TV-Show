function setup() {
  const allEpisodes = getAllEpisodes();
  allEpisodes.map(makePageForEpisodes);
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
