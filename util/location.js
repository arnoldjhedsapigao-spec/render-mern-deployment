const axios = require("axios");

const HttpError = require("../models/http-error");

async function getCoordsForAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?addressdetails=1&q=${encodeURIComponent(address)}&format=jsonv2&limit=1`;

  const response = await axios.get(url, {
    headers: { "User-Agent": "MyNodeApp/1.0" }, // Required by OSM policy
  });

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422,
    );
    throw error;
  }

  const { lat, lon } = response.data[0];
  console.log(`Address: ${address}\nLat: ${lat}, Lon: ${lon}`);
  const lng = lon;
  return { lat, lng };
}

module.exports = getCoordsForAddress;
