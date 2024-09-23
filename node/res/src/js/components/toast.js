import { toastNotifications } from '../main';

export function	createToast(type = 'info', message = 'undefined') {
	if (toastNotifications) {
		toastNotifications.innerHTML = '';
	}

	toastNotifications.innerHTML = /* html */`
		<div class="toast-container position-fixed bottom-0 end-0 p-3">
			<div id="liveToast" class="toast toast-${type}" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header">
					<strong class="me-auto">${type === 'warning' ? 'Something went wrong': 'a'}</strong>
					<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div class="toast-body">
					${message}
				</div>
			</div>
		</div>
	`;
	const toast = new bootstrap.Toast(document.getElementById('liveToast'));
	toast.show();
	
}