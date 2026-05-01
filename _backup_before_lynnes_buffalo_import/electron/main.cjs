const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

const GAME_PORT = process.env.GAME_PORT || "43123";
const GAME_URL = "http://127.0.0.1:" + GAME_PORT;
const STARTUP_TIMEOUT_MS = 20000;

let gameServer = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1420,
    height: 940,
    minWidth: 1120,
    minHeight: 760,
    title: "Lynne AI Slot Deluxe",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(GAME_URL);
}

function stopGameServer() {
  if (!gameServer) {
    return;
  }
  gameServer.kill();
  gameServer = null;
}

function waitForServerReady(url, timeoutMs) {
  const startedAt = Date.now();

  return new Promise(function (resolve, reject) {
    function check() {
      fetch(url + "/health")
        .then(function (response) {
          if (response.ok) {
            resolve();
            return;
          }

          if (Date.now() - startedAt > timeoutMs) {
            reject(new Error("Game server started but health check failed."));
            return;
          }
          setTimeout(check, 350);
        })
        .catch(function () {
          if (Date.now() - startedAt > timeoutMs) {
            reject(new Error("Timed out waiting for local game server."));
            return;
          }
          setTimeout(check, 350);
        });
    }

    check();
  });
}

async function startGameServer() {
  const serverEntry = path.join(app.getAppPath(), "server.js");
  const env = {
    ...process.env,
    PORT: String(GAME_PORT),
  };

  gameServer = spawn(process.execPath, [serverEntry], {
    env,
    stdio: "inherit",
    windowsHide: true,
  });

  gameServer.on("exit", function () {
    gameServer = null;
  });

  await waitForServerReady(GAME_URL, STARTUP_TIMEOUT_MS);
}

app.whenReady()
  .then(function () {
    return startGameServer();
  })
  .then(function () {
    createWindow();
  })
  .catch(function (error) {
    console.error(error);
    app.quit();
  });

app.on("window-all-closed", function () {
  stopGameServer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", function () {
  stopGameServer();
});

