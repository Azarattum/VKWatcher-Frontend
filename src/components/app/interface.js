/**
 * JavaScript interface intended to be used inside HTML
 */

function next() {
    if (id < (users.length - 1)) {
        id++;
        renderUser();
    }
}

function previous() {
    if (id > 0) {
        id--;
        renderUser();
    }
}

function set(i) {
    id = i;
    renderUser();
}

function userProfile() {
    window.open("https://vk.com/id" + window.users[id].id, '_blank').focus();
}

function toggleEmptyFilter() {
    users[id].getFilter("empty").toggle(
        !document.getElementById("empty-filter").checked
    );
    hash.set("empty", document.getElementById("empty-filter").checked);
    dataDrawer.render();
}

function changeDeviceFilter(deviceId) {
    users[id].getFilter("device").device = +deviceId;
    hash.set("device", deviceId);
    dataDrawer.render();
}

function tab(tabId, force = false) {
    if (hash.get("tab") == tabId && !force) return;

    //Hide all tabs
    let tabcontents = document.getElementsByClassName("tabcontent");
    for (const tab of tabcontents) {
        tab.style.display = "none";
        if (tab.className.indexOf(tabId) != -1) {
            tab.style.display = "block";
        }
    }

    //Remove all fills
    let tablinks = document.getElementsByClassName("icon");
    for (const link of tablinks) {
        link.className = link.className.replace(" filled", "");
    }    
    document.getElementsByClassName("icon " + tabId)[0].className += " filled";

    if (tabId == "chart") {
        setTimeout(() => {
            if (window.chartDrawer) {
                chartDrawer.switch(users[id]);
            }
        }, 50);
    } else if (tabId == "overview") {
        if (window.dataDrawer) {
            dataDrawer.update();
            dataDrawer.render();
        }
    }

    hash.set("tab", tabId);
}