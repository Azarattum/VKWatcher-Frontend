/**
 * Main script
 */

import User from "./data/user.cls.js";
import Session from "./data/session.cls.js";

import EmptyFilter from "./data/filters/empty.cls.js";
import DeviceFilter from "./data/filters/device.cls.js";
import PeriodFilter from "./data/filters/period.cls.js";

import Drawer from "./views/overview/drawer.cls.js.js";
import Controller from "./views/overview/controller.cls.js.js";
import Designer from "./designer.cls.js";

window.main = () => {
	load(
		{
			"sessions.json": "sessions",
			"libs/charts/shaders/bar.fsh": "fshaderBar",
			"libs/charts/shaders/bar.vsh": "vshaderBar",
			"libs/charts/shaders/layout.fsh": "fshaderLayout",
			"libs/charts/shaders/layout.vsh": "vshaderLayout"
		},
		data => {
			parseData(data);
			Designer.initialize(data, users[id]);

			const canvas = document.getElementsByClassName("report-render")[0];
			window.dataDrawer = new Drawer(canvas, users[id]);
			window.controller = new Controller(dataDrawer);

			renderUser();
		}
	);
};

function parseData(data) {
	window.users = [];
	window.id = 0;
	let i = 0;
	//Iterate through all users in data
	for (const id in data["sessions"]) {
		const userData = data["sessions"][id];
		//Create user object
		let user = new User(userData.name, id);
		//Add sessions
		for (const session of userData.sessions) {
			if (session.from !== undefined) {
				user.addSession(
					new Session(session.from, session.to, session.platform)
				);
			}
		}
		//Add filters
		let empty = new EmptyFilter("empty");
		empty.toggle(false);
		let device = new DeviceFilter("device");
		let period = new PeriodFilter("period");
		const days = Object.keys(user.days);
		period.from = +days[0];
		period.to = +days[days.length - 1];

		user.addFilter(empty);
		user.addFilter(device);
		user.addFilter(period);

		//Save user to an array
		window.users.push(user);
		document.getElementsByClassName(
			"users"
		)[0].innerHTML += `<div class="button user" onclick="set(${i})">${userData.name}</div>`;
		i++;
	}
}

window.renderUser = () => {
	//Get elements
	let range = $(".area-slider").data("ionRangeSlider");
	//Update labels on the page
	document.getElementsByClassName("user-name")[0].innerText = users[id].name;
	document.getElementsByClassName("user-id")[0].innerText = users[id].id;
	document.getElementById("empty-filter").checked = !users[id].getFilter(
		"empty"
	).enabled;
	document.getElementsByClassName("device")[0].value =
		users[id].getFilter("device").device || -1;
	//Update hash property
	hash.set("user", id);
	hash.set("empty", !users[id].getFilter("empty").enabled);
	hash.set("device", users[id].getFilter("device").device || -1);
	//Render drawer object
	dataDrawer.user = users[id];
	dataDrawer.render();
	if (hash.get("tab") == "chart") {
		chartDrawer.switch(users[id]);
	}
	//Update range selector
	const days = Object.keys(users[id].days);
	const period = users[id].getFilter("period");
	range.update({
		min: days[0],
		max: days[days.length - 1],
		from: period.from,
		to: period.to,
		onChange: function(data) {
			period.from = data.from;
			period.to = data.to;
			hash.set(
				"period",
				period.from - days[0] + 1 + "-" + (period.to - days[0] + 1)
			);
			dataDrawer.render();
		}
	});
	//Update filter hash
	hash.set(
		"period",
		period.from - days[0] + 1 + "-" + (period.to - days[0] + 1)
	);
};

/**
 * Handful function for loading arrays of data with JSON support.
 * @param {Array} urls Array of urls to load.
 * @param {Function} callback Callback(data[]) function.
 */
function load(data, callback) {
	let urls = [];
	let names = false;
	if (Array.isArray(data)) {
		urls = data;
	} else if (typeof data == "object") {
		urls = Object.keys(data);
		names = true;
	} else {
		throw new Error("Data type is not vaild!");
	}

	let responses = [];

	for (const url of urls) {
		let requestObject = new XMLHttpRequest();
		if (url.replace(new RegExp("/$"), "").endsWith(".json")) {
			requestObject.overrideMimeType("application/json");
			requestObject.responseType = "json";
		}

		requestObject.open("GET", url, true);
		requestObject.onreadystatechange = () => {
			if (
				requestObject.readyState == 4 &&
				requestObject.status == "200"
			) {
				if (!names) {
					responses.push(requestObject.response);
				} else {
					let url = urls.find(url => {
						let regExp = new RegExp(
							url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"
						);
						return requestObject.responseURL.match(regExp) != null;
					});

					responses[data[url]] = requestObject.response;
				}

				if (Object.keys(responses).length == Object.keys(data).length) {
					callback(responses);
				}
			}
		};
		requestObject.send();
	}
}
