var ua_preset = {};

function settings_add_save(rewriteTargetPage) {
    chrome.storage.local.get({
        rewriteTargetPages: []
    }, function (options) {
        var settings = options.rewriteTargetPages;
        var rewrote = false;
        for(var i = 0; i < settings.length; i++){
            if(settings[i]["site"] === rewriteTargetPage["site"]){
                settings[i] = rewriteTargetPage;
                rewrote = true;
                break;
            }
        }
        if(!rewrote){
            settings.push(rewriteTargetPage)
        }
        chrome.storage.local.set({
            rewriteTargetPages: settings
        });
        settings_load(settings)
    });
}

function settings_remove(target_int) {
    chrome.storage.local.get({
        rewriteTargetPages: []
    }, function (options) {
        var settings = options.rewriteTargetPages;
        settings.splice(target_int, 1);
        chrome.storage.local.set({
            rewriteTargetPages: settings
        });
        settings_load(settings)
    });
}

function settings_load(rewriteTargetPages) {
    var settings_list_elem = document.getElementById("settings_list");
    settings_list_elem.innerHTML = "";
    var site_text = document.createElement("span");
    site_text.innerText = "Site";
    site_text.style.border = "1px solid";
    var ua_text = document.createElement("span");
    ua_text.innerText = "User-Agent";
    ua_text.style.border = "1px solid";
    settings_list_elem.appendChild(site_text);
    settings_list_elem.appendChild(ua_text);
    for (var i = 0; i < rewriteTargetPages.length; i++) {
        var rewriteTargetPage = rewriteTargetPages[i];
        var site = rewriteTargetPage["site"];
        var ua_type = rewriteTargetPage["ua_type"];
        var target_ua;
        if (ua_type == "custom") {
            target_ua = rewriteTargetPage["ua"];
        } else {
            target_ua = ua_preset[rewriteTargetPage["ua_type"]]
        }
        var site_input = document.createElement("span");
        site_input.innerText = site;
        site_input.style.gridRow = i + 2;
        site_input.style.gridColumn = "1";
        site_input.style.border = "1px solid";
        var ua_type_input = document.createElement("span");
        ua_type_input.innerText = ua_type;
        ua_type_input.style.gridRow = i + 2;
        ua_type_input.style.gridColumn = "2";
        ua_type_input.style.border = "1px solid";
        var remove_button = document.createElement("input");
        remove_button.type = "button";
        remove_button.value = "Delete";
        remove_button.id = i;
        remove_button.style.gridRow = i + 2;
        remove_button.style.gridColumn = "3";
        remove_button.style.border = "1px solid";
        remove_button.addEventListener("click", function (e) {
            settings_remove(Number(e.target.id))
        })
        settings_list_elem.appendChild(site_input);
        settings_list_elem.appendChild(ua_type_input);
        settings_list_elem.appendChild(remove_button);

        //document.getElementById("settings_list").appendChild(settings_list_elem);
    }
}

window.addEventListener("ua_change_ready", function () {
    chrome.storage.local.get({
        rewriteTargetPages: []
    }, function (options) {
        settings_load(options.rewriteTargetPages);
    
    });
    
    var ua_type_input = document.getElementById("ua_type")
    for (uaname of Object.keys(ua_preset)) {
        var option_elem = document.createElement("option");
        option_elem.innerText = uaname;
        option_elem.value = uaname;
        ua_type_input.appendChild(option_elem);
    }
    ua_type_input.value = ua_type;
    
    document.getElementById("add_button").addEventListener("click", function () {
        var rewriteTargetPage = {}
        rewriteTargetPage["site"] = document.getElementById("host").value;
        rewriteTargetPage["ua_type"] = document.getElementById("ua_type").value;
        rewriteTargetPage["ua"] = "";
        settings_add_save(rewriteTargetPage)
    })    
})

fetch("ua_preset.json").then(function (response) {
    return response.json();
}).then(function (json) {
    ua_preset = json;
    window.dispatchEvent(new Event("ua_change_ready"));
});
