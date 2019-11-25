import { remote } from "electron";
import { ipcRenderer } from 'electron';

declare global {
    interface Window {
        require: any;
    }
}
declare var Twitch: any;

let navBarToggle = true;

document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        handleWindowControls();

        document.getElementById("window-channel-input").addEventListener('keydown', enterChannel);
        document.getElementById("window-channel-button").addEventListener('click', goChannel);

        ipcRenderer.on('toggle-title-bar', (event, data) => {
            console.log("toggle-title-bar", navBarToggle);
            if(navBarToggle){
                document.getElementById('titlebar').style.height = '0';
                document.getElementById('window-channel-input').style.display = 'none';
                document.getElementById('window-channel-button').style.display = 'none';

                document.getElementById('main').style.top = '0';
                document.getElementById('main').style.height = '100%';

                document.getElementById('twitch_container').style.top = '0';
                document.getElementById('twitch_container').style.height = '100%';
            }
            else{
                document.getElementById('titlebar').style.height = '32px';
                document.getElementById('window-channel-input').style.display = 'block';
                document.getElementById('window-channel-button').style.display = 'block';

                document.getElementById('main').style.top = '32px';
                document.getElementById('main').style.height = 'calc(100% - 32px)';

                document.getElementById('twitch_container').style.top = '32px';
                document.getElementById('twitch_container').style.height = 'calc(100% - 32px)';
            }
            navBarToggle = !navBarToggle;
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
    let channel = localStorage.getItem("channel");
    if (!channel) {
        localStorage.setItem("channel", "noway4u_sir");
        channel = "noway4u_sir";
    }

    (document.getElementById("window-channel-input") as HTMLInputElement).value = channel;
    document.getElementById("window-title-content").innerText = "TwitchApp3 - " + channel;
    return channel;
};

const setStoragedChannel = (channel: string) => {
    if (!channel) {
        return;
    }

    (document.getElementById("window-channel-input") as HTMLInputElement).value = channel;
    document.getElementById("window-title-content").innerText = "TwitchApp3 - " + channel;
    localStorage.setItem("channel", channel);
};

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