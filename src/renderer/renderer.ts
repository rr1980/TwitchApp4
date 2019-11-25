import { remote } from "electron";
import { ipcRenderer } from 'electron';

declare global {
    interface Window {
        require: any;
    }
}
declare var Twitch: any;

document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        handleWindowControls();

        document.getElementById("window-channel-input").addEventListener('keydown', enterChannel);
        document.getElementById("window-channel-button").addEventListener('click', goChannel);
        document.getElementById("window-channel-check").addEventListener('change', alwaysTop);

        buildDataListElements();

        ipcRenderer.on('toggle-title-bar', (event, data) => {
            document.getElementById('main').classList.toggle("max");
            document.getElementById('twitch_container').classList.toggle("max");
        });
    }
};

function handleWindowControls() {

    const win = remote.getCurrentWindow();

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
    let currentChannel = localStorage.getItem("currentChannel");
    if (!currentChannel) {
        localStorage.setItem("currentChannel", "noway4u_sir");
        currentChannel = "noway4u_sir";
    }

    const channels_string = localStorage.getItem("channels");
    if (channels_string) {
        const channels = JSON.parse(channels_string);
        if (channels.length < 1) {
            localStorage.setItem("channels", JSON.stringify(["noway4u_sir"]));
        }
    }
    else {
        localStorage.setItem("channels", JSON.stringify(["noway4u_sir"]));
    }

    (document.getElementById("window-channel-input") as HTMLInputElement).value = currentChannel;
    return currentChannel;
};

const setStoragedChannel = (currentChannel: string) => {
    if (!currentChannel) {
        return;
    }

    const channels_string = localStorage.getItem("channels");
    if (channels_string) {
        const channels = JSON.parse(channels_string);

        if (!channels.find((x: string) => x === currentChannel)) {

            channels.push(currentChannel);
            localStorage.setItem("channels", JSON.stringify(channels));

            buildDataListElements();
        }
    }

    (document.getElementById("window-channel-input") as HTMLInputElement).value = currentChannel;
    localStorage.setItem("currentChannel", currentChannel);
};


const buildDataListElements = () => {
    const channels_string = localStorage.getItem("channels");
    if (channels_string) {
        const channels = JSON.parse(channels_string);
        if (channels.length > 0) {
            const select_class = "channel_selection";

            const list = document.getElementById('window-channel-input-select');
            const els = document.getElementsByClassName(select_class);

            for (let index = 0; index < els.length; index++) {
                const element = els[index];
                list.removeChild(element);
            }


            channels.forEach((item) => {
                const id = "channel_selection_" + item;
                const el = document.getElementById(id);
                if (!el) {
                    const option = document.createElement('option');
                    option.id = id;
                    option.classList.add(select_class);
                    option.value = item;
                    list.appendChild(option);
                }
            });
        }
    }
}

const twitchOptions = {
    channel: getStoragedChannel(),
    height: "100%",
    width: "100%",
};

const player = new Twitch.Player("twitch_container", twitchOptions);

const goChannel = () => {

    const oldChannel = twitchOptions.channel;
    const newChannel = (document.getElementById("window-channel-input") as HTMLInputElement).value;
    if (newChannel !== null && newChannel !== oldChannel) {
        twitchOptions.channel = newChannel;
        setStoragedChannel(newChannel);
        player.setChannel(newChannel);
    }
}

const enterChannel = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        goChannel();
    }
}

const alwaysTop = (event: any) => {
    const win = remote.getCurrentWindow();
    win.setAlwaysOnTop(event.target.checked);
}
