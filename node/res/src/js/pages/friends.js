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
					<ul class="">
						<li class="list-group-item d-flex justify-content-start gap-3 align-items-center">
							<span class="badge text-bg-primary rounded-pill">1</span>
							<p class="mx-0 my-0 px-0 py-0">@fbosch</p>
							<p class="mx-0 my-0 px-0 py-0 fs-4">Ferran Bosch</p>
							<i class="fa-regular fa-circle-xmark fa-lg justify-self-end"></i>
						</li>
					</ul>
				</div>
			</main>
		`;
	}
	connectedCallback() {

	};
        
	
}

customElements.define('my-friends', Friends);

export default  function friends () {
	return ('<my-friends></my-friends>');
}
