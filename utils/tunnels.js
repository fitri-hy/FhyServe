const fs = require("fs");
const path = require("path");
const localtunnel = require("localtunnel");
const { isDevelopment, getBasePath } = require("./pathResource");

const basePath = getBasePath();
const tunnelsData = isDevelopment()
  ? path.join(basePath, "config", "tunnels.json")
  : path.join(basePath, "resources", "config", "tunnels.json");

let tunnels = {};
/**
 * Loads tunnel configurations from the JSON file
 * Sets all tunnels to STOPPED state and clears instances on application start
 */
function loadTunnels() {
  if (fs.existsSync(tunnelsData)) {
    try {
      const raw = fs.readFileSync(tunnelsData);
      const parsed = JSON.parse(raw);
      tunnels = parsed;
      for (const id in tunnels) {
        tunnels[id].tunnelInstance = undefined;
        tunnels[id].status = "STOPPED";
        tunnels[id].url = null;
      }
    } catch (e) {
      tunnels = {};
    }
  } else {
    tunnels = {};
  }
}

/**
 * Saves tunnel configurations to the JSON file
 * Excludes runtime-specific properties like tunnelInstance
 */
function saveTunnels() {
  const toSave = {};
  for (const id in tunnels) {
    const { id: tid, port, url, status } = tunnels[id];
    toSave[tid] = { id: tid, port, url, status };
  }
  fs.writeFileSync(tunnelsData, JSON.stringify(toSave, null, 2));
}

/**
 * Generates a random ID for new tunnels
 * @returns {string} A unique identifier for a tunnel
 */
function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Starts a localtunnel instance for the specified tunnel
 * @param {string} id - The ID of the tunnel to start
 * @returns {Promise<string>} The URL of the started tunnel
 * @throws {Error} If tunnel not found or connection fails
 */
async function startTunnel(id) {
  const tunnelData = tunnels[id];
  if (!tunnelData) throw new Error("Tunnel not found.");

  if (tunnelData.tunnelInstance) {
    return tunnelData.url;
  }

  try {
    const tunnelInstance = await localtunnel({ port: tunnelData.port });

    tunnelInstance.on("close", () => {
      tunnels[id].tunnelInstance = undefined;
      tunnels[id].status = "STOPPED";
      tunnels[id].url = null;
      saveTunnels();
    });

    tunnels[id].tunnelInstance = tunnelInstance;
    tunnels[id].status = "RUNNING";
    tunnels[id].url = tunnelInstance.url;
    saveTunnels();

    return tunnelInstance.url;
  } catch (err) {
    tunnels[id].tunnelInstance = undefined;
    tunnels[id].status = "ERROR";
    tunnels[id].url = null;
    saveTunnels();

    console.error(`Failed to start tunnel for id ${id}:`, err.message);
    throw new Error(`Failed to connect to LocalTunnel: ${err.message}`);
  }
}

/**
 * Stops a running tunnel
 * @param {string} id - The ID of the tunnel to stop
 * @returns {boolean} True if tunnel was stopped, false if it wasn't running
 * @throws {Error} If tunnel not found
 */
function stopTunnel(id) {
  const tunnelData = tunnels[id];
  if (!tunnelData) throw new Error("Tunnel not found.");

  if (tunnelData.tunnelInstance) {
    tunnelData.tunnelInstance.close();
    tunnelData.tunnelInstance = undefined;
    tunnelData.status = "STOPPED";
    tunnelData.url = null;
    saveTunnels();
    return true;
  }
  return false;
}

/**
 * Creates a new tunnel configuration
 * @param {number} port - The local port to expose
 * @returns {Object} The created tunnel configuration
 */
function createTunnel(port) {
  const id = generateId();
  tunnels[id] = {
    id,
    port,
    url: null,
    status: "STOPPED",
    tunnelInstance: undefined,
  };
  saveTunnels();
  return tunnels[id];
}

/**
 * Deletes a tunnel configuration
 * @param {string} id - The ID of the tunnel to delete
 * @returns {boolean} True if tunnel was deleted, false if not found
 */
function deleteTunnel(id) {
  if (tunnels[id]) {
    if (tunnels[id].tunnelInstance) {
      tunnels[id].tunnelInstance.close();
    }
    delete tunnels[id];
    saveTunnels();
    return true;
  }
  return false;
}

/**
 * Gets all tunnel configurations
 * @returns {Array<Object>} Array of tunnel configurations without runtime instances
 */
function getAllTunnels() {
  return Object.values(tunnels).map(({ id, port, url, status }) => ({
    id,
    port,
    url,
    status,
  }));
}

/**
 * Stops all running tunnels
 * @returns {Promise<void>}
 */
async function stopAllTunnels() {
  const allTunnels = getAllTunnels();
  for (const t of allTunnels) {
    if (t.status === "RUNNING") {
      try {
        stopTunnel(t.id);
      } catch (err) {
        console.error(`Failed to stop tunnel ${t.id}:`, err);
      }
    }
  }
}

loadTunnels();

module.exports = {
  startTunnel,
  stopTunnel,
  createTunnel,
  deleteTunnel,
  getAllTunnels,
  stopAllTunnels,
};
