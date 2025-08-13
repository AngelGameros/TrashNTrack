// public/DataConnection/Post.js

import { config } from "./Config.js";

// este método contiene la lógica de como se maneja el envío de información del método post
export async function fetchPost(endpoint,info){
    const url = config.api.url + endpoint;
    console.log("URL para el método: "+url);
    console.log("datos a subir:", info); // Corregido para imprimir el objeto completo
    try{
        const response = await fetch(url, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(info)
        });
        if(!response.ok){
            // Intentamos leer el error como texto en caso de que no sea JSON válido
            const errorText = await response.text();
            const errorMessage = `Error HTTP ${response.status}: ${errorText || response.statusText}`;
            console.error("Error al crear mensaje en la API:", errorMessage);
            throw new Error(errorMessage);
        }
        const result = await response.json();
        console.log("Post subido con éxito (respuesta de la API):", result);
        return result;

    }
    catch(error){
        console.error("Error al realizar la solicitud POST:", error);
        throw error;

    }
}

// =======================================
// POST PARA INCIDENTES
// =======================================
export async function postIncidentes(newIncidente){
    if(!newIncidente){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Incidente", newIncidente);
}


// =======================================
// POST PARA REPORTES
// =======================================
export async function postReportes(newReporte){
    if(!newReporte){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Reportes/registrar", newReporte);
}


// =======================================
// POST PARA USUARIOS
// =======================================
export async function postUsuarios(newUsuario){
    if(!newUsuario){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Usuarios", newUsuario);
}


// =======================================
// POST PARA CONTENEDORES (un solo contenedor) SOLO PARA SENSORES
// =======================================
export async function postContainer(newContainer,coleccion){
    if(!newContainer){
        throw new Error("Los datos del contenedor no pueden estar vacíos.");
    }
    // El endpoint es simplemente "Containers" para crear un solo contenedor
    return fetchPost("Containers/"+coleccion, newContainer);
}


// =======================================
// POST PARA PLANTAS 
// ======================================
export async function postPlantas(newPlanta){
    if(!newPlanta){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Plantas", newPlanta);
}


// =======================================
// POST PARA RUTAS
// =======================================
export async function postRutas(newRuta){
    if(!newRuta){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Rutas", newRuta);
}


// =======================================
// POST PARA EMPRESAS
// =======================================
export async function postEmpresas(newEmpresa){
    if(!newEmpresa){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Empresas", newEmpresa);
}


// =======================================
// POST PARA asignar rutas
// =======================================
export async function AsignarRutas(infoAsignar){
    if(!infoAsignar){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Rutas/asignar", infoAsignar);
}

// =======================================
// POST PARA UBICACIONES
// =======================================
export async function postUbicacion(newUbicacion){
    if(!newUbicacion){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Ubicaciones", newUbicacion);
}

// =======================================
// POST PARA RutasEmpresas
// =======================================
export async function postRutasEmpresas(newRutaEmpresa){
    if(!newRutaEmpresa){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("RutasEmpresas", newRutaEmpresa);
}

// =======================================
// POST PARA RutasPlantas
// =======================================
export async function postRutasPlantas(newRutaPlanta){
    if(!newRutaPlanta){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("RutasPlantas", newRutaPlanta);
}

// =======================================
// POST PARA CAMIONES
// =======================================
export async function postCamiones(newCamion){
    if(!newCamion){
        throw new Error("Los datos no pueden estar vacíos");
    }
    return fetchPost("Camiones", newCamion);
}


// =======================================
// POST PARA Contenedores (sin sensores)
// =======================================
// Se crea una nueva función para manejar el envío de FormData, 
// ya que fetchPost está diseñado para JSON.
export async function postContenedor(newContenedor){
    if(!newContenedor){
        throw new Error("Los datos no pueden estar vacíos");
    }
    
    // Construimos el FormData con las claves correctas
    const formData = new FormData();
    formData.append("descripcion", newContenedor.descripcion);
    formData.append("fecha_registro", newContenedor.fecha_registro); // <-- CORREGIDO
    formData.append("id_empresa", newContenedor.id_empresa); // <-- CORREGIDO
    formData.append("id_tipo_contenedor", newContenedor.id_tipo_contenedor); // <-- CORREGIDO

    const url = config.api.url + "Contenedores";
    console.log("URL para el método: " + url);
    console.log("Datos a subir (FormData):", newContenedor);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData, // fetch maneja el Content-Type por sí solo con FormData
        });

        if (!response.ok) {
            const errorText = await response.text();
            const errorMessage = `Error HTTP ${response.status}: ${errorText || response.statusText}`;
            console.error("Error al crear mensaje en la API:", errorMessage);
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Post subido con éxito (respuesta de la API):", result);
        return result;

    } catch (error) {
        console.error("Error al realizar la solicitud POST:", error);
        throw error;
    }
}