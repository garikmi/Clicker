chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.setBadge) {
        chrome.storage.session.get("currentTabURL")
            .then((result) => {
                if(result.currentTabURL == request.setBadge.url)
                    chrome.action.setBadgeText({ text: request.setBadge.title });
            });
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        try {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { clearHighlight: true }).catch(() => {});
            });
        } catch {}

        chrome.storage.session.set({ currentTabURL: [tab.url] });
        chrome.action.setBadgeText({ text: "" });
    });
});

chrome.tabs.onUpdated.addListener(() => {
    chrome.action.setBadgeText({ text: "" });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    if(windowId === chrome.windows.WINDOW_ID_NONE) return;
    chrome.windows.get(windowId, { populate: true }, (window) => {
        for(let i = 0; i < window.tabs.length; i++) {
            if(!window.tabs[i].active) continue;
            chrome.tabs.sendMessage(window.tabs[i].id, { clearHighlight: true }).catch(() => {});
            chrome.storage.session.set({ currentTabURL: [window.tabs[i].url] });
            chrome.action.setBadgeText({ text: "" });
        }
    });
});
