
import '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';

import '/src/js/components/navbar.js';
import '/src/js/routes.js';
import '/src/js/user_login.js';
import '/src/js/languages';

'use strict';

const	app = document.getElementById('app');
export const	toastNotifications = document.getElementById('toast-notifications');

window.addEventListener('DOMContentLoaded', () => {
	checkPreferedColoScheme();
});

/*
	Makes sure color scheme is preserved when new page loads (e.j redirects).
	'color-scheme' is saved in local storage in case it doesn't exist. If it already
	exists it is used to maintain the same preferences.
*/
function	checkPreferedColoScheme() {
	if (!window.localStorage.getItem('color-scheme')) {
		const prefersDarkColorScheme = () =>
			window &&
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (prefersDarkColorScheme()) {
			updateLightMode('dark');
		}
		else {
			updateLightMode('light');
		}
	}
	else {
		updateLightMode(window.localStorage.getItem('color-scheme'));
	}
}

/*
	Listen to changes on browser color-scheme preferences
*/
const mediaTeheme = window.matchMedia('(prefers-color-scheme: dark)');
mediaTeheme.addEventListener('change', e => {
	if (e.matches)
		updateLightMode('dark');
	else
		updateLightMode('light');
});

/*
	Recevies a color mode 'dark' or 'light', and sets the new color-scheme,
	animates light-mode icons, and updates local storage 'color-scheme'
	accordignly. If the variable doesn't match 'dark' it defaults
	'light' mode.
*/
export function	updateLightMode(colorScheme) {

	const spin = [
		{ transform: 'rotate(270deg)' },
		{ transform: 'rotate(360deg)' },
	];
	  
	const time = {
		duration: 500,
		iterations: 1,
		easing: 'ease-out',
	};

	const	lightIcon = document.getElementById('light-icon');
	const	darkIcon = document.getElementById('dark-icon');

	const	icons = colorScheme == 'dark' ? [darkIcon, lightIcon] : [lightIcon, darkIcon];

	icons[0]?.classList.remove('invisible_cs');
	icons[0]?.classList.add('visible_cs');
	icons[0]?.animate(spin, time);
	icons[1]?.classList.remove('visible_cs');
	icons[1]?.classList.add('invisible_cs');
	icons[1]?.animate(spin, time);

	if (colorScheme == 'dark' && document.documentElement.hasAttribute('data-bs-theme'))
		document.documentElement.removeAttribute('data-bs-theme');
	else if (colorScheme == 'light' && !document.documentElement.hasAttribute('data-bs-theme'))
		document.documentElement.setAttribute('data-bs-theme', 'light');

	window.localStorage.setItem('color-scheme', colorScheme);
}