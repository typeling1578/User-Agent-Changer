var ua_preset = {};
var rewriteTargetPages = [];
const targetUrl = "<all_urls>";

function rewriteUserAgentHeader(e) {
    var refurl = e.documentUrl;//firefox only

    if ((refurl === null || refurl === undefined) && e.type !== "main_frame") {
        //除外
        return;
    }

    var rewriteAble = false;
    var target_ua = "";
    if (e.type !== "main_frame") {
        var URL_obj = new URL(refurl);
    } else {
        var URL_obj = new URL(e.url);
    }
    for (rewriteTargetPage of rewriteTargetPages) {
        if (URL_obj.hostname == rewriteTargetPage["site"]) {
            rewriteAble = true;
            if(rewriteTargetPage["ua_type"] == "custom"){
                target_ua = rewriteTargetPage["ua"];
            }else{
                target_ua = ua_preset[rewriteTargetPage["ua_type"]]
            }
            break;
        }
    }
    if (!rewriteAble) {
        return;
    }

    e.requestHeaders.forEach(function (header) {
        if (header.name.toLowerCase() === "user-agent") {
            header.value = target_ua;
        }
    });
    return { requestHeaders: e.requestHeaders };
}

function generateRandomString(n) {
    var s = "abcdefghijklmnopqrstuvwxyz0123456789";
    var str = "";
    for (var i = 0; i < n; i++) {
        str += s[Math.floor(Math.random() * s.length)];
    }
    return str;
}

window.addEventListener("ua_change_ready", function () {
    browser.webRequest.onBeforeSendHeaders.addListener(
        rewriteUserAgentHeader,
        { urls: [targetUrl] },
        ["blocking", "requestHeaders"]
    );

    browser.storage.local.get({
        rewriteTargetPages: {},
        storageVersion: 1
    }, function (options) {
        rewriteTargetPages = options.rewriteTargetPages;

        if(rewriteTargetPages.length !== 0){
            //old version to new version
            if(options.storageVersion === 1){//old version (v1)
                for (var i = 0; i < rewriteTargetPages.length; i++) {
                    rewriteTargetPages[i]["id"] = generateRandomString(12);
                }
                browser.storage.local.set({
                    rewriteTargetPages: rewriteTargetPages,
                    storageVersion: 2
                });
            }
        }
    });

    browser.storage.onChanged.addListener(function (changes, area) {
        if("rewriteTargetPages" in changes){
            rewriteTargetPages = changes.rewriteTargetPages.newValue;
        }
    });
})

fetch("ua_preset.json").then(function (response) {
    return response.json();
}).then(function (json) {
    ua_preset = json;
    window.dispatchEvent(new Event("ua_change_ready"));
});
