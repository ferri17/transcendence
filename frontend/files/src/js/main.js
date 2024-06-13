import home from "./pages/home.js"
import about from "./pages/about.js"
import settings from "./pages/settings.js"
import pongGame from "./pong.js"

"use strict";

// Select main container where different pages will render
const mainContainer = document.querySelector('#main-container');

const routes = {
	"/": { title: "Home", render: home },
	"/about": { title: "About", render: about },
	"/settings": { title: "Settings", render: settings },
};


// Handle navigation
window.addEventListener("click", e => {
	if (e.target.matches("[data-link]")) {
		e.preventDefault();
		history.pushState("", "", e.target.href);
		router();
	}
});

function router() {
	console.log(location.pathname);
	let view = routes[location.pathname];

	if (view) {
		document.title = view.title;
		mainContainer.innerHTML = view.render();
	} else {
		history.replaceState("", "", "/");
		router();
	}
};

// Update router when content is fully loaded and user navigates session history
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", () => {
	router();
	pongGame();
});
