const fs = require('fs');
const { ipcRenderer } = require('electron');

let promptId = null;
let promptOptions = null;

const promptError = e => {
    if (e instanceof Error) {
        e = e.message;
    }

    ipcRenderer.sendSync('prompt-error:' + promptId, e);
};

const promptCancel = () => {
    ipcRenderer.sendSync('prompt-post-data:' + promptId, null);
};

const promptSubmit = () => {
    const dataEl = document.querySelector('#data') as any;
    const data = dataEl.value;

    console.debug("submit", data);

    ipcRenderer.sendSync('prompt-post-data:' + promptId, data);
};

window.addEventListener('error', error => {
    if (promptId) {
        promptError('An error has occured on the prompt window: \n' + error);
    }
});

window.onload = (() => {
    promptId = document.location.hash.replace('#', '');

    try {
        promptOptions = JSON.parse(ipcRenderer.sendSync('prompt-get-options:' + promptId));
    } catch (error) {
        return promptError(error);
    }

    console.debug("test", promptOptions);

    document.querySelector('#label').innerHTML = promptOptions.label;
    document.querySelector('#ok').addEventListener('click', () => promptSubmit());
    document.querySelector('#cancel').addEventListener('click', () => promptCancel());

    const dataEl = document.getElementById("data") as  any;


    if (promptOptions.value) {
        dataEl.value = promptOptions.value;
    } else {
        dataEl.value = '';
    }

    dataEl.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            promptSubmit();
        }

        if (e.key === 'Escape') {
            promptCancel();
        }
    });

    dataEl.focus();
});