import { getCookie } from "../user_login";

class BlockChain extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar data-authorized></nav-bar>
			<main class="container">
				<div class="col-sm-12 col-md-9 col-lg-6 mx-auto">
					<div class="mb-5 row">
						<h1 class="text-center">Tournament history</h1>
						<p class="text-center">View all tournament history in this website.</p>
					</div>
					<section id='matches-container' class="d-flex flex-column gap-3">
					</section>
				</div>
			</main>
		`;
	}

	async connectedCallback() {
		fetch('https://localhost:3001/tourapi/blockchain/get_tournament', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + await getCookie('token'),
				'Content-Type': 'application/json'
			},
		})
		.then(response => {
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			return response.json();
		})
		.then(data => {
			console.log(data);
			const matchesContainer = document.getElementById('matches-container');
			const block = data["results"];
			console.log(block)
			block.map(match => {
				const matchCard = document.createElement('div');
			
				// Descomponer el marcador
				const [score_winner, score_runnerup] = match.final_score.split('-').map(Number);

				matchCard.classList.add('w-100', 'match-card');
				// Aquí asumo que tienes una función `getMatchType` que puede obtener el tipo de torneo
				matchCard.innerHTML = /* html */ `
					<div class="d-flex justify-content-between">
						<p class="match-card-type mb-0">Players: ${(match.participant_count)}</p>
					</div>
					<div class="d-flex justify-content-center gap-5 align-items-center">
						<div class="d-flex align-items-center gap-3">
							<div class="match-card-pic"></div>
							<p class="mb-0">${extractUsername(match.winner)}</p>
						</div>
						<p class="match-card-score krona-font fs-2 mb-0">${score_winner} - ${score_runnerup}</p>
						<div class="d-flex align-items-center gap-3">
							<p class="mb-0">${extractUsername(match.runner_up)}</p>
							<div class="match-card-pic"></div>
						</div>
					</div>
				`;
			
				matchesContainer.appendChild(matchCard);
			});
			
		})
		.catch(error => {
			console.error('There has been a problem with your fetch operation:', error);
			return false;
		});

	};
}

function extractUsername(data) {
    // Expresión regular para identificar el patrón correcto: user id <number> aka <username>
    const regex = /^user id \d+ aka (.+)$/;

    // Intentar encontrar una coincidencia con el patrón
    const match = data.match(regex);

    // Si hay una coincidencia, devolver el alias; de lo contrario, devolver el texto original
    if (match) {
        return match[1];  // El alias que está después de "aka"
    } else {
        return data;  // Si no coincide, devolver el valor tal como está
    }
}

function timeAgo(date) {
	const now = new Date();
	const gameDate = new Date(date);
	const difference = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));

	if (difference === 0) return "Today";
	else if (difference === 1) return "1 day ago";
	else return `${difference} days ago`;
}

customElements.define('block-chain', BlockChain);

export default  function blockchain () {
	return ('<block-chain></block-chain>');
}