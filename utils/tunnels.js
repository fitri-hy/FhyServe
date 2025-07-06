const fs = require("fs");
const path = require("path");
const localtunnel = require("localtunnel");
const { isDevelopment, getBasePath } = require("./pathResource");

const basePath = getBasePath();
const tunnelsData = isDevelopment()
  ? path.join(basePath, "config", "tunnels.json")
  : path.join(basePath, "resources", "config", "tunnels.json");

let tunnels = {};

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

function saveTunnels() {
  const toSave = {};
  for (const id in tunnels) {
    const { id: tid, port, url, status } = tunnels[id];
    toSave[tid] = { id: tid, port, url, status };
  }
  fs.writeFileSync(tunnelsData, JSON.stringify(toSave, null, 2));
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

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

function getAllTunnels() {
  return Object.values(tunnels).map(({ id, port, url, status }) => ({
    id,
    port,
    url,
    status,
  }));
}

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
