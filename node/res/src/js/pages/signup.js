import { createToast } from '../components/toast';

class Signup extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar></nav-bar>
			<main class="container">
				<form id="signup-form" class="col-sm-12 col-md-8 col-lg-6 mt-5 login-form" autocapitalize="on">
					<div class="mb-5">
						<h1 class="text-center krona-font" data-translate="text" data-key="signup">Sign up</h1>
						<p class="text-center" data-translate="text" data-key="details_register">Please enter your details to register.</p>
					</div>
					<div class="mb-3 d-flex justify-content-between gap-3">
						<div class="flex-grow-1">
							<label for="input-name" class="form-label" data-translate="text" data-key="name">Name</label>
							<input id="input-name" type="text" class="form-control" name="name" aria-describedby="nameHelp" data-translate="placeholder" data-key="input_name" placeholder="Enter your name" minlength="2" maxlength="16" required>
						</div>
						<div class="flex-grow-1">
							<label for="input-last-name" class="form-label" data-translate="text" data-key="last_name">Last name</label>
							<input id="input-last-name" type="text" class="form-control" name="lastname" aria-describedby="nameHelp" data-translate="placeholder" data-key="input_last_name" placeholder="Enter your last name" minlength="2" maxlength="16" required>
						</div>
					</div>
					<div class="mb-3">
						<label for="input-username" class="form-label" data-translate="text" data-key="username">Username</label>
						<div class="position-relative">
							<input id="input-username" type="text" class="form-control" name="username" aria-describedby="usernameHelp" data-translate="placeholder" data-key="input_username" placeholder="Enter your username" minlength="3" maxlength="16" required>
							<div id="username-spinner" class="spinner-border d-none position-absolute" role="status">
  								<span class="visually-hidden" data-translate="text" data-key="loading">Loading...</span>
							</div>
						</div>
					</div>
					<div class="mb-3 position-relative">
						<label for="input-pass" class="form-label" data-translate="text" data-key="password">Password</label>
						<input type="password" class="form-control" id="input-pass" name="password" data-translate="placeholder" data-key="password" placeholder="Password" required>
						<div class="password-checklist">
							<p class="checklist-title" data-translate="text" data-key="password_should">Password should be</h3>
							<ul class="checklist">
								<li class="list-item" data-translate="text" data-key="check_between">  Between 8 and 16 character long</li>
								<li class="list-item" data-translate="text" data-key="check_number">  At least 1 number</li>
								<li class="list-item" data-translate="text" data-key="check_lower">  At least 1 lowercase letter</li>
								<li class="list-item" data-translate="text" data-key="check_upper">  At least 1 uppercase letter</li>
								<li class="list-item" data-translate="text" data-key="check_special">  At least 1 special character (!,@,#,$,%,^,&,_,=,+,-)</li>
							</ul>
						</div>
					</div>
					<div class="mb-3">
						<label for="input-pass-rep" class="form-label" data-translate="text" data-key="password_rep">Confirm password</label>
						<input id="input-pass-rep" type="password" class="form-control" name="passwordrep" data-translate="placeholder" data-key="password" placeholder="Password" required>
					</div>
					<button id="signup-submit-btn" disabled type="submit" class="btn btn-outline-cream-fill btn-general w-100 mb-3" data-translate="text" data-key="signup">Sign up</button>
				</form>
   			 </main>
		`;
	}
	connectedCallback() {
		const signupForm = document.getElementById('signup-form');
		
		/*
			Changes disabled state of submit button depending on form validity
		*/
		const inputUsername = document.getElementById('input-username');
		signupForm.addEventListener('input', () => {
    		document.getElementById('signup-submit-btn').disabled = !signupForm.checkValidity();
		});
		
		/*
			Check uniqueness of username and sets error message,
			makes a requests to the DB.

			Debounce to check uniqueness of name in database.
		*/
		const usernameSpinner = document.getElementById('username-spinner');

		let debounceTimeout;

		inputUsername.addEventListener('input', async () => {
			if (usernameSpinner && inputUsername.value) {
				usernameSpinner.classList.remove('d-none');
			}
			inputUsername.setCustomValidity('temporarily invalid');
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(async () => {
				try {
					usernameSpinner.classList.add('d-none');
					let userInfo = { username: `${inputUsername.value}` };

					const response = await fetch('https://localhost:3001/login/usernameCheck/', {
						method: 'POST',
						body: JSON.stringify(userInfo),
					});
					const responseJson = await response.json();
					if (response.ok) {
						if (responseJson.exist === 'True') {
							inputUsername.setCustomValidity('invalid');
							const alertMssg = document.createElement('p');
							alertMssg.textContent = 'Username already in use';
							alertMssg.classList.add('alert-message', 'alert-username');
							inputUsername.insertAdjacentElement('afterend', alertMssg);
						} else {
							document.querySelector('.alert-message.alert-username')?.remove();
							inputUsername.setCustomValidity('');
						}
						document.getElementById('signup-submit-btn').disabled = !signupForm.checkValidity();
					} else {
						throw new Error(`${responseJson.error}`);
					}
				} catch (e) {
					createToast('warning', `Error: ${e}`);
				}
			}, 1000);
		});


		/*
			Check validity of password and set valid/invalid state:
				- Between 8 and 16 character long
				- At least 1 number
				- At least 1 lowercase letter
				- At least 1 uppercase letter
				- At least 1 special character (!,@,#,$,%,^,&,_,=,+,-)
		*/
		let validationRegex = [
			{ regex: /^.{8,16}$/ },
			{ regex: /[0-9]/ },
			{ regex: /[a-z]/ },
			{ regex: /[A-Z]/ }, 
			{ regex: /[!@#$%^&_=+-]/ }
		];

		const	inputPass = document.getElementById('input-pass');
		let passwordChecklist = document.querySelectorAll('.list-item');
		inputPass.addEventListener('input', () => {
			const passRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&_=+-]).{8,16}$');
			
			if (passRegex.test(inputPass.value))
				inputPass.setCustomValidity('');
			else 
				inputPass.setCustomValidity('invalid');

			validationRegex.forEach((item, i) => {
				let isValid = item.regex.test(inputPass.value);
			
				if (isValid)
					passwordChecklist[i].classList.add('checked');
				else
					passwordChecklist[i].classList.remove('checked');
			});
		});
		
		/* 
			Check confirm password input value and sets error message
			if password doesn't match. Also sets input state to 'invalid'.
		*/
		const	inputPassRep = document.getElementById('input-pass-rep');
		let	alertRep = false;
		inputPassRep.addEventListener('input', () => {
			if (inputPassRep.value != inputPass.value) {
				if (!alertRep) {
					inputPassRep.setCustomValidity('invalid');
					const alertMssg = document.createElement('p');
					alertMssg.textContent = 'Passwords don\'t match';
					alertMssg.classList.add('alert-message', 'alert-password');
					inputPassRep.insertAdjacentElement('afterend', alertMssg);
					alertRep = true;
				}
			}
			else {
				alertRep = false;
				document.querySelector('.alert-message.alert-password')?.remove();
				inputPassRep.setCustomValidity('');
			}
		});
		const signupButtonBtn = document.getElementById('signup-submit-btn');
		signupButtonBtn.addEventListener('click', async (e) => {
			e.preventDefault();
			const formData = new FormData(signupForm);
			try {
				const response = await fetch('https://localhost:3001/login/signUp/', {
					method: 'POST',
					body: formData,
				});
				if (response.ok) {
					createToast('successful', 'Account created successfully');
					const	homeIcon = document.getElementById('home-icon');
					homeIcon.click();
				}
				else {
					const	responseJson = await response.json();
					throw new Error(`${responseJson.error}`);
				}
			  } catch (e) {
				createToast('warning', `Error: ${e}`);
			  }
		});
	};

}

customElements.define('sign-up', Signup);

export default  function signup () {
	return ('<sign-up></sign-up>');
}
