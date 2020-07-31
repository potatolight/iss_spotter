const request = require('request')

const fetchMyIP = function(callback) { 
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org?format=json', (error, response, body) => {

    if(error) {
      return callback(error, null)
    } 
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const ip = JSON.parse(body).ip;
      return callback(null, ip)
  })
}

const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/json/${ip}`, (error, response, body) => {
    if(error) {
      return callback(error, null)
    }
    if(response.statusCode !== 200) {
      return callback(Error(`Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`), null);
    }

    const { latitude, longitude } = JSON.parse(body).data;

    callback(null, { latitude, longitude });
  })
}

const fetchISSFlyOverTimes = function(coords, callback) {
  request("http://api.open-notify.org/iss-pass.json?lat="+coords["latitude"] + "&lon=" + coords["longitude"], (error, response, body) => {
    if(error) {
      return callback(error, null);
    }
    if(response.statusCode !== 200) {
      let meg = `Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`
      return callback(Error(meg), null)
    }
    const passes = JSON.parse(body).response
    return callback(null, passes)
  })
};
// iss.js 

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */ 
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };