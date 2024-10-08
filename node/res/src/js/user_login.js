import { createToast } from './components/toast';
import { router } from './routes';

///////////////////////////////////////////// UTILS /////////////////////////////////////////////

async function fetchUIDENV() {
	return fetch('https://localhost:3001/login/uidenv/', {
		method: 'GET',
	})
	.then(response => {
		if (!response.ok)
			throw new Error('Network response was not ok ' + response.statusText);
		return response.json();
	})
	.then(data => {
		return data['UID'];
	})
	.catch(error => console.error('There has been a problem with your fetch operation:', error));
}

export function expiresDate(seconds)
{
    const currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + Number(seconds));
    return currentDate;
}

function getTokens(cname){
	let name = cname + '=';
	let ca = document.cookie.split(';');
	for(let i = 0; i < ca.length; i++)
	{
		let c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1);
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}
	return '';
}

export async function getCookie(cname) {
	if (cname === "token")
	{
		let retValue = getTokens(cname);
		if (retValue == '')
		{
			retValue = getTokens("refresh");
			if (!retValue)
				return '';
			await refresh_token(retValue);
			return (getTokens(cname));
		}
		return retValue;
	}
	else
	{
		return getTokens(cname);
	}
}

function getPathVars() {
    const querySearch = window.location.search;
    const URLParams = new URLSearchParams(querySearch);
    
    if (URLParams)
    {
        let vars = {};
        vars["code"] = URLParams.get('code');
        vars["state"] = URLParams.get('state');
        return vars
    }
}

function clearURL() {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, document.title, url.toString());
}

/////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////// USER STATUS /////////////////////////////////////////////

export var socket = null;

export function conectWB(access_token)
{
    socket = new WebSocket(`wss://localhost:3001/login/ws/user_status/?token=${access_token}`);
    socket.onopen = function(event) {
    };
    
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
    };
    
    socket.onerror = function(error) {
    };
    
    socket.onclose = function(event) {
    };
}

export function disconnectWB() {
    if (socket) {
        socket.close();
        socket = null; // Limpiamos la referencia del socket
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

export async function callApi42(){
	const uid = await fetchUIDENV()
	if (uid)
	{
		const params = new URLSearchParams ({
			'client_id': uid,
			'redirect_uri': 'https://localhost:3001/',
			'scope': 'public',
			'state': '1234566i754twrqwdfghgfddtrwsewrt',
			'response_type': 'code'
		});
		window.location.href = `https://api.intra.42.fr/oauth/authorize/?${params.toString()}`;	
	}
	else
	{
		createToast('warning', 'Error: server not provided UID pleas wait')
	}
}

///////////////////////////////////// REFRESH TOKEN /////////////////////////////////////

async function getNewAccessToken(infoLogin)
{
	try {
		const response = await fetch('https://localhost:3001/login/refreshToken/', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(infoLogin)
		});

		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		const data = await response.json();
		if (data['access'])
		{
			document.cookie = `token=${data['access']}; expires=${expiresDate(data['token_exp']).toUTCString()}; Secure; SameSite=Strict`;
			document.cookie = `refresh=${data['refresh']}; expires=${expiresDate(data['refresh_exp']).toUTCString()}; Secure; SameSite=Strict`;
		}
	} catch (error) {
		history.pushState('', '', '/');
		router();
	}
}

async function refresh_token(refresh)
{
	const infoLogin = {
		refresh_token: refresh
	};
	await getNewAccessToken(infoLogin);
}

///////////////////////////////////////// LOGIN INTRA ////////////////////////////////////////////////

async function callBackAccess() {
    if (await getCookie("token"))
		return;
    let vars = getPathVars();
    if (!vars["code"] || !vars["state"])
        return ;
    fetch('https://localhost:3001/login/loginIntra/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(getPathVars())
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data["access"])
        {
            clearURL();
            conectWB(data['access']);
            document.cookie = `token=${data["access"]}; expires=${expiresDate(data["token_exp"]).toUTCString()}; Secure; SameSite=Strict`;
            document.cookie = `refresh=${data["refresh"]}; expires=${expiresDate(data["refresh_exp"]).toUTCString()}; Secure; SameSite=Strict`;
            router();
        }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

window.addEventListener('DOMContentLoaded', () => {
    callBackAccess();
});

//////////////////////////////////////////////////////////

export async function is_authenticated(access)
{
	if (!access) {
		return Promise.resolve(false);
	}
	return fetch('https://localhost:3001/login/verify_token/', {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + access,
			'Content-Type': 'application/json'
		},
	})
		.then(response => {
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			return response.json();
		})
		.then(data => {
			if (data['error'])
				return(false);
			if (!socket){
				conectWB(access);
			}
			else if(socket.readyState !== 1 && socket.readyState !== 0){
				conectWB(access);
			}
			return(true);
		})
		.catch(error => {
			document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
			document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
			disconnectWB()
			return false;
		});
}

//////////////////////////////////////////////////////////////