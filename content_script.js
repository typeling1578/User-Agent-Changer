var ua_preset = {};

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
        Object.defineProperty(navigator, "userAgent", {
            get: function () { return target_ua; }
        });//firefox only
    }
}

window.addEventListener("ua_change_ready", function () {
    browser.storage.local.get({
        rewriteTargetPages: []
    }, function (options) {
        ua_change(options.rewriteTargetPages);
    });
    
    browser.storage.onChanged.addListener(function (changes, area) {
        if("rewriteTargetPages" in changes){
            ua_change(changes.rewriteTargetPages.newValue);
        }
    });
})

fetch("ua_preset.json").then(function (response) {
    return response.json();
}).then(function (json) {
    ua_preset = json;
    window.dispatchEvent(new Event("ua_change_ready"));
});
