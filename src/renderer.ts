import { remote } from "electron";

declare global {
    interface Window {
        require: any;
    }
}
declare var Twitch: any;
declare var Menu: any;


// import Menu from 'menu';

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
    const menu = new Menu({
        title: 'Prompt example',
        label: 'Channel:',
        value: twitchOptions.channel,
    }, remote.getCurrentWindow());

    console.debug(menu);

    const oldChannel = twitchOptions.channel;

    menu.Create().then((r: string) => {
        if (r === null) {
            console.debug("canceled!");
        } else {
            if (r.length > 0) {
                if (r !== oldChannel) {
                    twitchOptions.channel = r;
                    setStoragedChannel(r);
                    player.setChannel(r);
                }
            }
            else {
                const newChannel = (document.getElementById("window-channel-input") as HTMLInputElement).value;
                if (newChannel !== null && newChannel !== oldChannel) {
                    twitchOptions.channel = newChannel;
                    setStoragedChannel(newChannel);
                    player.setChannel(newChannel);
                }
            }
        }
    }).catch(console.error);
}

const enterChannel = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        goChannel();
    }
}
