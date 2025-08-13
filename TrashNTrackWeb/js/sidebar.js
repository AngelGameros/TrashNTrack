//load side menu
async function loadSideMenu() {
    //load json file
    return await fetch('../json/menu.json')
        .then( (response) => { return response.json(); })
        .catch( (error) => { console.error(error); });
}
//show side menu
export function showSideMenu(){
    //parent div
    var sideMenu = document.getElementById('side-menu');
    sideMenu.innerHTML = '<h1 id="sideBarTitle">Trash&Track</h1>'; //empty div
    //load json
    loadSideMenu().then( (response) => {
        response.options.forEach(option => {
            sideMenu.appendChild(drawOption(option));
        });
    });
}
//draw menu option
function drawOption(option) {
    //parent div
    var divOption = document.createElement('div');
    divOption.id = 'side-menu-option-' + option.id;
    divOption.className = 'side-menu-option';
    if (option.id === 1013) {
        divOption.addEventListener('click', () => {
            handleLogout();
        });
    } else {
        // Para todas las demás opciones, mantén el comportamiento actual
        divOption.addEventListener('click', () => {
            loadComponent(option.component);
        });
    }    //icon
    var divIcon = document.createElement('div');
    divIcon.className = 'side-menu-icon';
    divOption.appendChild(divIcon);
    var icon = document.createElement('i');
    icon.className = 'fas fa-' + option.icon;
    divIcon.appendChild(icon);
    //label
    var divLabel = document.createElement('div');
    divLabel.className = 'side-menu-label';
    divLabel.innerHTML = option.text;
    divOption.appendChild(divLabel);
    //return div
    return divOption;
}

//load component
export async function loadComponent(component) {
    var url =  component ;
    var urlCode = '../' + component;
    fetch(url)
        .then( (response) => { return response.text(); })
        .then( (html) => { loadHtml(html); })
        .then( () => { importModule(urlCode); })
        .catch( (error) => { console.error('Invalid HTML file'); })    
    loadHtml(url)
}
//loading html
async function loadHtml(url) {
    console.log('Redirect...');
    window.location.href= url;
}
//import module
async function importModule(moduleUrl) {
    console.log('Importing Module ' + moduleUrl)
    let { init } = await import(moduleUrl)
    init();
}
async function handleLogout() {
    try {
        // Cierra la sesión del usuario con Firebase
        await firebase.auth().signOut();

        // Limpia la información del usuario del localStorage
        localStorage.removeItem("currentAdminUID");

        // Redirige al usuario a la página de login.html
        window.location.href = '../html/login.html';
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        // Opcional: muestra un mensaje de error al usuario
        alert("Ocurrió un error al intentar cerrar sesión. Por favor, inténtalo de nuevo.");
    }
}