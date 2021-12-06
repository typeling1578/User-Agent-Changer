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

function ua_change(rewriteTargetPages) {
    var rewriteAble = false;
    var target_ua = "";
    for (rewriteTargetPage of rewriteTargetPages) {
        if (location.hostname == rewriteTargetPage["site"]) {
            rewriteAble = true;
            if(rewriteTargetPage["ua_type"] == "custom"){
                target_ua = rewriteTargetPage["ua"];
            }else{
                target_ua = ua_preset[rewriteTargetPage["ua_type"]]
            }
            break;
        }
    }

    if (rewriteAble) {
        var sc = document.createElement("script");
        sc.text = '(function(){Object.defineProperty(navigator, "userAgent", {get: function () { return "' + target_ua + '"; }});})()';
        document.head.appendChild(sc);
    }
}

chrome.storage.local.get({
    rewriteTargetPages: []
}, function (options) {
    ua_change(options.rewriteTargetPages);
});

chrome.storage.onChanged.addListener(function (changes, area) {
    if("rewriteTargetPages" in changes){
        ua_change(changes.rewriteTargetPages.newValue);
    }
});
