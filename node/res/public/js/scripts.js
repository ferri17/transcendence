
function test() {
    console.log("HIHIHIHIHI");
}
UID = "u-s4t2ud-c9372edee74345442b4a74d561037186bc6cc251b40413f8291d92e5ee4257b1"
async function post42(url, payload) {
    url = "https://api.intra.42.fr" + url;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(payload)
    });
    return response.json();
}

async function get42(url, params) {
    const queryParams = new URLSearchParams(params).toString();
    url = "https://api.intra.42.fr" + url + '?' + queryParams;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.json();
  }

async function callApi42(){
    const params = new URLSearchParams ({
        "client_id": UID,
        "redirect_uri": "http://localhost:3000/",
        "scope": "public",
        "state": "1234566i754twrqwdfghgfddtrwsewrt",
        "response_type": "code"
    });
    window.location.href = `https://api.intra.42.fr/oauth/authorize/?${params.toString()}`;
}

function getVars(){
    let inEmail = document.getElementById("email");
    let inName = document.getElementById("name");
    let inPass = document.getElementById("pass");

    let jsonDone = ({"user": inName.value});
    jsonDone["mail"] = inEmail.value;
    jsonDone["psw"] = inPass.value;
    return jsonDone;
}

function sendToBackend() {
    fetch('http://localhost:8080/enviar-mensaje/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(getVars())
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => console.log(JSON.stringify(data)))
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
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

function callBackAccess() {
    let vars = getPathVars();0
    console.log("CODE: " + vars["code"]);
    console.log("STATE: " + vars["state"]);
    fetch('http://localhost:8080/loginIntra/', {
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
        console.log(data);
        if (data["access_token"])
        {
            fetch('https://api.intra.42.fr/v2/me', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + data["access_token"]
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                let img = data['image'];
                let linkImg = img['link'];
                console.log(linkImg);
                var divimg = document.getElementById("img-logointra");
                var imgCont = document.createElement('img');
                imgCont.src = linkImg;
                imgCont.alt = "Intra IMG";
                imgCont.height = 150;
                imgCont.width = 150;
                imgCont.className = "img-circ";
                divimg.appendChild(imgCont);
            })
            .catch(error => console.error('There has been a problem with your fetch operation:', error));
        }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

window.addEventListener('DOMContentLoaded', event => {

    callBackAccess();

    // Obtener referencia al formulario y al botón
    var formulario = document.getElementById("contactForm");
    var botonEnviar = document.getElementById("btn-testing");

    botonEnviar.disabled = true;
    // Agregar un event listener para detectar cambios en el formulario
    if (formulario)
        formulario.addEventListener("input", validarCampos);

    // Función para validar los campos y habilitar/deshabilitar el botón
    function validarCampos() {
        var camposLlenos = true;

        // Recorrer todos los campos del formulario
        for (var i = 0; i < formulario.elements.length; i++) {
            var campo = formulario.elements[i];

            // Verificar si el campo es un input y está vacío
            if (campo.tagName.toLowerCase() === "input" && campo.value.trim() === "") {
                camposLlenos = false;
                break; // Salir del bucle si se encuentra un campo vacío
            }
        }

        // Habilitar o deshabilitar el botón según los campos estén llenos o no
        botonEnviar.disabled = !camposLlenos;
    }
    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});
