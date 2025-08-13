
        // Función para mostrar cuadro de mensaje
        function showMessage(message, isError = false) {
            const messageBox = document.getElementById('messageBox');
            messageBox.textContent = message;
            messageBox.classList.remove('hidden', 'error');
            if (isError) {
                messageBox.classList.add('error');
            }
            messageBox.style.display = 'block';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000); // Ocultar después de 5 segundos
        }

        // Función para mostrar/ocultar mensajes de error de campo
        function displayFieldError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + 'Error');
            const inputElement = document.getElementById(fieldId);
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

        // Función de validación para el año
        function validateAnio(anio) {
            const currentYear = new Date().getFullYear();
            if (anio === null || isNaN(anio) || anio < 1900 || anio > (currentYear)) {
                return "El año debe ser un número válido entre 1900 y " + (currentYear) + ".";
            }
            return ""; // Sin error
        }

        // Función de validación para la capacidad de carga
        function validateCapacidadCarga(capacidad) {
            if (capacidad === null || isNaN(capacidad) || capacidad <= 0 || capacidad > 200) { // Límite de 200 toneladas
                return "La capacidad de carga debe ser un número positivo, máximo 200 toneladas.";
            }
            return ""; // Sin error
        }

        // Función para guardar un camión en localStorage
        function saveTruckToLocalStorage(truckData) {
            let trucks = JSON.parse(localStorage.getItem('camiones')) || [];
            
            // Generar un ID único para el camión
            const newId = 'CAM-' + (trucks.length > 0 ? Math.max(...trucks.map(t => parseInt(t.id.replace('CAM-', '')))) + 1 : 1).toString().padStart(3, '0');
            truckData.id = newId; // Asignar el ID único
            truckData.id_camion = newId; // Para coincidir con el esquema de la tabla si es necesario

            trucks.push(truckData);
            localStorage.setItem('camiones', JSON.stringify(trucks));
            console.log("Camión guardado en localStorage:", truckData);
            return { id: newId }; // Devolver un objeto similar al docRef de Firebase
        }

        // Manejar el envío del formulario de Nuevo Camión
        document.getElementById('newTruckForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            // Limpiar mensajes de error previos
            displayFieldError('placa', '');
            displayFieldError('marca', '');
            displayFieldError('modelo', '');
            displayFieldError('anio', '');
            displayFieldError('capacidadCarga', '');

            const placa = document.getElementById('placa').value;
            const marca = document.getElementById('marca').value || null;
            const modelo = document.getElementById('modelo').value || null;
            const anio = parseInt(document.getElementById('anio').value);
            const capacidadCarga = parseFloat(document.getElementById('capacidadCarga').value);

            let isValid = true;

            // Validaciones
            if (!placa) {
                displayFieldError('placa', 'La placa es obligatoria.');
                isValid = false;
            }

            const anioError = validateAnio(anio);
            if (anioError) {
                displayFieldError('anio', anioError);
                isValid = false;
            }

            const capacidadCargaError = validateCapacidadCarga(capacidadCarga);
            if (capacidadCargaError) {
                displayFieldError('capacidadCarga', capacidadCargaError);
                isValid = false;
            }

            if (!isValid) {
                showMessage("Por favor, corrige los errores en el formulario.", true);
                return;
            }

            const newTruckData = {
                placa: placa,
                marca: marca,
                modelo: modelo,
                anio: anio,
                capacidad_carga: capacidadCarga,
                id_usuario: 'simulated-user-id', 
                id_empresa: 'simulated-company-id', 
            };

            try {
                const result = saveTruckToLocalStorage(newTruckData);
                console.log("Camión registrado con ID (localStorage): ", result.id);
                showMessage("Camión registrado exitosamente (simulado)!");
                document.getElementById('newTruckForm').reset(); // Limpiar formulario
                
                // Redirigir a camiones.html después de un breve retraso para que el usuario vea el mensaje
                setTimeout(() => {
                    window.location.href = 'camiones.html';
                }, 1500); // Redirige después de 1.5 segundos

            } catch (error) {
                console.error("Error al registrar el camión (localStorage):", error);
                showMessage(`Error al registrar el camión (localStorage): ${error.message}`, true);
            }
        });

        // Inicializar la aplicación (no se necesita Firebase para esta simulación)
        window.onload = () => {
            console.log("Aplicación de registro de camiones inicializada con localStorage.");
        };
 