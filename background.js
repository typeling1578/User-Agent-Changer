const ua_preset = {
    "Chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.51 Safari/537.36",
    "Firefox": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
    "Safari": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15",
    "Internet Explorer":"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Chrome Android": "Mozilla/5.0 (Linux; Android 11; SC51A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.46 Mobile Safari/537.36",
    "Firefox Android": "Mozilla/5.0 (Android 11; Mobile; rv:94.0) Gecko/94.0 Firefox/94.0",
    "iOS Safari": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    "iPadOS Safari":"Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
}

var rewriteTargetPages = [];
const targetUrl = "<all_urls>";

function rewriteUserAgentHeader(e) {
    if (e.documentUrl !== undefined) {
        var refurl = e.documentUrl;
    } else {
        var refurl = e.initiator;
    }

    if (refurl === undefined && e.type != "main_frame") {
        //除外
        return;
    }

    var rewriteAble = false;
    var target_ua = "";
    if (refurl !== undefined) {
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

    console.log(e.url)

    e.requestHeaders.forEach(function (header) {
        if (header.name.toLowerCase() === "user-agent") {
            header.value = target_ua;
        }
    });
    return { requestHeaders: e.requestHeaders };
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    rewriteUserAgentHeader,
    { urls: [targetUrl] },
    ["blocking", "requestHeaders"]
);


chrome.storage.local.get({
    rewriteTargetPages: []
}, function (options) {
    rewriteTargetPages = options.rewriteTargetPages;
});

chrome.storage.onChanged.addListener(function (changes, area) {
    if("rewriteTargetPages" in changes){
        rewriteTargetPages = changes.rewriteTargetPages.newValue;
    }
});
