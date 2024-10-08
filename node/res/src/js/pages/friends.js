import { callApi42, is_authenticated, getCookie } from '../user_login';
import { router } from '/src/js/routes.js';
import { createToast } from '../components/toast';
import { updateUserInfo } from '../main';
import i18next from 'i18next';
import { generateLangs } from '../languages.js';


class Friends extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar data-authorized></nav-bar>
            <main class="container">
				<div class="col-sm-12 col-md-9 col-lg-6 mx-auto">
					<div class="mb-5 row">
						<h1 class="text-center krona-font" data-translate="text" data-key="friends">Friends</h1>
						<p class="text-center" data-translate="text" data-key="friends_info">Add, remove, and see your friends status.</p>
					</div>
					<form id="add-user-form">
						<div class="mb-3 d-flex justify-content-between gap-3">
							<div class="flex-grow-1">
								<input type="text" class="form-control" id="add-username" name="username" aria-describedby="nameHelp" data-translate="placeholder" data-key="username" placeholder="Username" minlength="2" maxlength="16" required>
							</div>
							<button type="submit" id="add-user-btn" class="btn btn-outline-cream-fill btn-general mb-3" data-translate="text" data-key="add_friend">Add friend</button>
						</div>
					</form>
					<ul class="p-3 m-0 request-list"></ul>
					<ul class="p-3 m-0 border-top friend-list"></ul>
				</div>
			</main>
		`;
	}
	async connectedCallback() {
		
		/* Load requests and friend list from database */
		await loadRequests();
		await loadFriendList();

		/* Generate listener to confirm, reject, and delete new friends */
		setListenerFriends();

		/* Control submit button to add a new friend */
		const	addUserForm = document.getElementById('add-user-form');
		const	addUsername = document.getElementById('add-username');
		addUserForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(addUserForm);
			try {
				const response = await fetch('https://localhost:3001/login/add_friend/', {
					method: 'POST',
					headers: {'Authorization': 'Bearer ' + await getCookie('token')},
					body: formData,
				});
				if (response.ok) {
					createToast('successful', `Friend request sent to @${formData.get('username')}`);
					router();
				}
				else {
					const responseJson = await response.json();
					if (addUsername) {
						addUsername.value = '';
					}
					throw (`${responseJson.error}`);
				}
			}
			catch (e) {
				createToast('warning', `Error: ${e}`);
			}
		});
		/* Translate language, needed in async connectedCallback() to make sure it's executed */
		generateLangs();
	}
}

async function	loadRequests() {
	const	requestList = document.querySelector('.request-list');
	try {
		const response = await fetch('https://localhost:3001/login/list_pending/', {
			method: 'POST',
			headers: {'Authorization': 'Bearer ' + await getCookie('token')},
		});
		const responseJson = await response.json();
		if (response.ok) {
			let requestListHtml;
			if (responseJson.friends.length < 1) {
				requestListHtml = /* html */ `
					<p class="fs-4 m-0 p-0 secondary-color-subtle">${i18next.t('no_pending_requets')}</p>`;
			}
			else {
				requestListHtml = responseJson.friends.map((friend) => {
					return(/* html */`
						<li class="friend-request-item px-4 rounded cs-border d-flex justify-content-between align-items-center mb-2" data-friend-username="${friend.username}">
							<div class="d-flex align-items-center gap-3">
								<span class="user-status-pill rounded-circle" style="background-image: url('${friend.img}')"></span>
								<p class="mx-0 my-0 px-0 py-0 fs-6 align-bottom secondary-color-subtle">${i18next.t('friend_request', { alias: friend.alias, username: friend.username })}</p>
							</div>
							<div class="d-flex gap-2">
								<button type="button" class="btn btn-success btn-sm friend-accept">${i18next.t('accept')}</button>
								<button type="button" class="btn btn-danger btn-sm friend-reject">${i18next.t('reject')}</button>
							</div>
						</li>
					`);
				}).join('');
			}
			requestList.innerHTML = requestListHtml;
		}
		else {
			throw (`${responseJson.error}`);
		}
	}
	catch (e) {
		createToast('warning', `Error: ${e}`);
	}
}

async function	loadFriendList() {
	const	friendList = document.querySelector('.friend-list');
	try {
		const response = await fetch('https://localhost:3001/login/list_friends/', {
			method: 'POST',
			headers: {'Authorization': 'Bearer ' + await getCookie('token')},
		});
		const responseJson = await response.json();
		if (response.ok) {
			let friendListHtml;
			if (responseJson.friends.length < 1) {
				friendListHtml = /* html */ `
					<p class="fs-4 m-2 p-0 secondary-color-subtle">${i18next.t('no_friends')}</p>`;
			}
			else {
				friendListHtml = responseJson.friends.map((friend) => {
					const statusColor = friend.online ? 'bg-success' : 'bg-danger';
					return( /* html */`
						<li class="friend-item pe-none px-4 rounded cs-border d-flex justify-content-between align-items-center mb-2" data-friend-username="${friend.username}">
							<div class="d-flex align-items-center gap-3">
								<span class="user-status-pill rounded-circle position-relative" style="background-image: url('${friend.img}')">
									<span class="position-absolute top-0 start-0 translate-middle p-2 ${statusColor} rounded-circle">
    									<span class="visually-hidden">Status</span>
  									</span>
								</span>
								<p class="mx-0 my-0 px-0 py-0 fs-5 align-bottom pe-auto">@${friend.username}</p>
								<p class="mx-0 my-0 px-0 py-0 fs-6 align-bottom secondary-color-subtle">${friend.alias}</p>
							</div>
							<i class="fa-solid fa-trash-can fa-lg delete-friend pe-auto"></i>
						</li>	
					`);
				}).join('');
			}
			friendList.innerHTML = friendListHtml;
		}
		else {
			throw (`${responseJson.error}`);
		}
	}
	catch (e) {
		createToast('warning', `Error: ${e}`);
	}
}

function	setListenerFriends() {
	const	friendItems = document.querySelectorAll('.friend-item');
	const	friendRequestItems = document.querySelectorAll('.friend-request-item');

	/* Sets listeners to delete friends */
	friendItems.forEach( (friendItem) => {
		const deleteBtn = friendItem.querySelector('.delete-friend');
		if (deleteBtn) {
			deleteBtn.addEventListener('click', async () => {
				try {
					const	bodyInfo = { username: friendItem.getAttribute('data-friend-username') };
					const	response = await fetch('https://localhost:3001/login/delete_friend/', {
						method: 'POST',
						headers: {'Authorization': 'Bearer ' + await getCookie('token')},
						body: JSON.stringify(bodyInfo),
					});
					const responseJson = await response.json();
					if (response.ok) {
						router();
						createToast('successful', `Deleted @${friendItem.getAttribute('data-friend-username')} from your friends`);
					}
					else {
						throw (`${responseJson.error}`);
					}
				}
				catch (e) {
					createToast('warning', `Error: ${e}`);
				}
			});
		}
	});
	/* Sets listeners to confirm and reject friend requests */
	friendRequestItems.forEach( (friendRequestItem) => {
		const acceptBtn = friendRequestItem.querySelector('.friend-accept');
		const rejectBtn = friendRequestItem.querySelector('.friend-reject');
		const username = friendRequestItem.getAttribute('data-friend-username');
		if (acceptBtn) {
			acceptBtn.addEventListener('click', async () => {
				try {
					const	bodyInfo = { username };
					const	response = await fetch('https://localhost:3001/login/confirm_friends/', {
						method: 'POST',
						headers: {'Authorization': 'Bearer ' + await getCookie('token')},
						body: JSON.stringify(bodyInfo),
					});
					const responseJson = await response.json();
					if (response.ok) {
						router();
						createToast('successful', `Added @${friendRequestItem.getAttribute('data-friend-username')} as your friend`);
					}
					else {
						throw (`${responseJson.error}`);
					}
				}
				catch (e) {
					createToast('warning', `Error: ${e}`);
				}
			});
		}
		else
		if (rejectBtn) {
			rejectBtn.addEventListener('click', async () => {
				try {
					const	bodyInfo = { username };
					const	response = await fetch('https://localhost:3001/login/delete_pending/', {
						method: 'POST',
						headers: {'Authorization': 'Bearer ' + await getCookie('token')},
						body: JSON.stringify(bodyInfo),
					});
					const responseJson = await response.json();
					if (response.ok) {
						router();
						createToast('successful', `Rejected @${friendRequestItem.getAttribute('data-friend-username')}`);
					}
					else {
						throw (`${responseJson.error}`);
					}
				}
				catch (e) {
					createToast('warning', `Error: ${e}`);
				}
			});
		}
	});
}


customElements.define('my-friends', Friends);

export default  function friends () {
	return ('<my-friends></my-friends>');
}
