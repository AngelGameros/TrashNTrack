// equipo.js
import { getUsuarios } from '../DataConnection/Gets.js'; // Importa las funciones GET
import { putUsuario } from '../DataConnection/Puts.js';


let users = []; // Array para almacenar los datos de los usuarios

// Función auxiliar para mostrar mensajes de éxito/error (asumiendo un elemento #messageContainer)
function showMessage(message, type = 'success') {
    const messageContainer = document.getElementById('messageContainer'); // Asegúrate de tener este elemento en tu HTML
    if (!messageContainer) {
        console.warn('No se encontró el elemento #messageContainer para mostrar mensajes.');
        alert(message); // Fallback a alert si no existe el contenedor
        return;
    }
    messageContainer.textContent = message;
    messageContainer.className = `message ${type}`;
    messageContainer.style.display = 'block';
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// Helper function to format phone number
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'N/A';
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
}

// Función para mostrar/ocultar mensajes de error de campo
function displayFieldError(fieldId, message, isEditModal = false, isAddModal = false) {
    let prefix = '';
    if (isEditModal) prefix = 'edit';
    if (isAddModal) prefix = 'new';

    const errorElement = document.getElementById(prefix + fieldId + 'Error');
    const inputElement = document.getElementById(prefix + fieldId);

    if (errorElement && inputElement) {
        if (message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            inputElement.classList.add('invalid');
        } else {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            inputElement.classList.remove('invalid');
        }
    }
}

// Validación de campos comunes
function validateNombre(nombre, isEdit = false, isAdd = false) {
    if (!nombre || nombre.trim() === '') {
        displayFieldError('Nombre', 'El nombre es obligatorio.', isEdit, isAdd);
        return false;
    }
    displayFieldError('Nombre', '', isEdit, isAdd);
    return true;
}

function validatePrimerApell(apellido, isEdit = false, isAdd = false) {
    if (!apellido || apellido.trim() === '') {
        displayFieldError('PrimerApell', 'El primer apellido es obligatorio.', isEdit, isAdd);
        return false;
    }
    displayFieldError('PrimerApell', '', isEdit, isAdd);
    return true;
}



function validateNumeroTelefono(telefono, isEdit = false, isAdd = false) {
    if (!telefono || telefono.trim() === '') {
        displayFieldError('NumeroTelefono', 'El número de teléfono es obligatorio.', isEdit, isAdd);
        return false;
    }
    // Basic validation for 10 digits (adjust as needed for specific formats)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(telefono)) {
        displayFieldError('NumeroTelefono', 'El teléfono debe tener 10 dígitos.', isEdit, isAdd);
        return false;
    }
    displayFieldError('NumeroTelefono', '', isEdit, isAdd);
    return true;
}

// Render users in the grid
async function renderUsers(filteredUsers = null) {
    const userGrid = document.getElementById('userGrid');
    userGrid.innerHTML = ''; // Limpiar las tarjetas existentes

    if (!filteredUsers) {
        try {
            const apiResponse = await getUsuarios(); // Fetch all users from the API using Gets.js
            console.log("API Response for users:", apiResponse);

            if (apiResponse && apiResponse.usuarios && Array.isArray(apiResponse.usuarios)) {
                users = apiResponse.usuarios;
            } else if (apiResponse && Array.isArray(apiResponse)) { // In case the API returns an array directly
                users = apiResponse;
            }
            else {
                console.error("API response for users is not an array directly or under 'usuarios':", apiResponse);
                users = [];
            }
        } catch (error) {
            console.error("Error al cargar usuarios desde la API:", error);
            userGrid.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar usuarios. Intente de nuevo más tarde.</p>';
            return;
        }
    }

    const usersToRender = filteredUsers || users;

    if (!usersToRender || usersToRender.length === 0) {
        userGrid.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay usuarios registrados que coincidan con la búsqueda.</p>';
        return;
    }

    usersToRender.forEach(user => {
        // Asegúrate de usar los nombres de propiedad correctos del objeto user (primerApell, segundoApellido)
        const fullName = `${user.nombre || ''} ${user.primerApellido || ''} ${user.segundoApellido || ''}`.trim();
        const email = user.correo || 'N/A';
        const phone = formatPhoneNumber(user.numeroTelefono);
        const userType = user.tipoUsuario || 'N/A';

        const userCard = document.createElement('div');
        userCard.className = `team-card`;
        userCard.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <h3>${fullName}</h3>
            <p class="user-role">${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
            <div class="user-info">
                <p class="user-contact"><i class="fas fa-envelope"></i> ${email}</p>
                <p class="user-contact"><i class="fas fa-phone"></i> ${phone}</p>
            </div>
            <div class="user-actions action-buttons">
                <button class="btn-small btn-edit" data-id="${user.idUsuario}">Editar</button>
            </div>
        `;
        userGrid.appendChild(userCard);
    });

    attachButtonListeners();
}

// Attach event listeners to "Ver Detalles" and "Editar" buttons
function attachButtonListeners() {

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.onclick = (event) => {
            const userId = event.target.dataset.id;
            showEditUserModal(userId);
        };
    });
}

// Show "View User" Modal
async function showViewUserModal(userId) {
    const user = users.find(u => u.idUsuario == userId);
    if (!user) {
        console.error("Usuario no encontrado:", userId);
        return;
    }

    document.getElementById('viewUserId').textContent = user.idUsuario;
    const fullName = `${user.nombre || ''} ${user.primerApellido || ''} ${user.segundoApellido || ''}`.trim();
    document.getElementById('viewUserNameFull').textContent = fullName;
    document.getElementById('viewUserName').textContent = fullName;
    document.getElementById('viewUserEmail').textContent = user.correo || 'N/A';
    document.getElementById('viewUserPhone').textContent = formatPhoneNumber(user.numeroTelefono);
    document.getElementById('viewUserType').textContent = user.tipoUsuario ? (user.tipoUsuario.charAt(0).toUpperCase() + user.tipoUsuario.slice(1)) : 'N/A';
    

    openModal('viewUserModal');
}

// Show "Edit User" Modal
async function showEditUserModal(userId) {
    const user = users.find(u => u.idUsuario == userId);
    if (!user) {
        console.error("Usuario no encontrado para editar:", userId);
        return;
    }
     document.getElementById('editUserId').value = user.idUsuario;
    document.getElementById('editNombre').value = user.nombre || '';
    document.getElementById('editPrimerApell').value = user.primerApellido || '';
    document.getElementById('editsegundoApellido').value = user.segundoApellido || '';
    document.getElementById('editNumeroTelefono').value = user.numeroTelefono || '';

    const fullName = `${user.nombre || ''} ${user.primerApellido || ''} ${user.segundoApellido || ''}`.trim();
    document.getElementById('editUserNameFull').textContent = fullName; // Update modal title

    // Clear previous errors
    ['Nombre', 'PrimerApell', 'segundoApellido', 'NumeroTelefono'].forEach(field => {
        displayFieldError(field, '', true);
    });

    openModal('editUserModal');
}


// Handle "Edit User" Form Submission
async function handleEditUserSubmit(event) {
    event.preventDefault();

    const idUsuario = parseInt(document.getElementById('editUserId').value);
    const user = users.find(u => u.idUsuario === idUsuario);
    const nombre = document.getElementById('editNombre').value;
    const primerApell = document.getElementById('editPrimerApell').value;
    const segundoApellido = document.getElementById('editsegundoApellido').value;
    const numeroTelefono = document.getElementById('editNumeroTelefono').value;
    
    let isValid = true;
    isValid = validateNombre(nombre, true) && isValid;
    isValid = validatePrimerApell(primerApell, true) && isValid;
    isValid = validateNumeroTelefono(numeroTelefono, true) && isValid;
    
    if (!isValid) {
        return;
    }

    const updatedUser = {
        nombre,
        primerApellido: primerApell,
        segundoApellido: segundoApellido || null,
        numeroTelefono,
        firebase_uid: user.firebaseUid  // importante para el segundo PUT
    };


    try {
        console.log("ID de usuario a enviar:", idUsuario);
        console.log("Objeto updatedUser a enviar:", updatedUser);

        // Llama a putUsuario de Put.js. La 'response' aquí ya es el JSON parseado.
        const response = await putUsuario(parseInt(idUsuario), updatedUser);
        
        // Verifica si la propiedad 'status' dentro del JSON es "success"
        if (response && response.status === "success") {
            showMessage('Usuario actualizado exitosamente.', 'success');
            closeModal('editUserModal');
            renderUsers(); // Recargar la lista de usuarios para mostrar los cambios
        } else {
            // Si el backend envía un status: "error" o cualquier otro, o si hay un mensaje específico de error.
            const errorMessage = response.message || 'Error desconocido al actualizar usuario.';
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        // Si el error es una excepción lanzada por putData (ej. error de red, JSON malformado en la respuesta)
        // Puedes refinar el mensaje de error si el 'error' tiene una propiedad 'message'
        const displayErrorMessage = error.message ? `Error: ${error.message}` : 'Error al actualizar usuario. Intente de nuevo más tarde.';
        showMessage(displayErrorMessage, 'error');
    }
}


// General Modal Functions (assuming these are global or in a common file)
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
window.closeModal = closeModal; // Make it globally accessible for onclick in HTML

// Handle Search Input
function handleUserSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredUsers = users.filter(user => {
        const fullName = `${user.nombre || ''} ${user.primerApellido || ''} ${user.segundoApellido || ''}`.toLowerCase();
        const email = (user.correo || '').toLowerCase();
        const phone = (user.numeroTelefono || '').toLowerCase();
        const userType = (user.tipoUsuario || '').toLowerCase();

        return fullName.includes(searchTerm) ||
               email.includes(searchTerm) ||
               phone.includes(searchTerm) ||
               userType.includes(searchTerm);
    });
    renderUsers(filteredUsers);
}
window.handleUserSearch = handleUserSearch; // Make it globally accessible for onkeyup in HTML

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
   
    
    renderUsers(); // Initial render of users

   

    // Event listener for "Edit User" form submission
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', handleEditUserSubmit);
    }

   
});