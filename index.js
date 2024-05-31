chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" });

var refreshInterval = 10;
fetchLocalVars();

injectJS();
refreshUI();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(!sender.tab) return;

    if(request.check) {}

    if(request.buttons) {
        removeSuggestions();

        let container = document.createElement("DIV");
        container.setAttribute("id", "sgstnLst");
        container.setAttribute("class",
            "mt-0.5 px-1 bg-slate-800 border-2 border-slate-700 overflow-y-scroll overflow-x-hidden scrollbar max-h-24 rounded-lg absolute top-full left-0 right-0 z-{99}"
        );

        for(let i = 0; i < request.buttons.length; i++) {
            let element = document.createElement("div");
            element.setAttribute("class", "my-0.5 hover:cursor-pointer hover:text-green-400");
            element.innerHTML = request.buttons[i];
            element.addEventListener("click", () => {
                clearHighlight();
                document.getElementById("btnId").value = request.buttons[i];
                storeValues();
            });
            element.addEventListener("mouseover", () => {
                clearHighlight();
                highlightButtons(request.buttons[i]);
            });
            element.addEventListener("mouseout", () => { clearHighlight(); });
            container.appendChild(element);
        }

        if(container.getElementsByTagName('*').length > 0)
            document.getElementById("btnIdCntr").appendChild(container);
    }
});

document.addEventListener("click", e => {
    removeSuggestions();
});

document.getElementById("slctTag").addEventListener("change", () => {
    document.getElementById("tgl").checked = false;
    storeValues();
    getTags();
});

document.getElementById("tgl").addEventListener("change", () => {
    storeValues();
});

document.getElementById("btnId").addEventListener("input", () => {
    document.getElementById("tgl").checked = false;

    storeValues();

    removeSuggestions();
    clearHighlight();

    getTags();
});

//document.getElementById("btnId").addEventListener("keydown", (e) => {
//    let currentFocus = 0;
//    if(e.keyCode == 38) { // up
//    } else if(e.keyCode == 40) { // down
//    } else if(e.keyCode == 13) { // enter
//    }
//});

document.getElementById("rfrshIntrvl1").addEventListener("click", () => {
    refreshInterval = 1;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl2").addEventListener("click", () => {
    refreshInterval = 2;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl3").addEventListener("click", () => {
    refreshInterval = 3;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl4").addEventListener("click", () => {
    refreshInterval = 4;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl5").addEventListener("click", () => {
    refreshInterval = 5;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl10").addEventListener("click", () => {
    refreshInterval = 10;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl20").addEventListener("click", () => {
    refreshInterval = 20;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl30").addEventListener("click", () => {
    refreshInterval = 30;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvl60").addEventListener("click", () => {
    refreshInterval = 60;
    storeValues();
    refreshUI();
});

document.getElementById("rfrshIntrvlInpt").addEventListener("input", () => {
    const val = document.getElementById("rfrshIntrvlInpt").value;
    if (containsOnlyDigits(val)) {
        refreshInterval = Number(document.getElementById("rfrshIntrvlInpt").value);
        storeValues();
    } else {
        document.getElementById("rfrshIntrvlInpt").value = "";
    }
});

function containsOnlyDigits(str) {
    return /^\d+$/.test(str);
}

function getTags() {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                buttons: {
                    get: true,
                    query: document.getElementById("btnId").value,
                    tag: document.getElementById("slctTag").value,
                },
            })
            .catch(() => {});
        });
    } catch {}
}

function fetchLocalVars() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        chrome.storage.session.get(url).then((result) => {
            const obj = result[url];
            if (typeof obj !== "undefined")
                refreshInterval = obj.interval;
        });
    });
}

function storeValues() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        chrome.storage.session.set({
            [url]: {
                select: document.getElementById("slctTag").value,
                tag: document.getElementById("btnId").value,
                enabled: document.getElementById("tgl").checked,
                interval: refreshInterval,
            },
        });
    });
}

function refreshUI() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;

        chrome.storage.session
            .get(url) // use null to get all
            .then((result) => {
                const obj = result[url];
                if(typeof obj !== "undefined") {
                    document.getElementById("tgl").checked           = obj.enabled;
                    document.getElementById("slctTag").value         = obj.select;
                    document.getElementById("btnId").value           = obj.tag;
                    document.getElementById("rfrshIntrvlInpt").value = obj.interval;
                }
        });
    });
}

function injectJS() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { check: true }).catch(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.insertCSS({
                    target: { tabId: tabs[0].id },
                    files: ["inject.css"],
                });
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: runPageScript,
                });
            });
        });
    });
}

function sendMessage(obj) {
    try { chrome.runtime.sendMessage(obj); } catch {}
}

function removeSuggestions() {
    let list = document.getElementById("sgstnLst");
    if(list) list.remove();
}

function clearHighlight() {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { clearHighlight: true })
                .catch(() => {});
        });
    } catch {}
}

function highlightButtons(tag) {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { highlight: tag })
                .catch(() => {});
        });
    } catch {}
}

function runPageScript() {
    const includesExact = (arr, val) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == val) return true;
        }
        return false;
    };

    const caseInsensitiveIncludes = (arr, query) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].toLowerCase() === query.toLowerCase())
                return true;
        }
        return false;
    };

    const sendMessage = (obj) => {
        try {
            chrome.runtime.sendMessage(obj);
        } catch {}
    };

    let getTimestamp = () => {
        return Math.floor(Date.now() / 1000);
    };

    const cssHighlightClass = "clickerasdfskj23j423h2nnsdfsf";

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.check) sendMessage({ check: true });

        if(request.highlight) {
            let buttons = document.querySelectorAll("button");
            for (let i = 0; i < buttons.length; i++) {
                if(buttons[i].id == request.highlight || includesExact(buttons[i].className.split(" "), request.highlight))
                    buttons[i].classList.add(cssHighlightClass);
            }
        }

        if(request.clearHighlight) {
            let buttons = document.querySelectorAll("button." + cssHighlightClass);
            for(let i = 0; i < buttons.length; i++) {
                if(includesExact(buttons[i].className.split(" "), cssHighlightClass))
                    buttons[i].classList.remove(cssHighlightClass);
            }
        }

        if(request.buttons && request.buttons.query.length > 0 && (request.buttons.tag === "class" || request.buttons.tag === "id")) {
            const query = request.buttons.query.toLowerCase();

            const buttons = document.querySelectorAll("button");
            var elmntsColctn = [];
            for(let i = 0; i < buttons.length; i++) {
                var elements = [];
                if(request.buttons.tag === "class")
                    elements = buttons[i].className.split(" ");
                else if(request.buttons.tag === "id")
                    elements = [buttons[i].id];

                for(let x = 0; x < elements.length; x++) {
                    // if(elements[x].includes(query) && !elmntsColctn.includes(elements[x]))
                    if(elements[x].toLowerCase().includes(query) && !caseInsensitiveIncludes(elmntsColctn, elements[x]))
                        elmntsColctn.push(elements[x]);
                }
            }
            try {
                chrome.runtime.sendMessage({ buttons: elmntsColctn });
            } catch {}
        }
    });

    const url = document.URL;
    var timestamp = getTimestamp();
    setInterval(() => {
        try {
            chrome.storage.session.get(url).then((result) => {
                const obj = result[url];
                if(typeof obj !== "undefined" && obj.enabled) {
                    console.log(`${getTimestamp()} - (${timestamp} + ${obj.interval} = ${timestamp + obj.interval}) = ${getTimestamp() - (timestamp + obj.interval)}`);

                    sendMessage({
                        setBadge: {
                            title: (getTimestamp() - (timestamp + obj.interval)).toString(),
                            url: document.URL,
                        },
                    });

                    if(getTimestamp() - timestamp >= obj.interval) {
                        try {
                            if (obj.select === "id") {
                                document.getElementById(obj.tag).click();
                            } else if (obj.select === "class") {
                                let elements = document.getElementsByClassName(obj.tag);
                                for (let i = 0; i < elements.length; i++) {
                                    elements[i].click();
                                }
                            }
                        } catch {}
                        timestamp = getTimestamp();
                    }
                } else {
                    timestamp = getTimestamp();
                    sendMessage({ setBadge: { title: "", url: document.URL } });
                }
            });
        } catch {}
    }, 1000);
}
