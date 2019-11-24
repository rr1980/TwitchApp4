declare global {
    interface Window {
      require: any;
    }
  }
declare var Twitch: any;
// declare var ELECTRON_DISABLE_SECURITY_WARNINGS: boolean;

import { remote } from "electron";
import * as prompt from "electron-prompt";



// ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        handleWindowControls();
    }
};

function handleWindowControls() {

    const win = remote.getCurrentWindow();
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById("min-button").addEventListener("click", (event) => {
        win.minimize();
    });

    document.getElementById("max-button").addEventListener("click", (event) => {
        win.maximize();
    });

    document.getElementById("restore-button").addEventListener("click", (event) => {
        win.unmaximize();
    });

    document.getElementById("close-button").addEventListener("click", (event) => {
        win.close();
    });

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on("maximize", toggleMaxRestoreButtons);
    win.on("unmaximize", toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.body.classList.add("maximized");
        } else {
            document.body.classList.remove("maximized");
        }
    }
}

const getStoragedChannel = () => {
    let channel = localStorage.getItem("channel");
    if (!channel) {
        localStorage.setItem("channel", "noway4u_sir");
        channel = "noway4u_sir";
    }

    document.getElementById("window-title-content").innerText = "TwitchApp3 - " + channel;
    return channel;
};

const setStoragedChannel = (channel: string) => {
    if (!channel) {
        return;
    }

    document.getElementById("window-title-content").innerText = "TwitchApp3 - " + channel;
    localStorage.setItem("channel", channel);
};

const twitchOptions = {
    channel: getStoragedChannel(),
    height: "100%",
    width: "100%",
};


window.onload = () => {
    const player = new Twitch.Player("twitch_container", twitchOptions);

    document.getElementById("nav").addEventListener("mousedown", e => {
        prompt({
            label: "channel:",
            inputAttrs: {
                required: true,
                type: "text",
            },
            // alwaysOnTop: true,
            // menuBarVisible: false,
            title: "settings",
            type: 'input',
            useHtmlLabel: true,
            value: twitchOptions.channel,
        }).then((newChannel: string) => {
            if (newChannel !== null) {
                twitchOptions.channel = newChannel;
                setStoragedChannel(newChannel);
                player.setChannel(newChannel);
            }
        }).catch(console.error);
    });
}