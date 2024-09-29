import { callApi42, is_authenticated, getCookie } from '../user_login';
import { router } from '/src/js/routes.js';
import { createToast } from '../components/toast';
import { updateUserInfo } from '../main';

class Friends extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar data-authorized></nav-bar>
            <main class="container">
				<div class="col-sm-12 col-md-9 col-lg-6 mx-auto">
					<div class="mb-5 row">
						<h1 class="text-center">Friends</h1>
						<p class="text-center">Add, remove, and see your friends status.</p>
					</div>
					<form id="add-user-form">
						<div class="mb-3 d-flex justify-content-between gap-3">
							<div class="flex-grow-1">
								<input type="text" class="form-control" id="add-username" name="username" aria-describedby="nameHelp" placeholder="Username" minlength="2" maxlength="16" required>
							</div>
							<button type="submit" id="add-user-btn" class="btn btn-outline-cream-fill btn-general mb-3">Add friend</button>
						</div>
					</form>
					<ul class="p-0 request-list">
						<li class="friend-item-add px-4 rounded cs-border d-flex justify-content-between align-items-center mb-3">
							<div class="d-flex align-items-center gap-3">
								<span class="user-status-pill"></span>
								<p class="mx-0 my-0 px-0 py-0 fs-6 align-bottom secondary-color-subtle">Ferran Bosch (@fbosch) wants to add you as a friend.</p>
							</div>
							<div class="d-flex gap-2">
								<i class="fa-solid fa-check fa-lg text-success friend-accept-reject"></i>
								<i class="fa-solid fa-xmark fa-lg text-danger friend-accept-reject"></i>
							</div>
						</li>
					</ul>
					<ul class="p-0 friend-list">
						<li class="friend-item pe-none px-4 rounded cs-border d-flex justify-content-between align-items-center mb-3">
							<div class="d-flex align-items-center gap-3">
								<span class="user-status-pill online"></span>
								<p class="mx-0 my-0 px-0 py-0 fs-5 align-bottom">@fbosch</p>
								<p class="mx-0 my-0 px-0 py-0 fs-6 align-bottom secondary-color-subtle">Ferran Bosch</p>
							</div>
							<i class="fa-regular fa-trash-can fa-lg delete-friend pe-auto"></i>
						</li>
						<li class="friend-item pe-none px-4 rounded cs-border d-flex justify-content-between align-items-center mb-3">
							<div class="d-flex align-items-center gap-3">
								<span class="user-status-pill offline"></span>
								<p class="mx-0 my-0 px-0 py-0 fs-5 align-bottom">@fbosch</p>
								<p class="mx-0 my-0 px-0 py-0 fs-6 align-bottom secondary-color-subtle">Ferran Bosch</p>
							</div>
							<i class="fa-regular fa-trash-can fa-lg delete-friend pe-auto"></i>
						</li>
					</ul>
				</div>
			</main>
		`;
	}
	async connectedCallback() {
		await loadRequests();
		await loadFriendList();

		const	addUserForm = document.getElementById('add-user-form');
		addUserForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(addUserForm);
			try {
				const response = await fetch('http://localhost:8080/add_friend/', {
					method: 'POST',
					headers: {'Authorization': 'Bearer ' + getCookie('token')},
					body: formData,
				});
				if (response.ok) {
					createToast('successful', `Friend request sent to ${formData.get('username')}`);
					addUserForm.reset();
				}
				else {
					const responseJson = await response.json();
					console.log(responseJson);
					throw (`${responseJson.error}`);
				}
			}
			catch (e) {
				createToast('warning', `Error: ${e}`);
			}
		});
	};
}

async function	loadRequests() {
	const	requestList = document.querySelector('.request-list');
	try {
		const response = await fetch('http://localhost:8080/list_pending/', {
			method: 'POST',
			headers: {'Authorization': 'Bearer ' + getCookie('token')},
		});
		const responseJson = await response.json();
		console.log(responseJson);
		if (response.ok) {
			const requestListHtml = responseJson.friends.map((friend) => {
				return(`
					<li class="friend-item-add px-4 rounded cs-border d-flex justify-content-between align-items-center mb-3">
						<div class="d-flex align-items-center gap-3">
							<span class="user-status-pill"></span>
							<p class="mx-0 my-0 px-0 py-0 fs-6 align-bottom secondary-color-subtle">${friend.alias} (${friend.username}) wants to add you as a friend.</p>
						</div>
						<div class="d-flex gap-2">
							<i class="fa-solid fa-check fa-lg text-success friend-accept-reject"></i>
							<i class="fa-solid fa-xmark fa-lg text-danger friend-accept-reject"></i>
						</div>
					</li>
				`);
			}).join('');
			requestList.innerHTML = requestListHtml;
			createToast('successful', 'get friend requests');
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
		const response = await fetch('http://localhost:8080/list_friends/', {
			method: 'POST',
			headers: {'Authorization': 'Bearer ' + getCookie('token')},
		});
		const responseJson = await response.json();
		console.log(responseJson);
		if (response.ok) {
			const friendListHtml = responseJson.friends.map((friend) => {
				return(`
					<li class="friend-item pe-none px-4 rounded cs-border d-flex justify-content-between align-items-center mb-3">
						<div class="d-flex align-items-center gap-3">
							<span class="user-status-pill online" style="background-image: url('${friend.img}');"></span>
							<p class="mx-0 my-0 px-0 py-0 fs-5 align-bottom">@${friend.alias}</p>
							<p class="mx-0 my-0 px-0 py-0 fs-6 align-bottom secondary-color-subtle">${friend.first_name } ${friend.last_name}</p>
						</div>
						<i class="fa-regular fa-trash-can fa-lg delete-friend pe-auto"></i>
					</li>	
				`);
			}).join('');
			friendList.innerHTML = friendListHtml;
			createToast('successful', 'get friend list');
		}
		else {
			throw (`${responseJson.error}`);
		}
	}
	catch (e) {
		createToast('warning', `Error: ${e}`);
	}
}

customElements.define('my-friends', Friends);

export default  function friends () {
	return ('<my-friends></my-friends>');
}
