
document.addEventListener("DOMContentLoaded", function () {
  // Demo coordinates (latitude, longitude)
  // const lat = 28.6139;   // Delhi latitude
  // const lng = 77.2090;   // Delhi longitude

  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;
  const lat = mapDiv.dataset.lat;
  const lng = mapDiv.dataset.lng;

  // Create map
  const map = L.map("map").setView([lat, lng], 12);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Add marker
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup("<b>Listing Location</b>")
    .openPopup();
});
