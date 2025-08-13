import { config } from "./Config.js";


export async function putData(endpoint, data) {
    const url = config.api.url + endpoint;
    console.log("PUT =>", url);

    return await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(result => {
        if (!result.ok) {
            return result.json().then(err => { throw err; });
        }
        return result.json();
    })
    .catch(error => {
        console.error("Error en putData:", error);
        throw error;
    });
}

// =======================================
// PUTS PARA USUARIOS
// =======================================

// Puts.js

export async function putUsuario(id, { nombre, primerApellido, segundoApellido, numeroTelefono, firebase_uid }) {
    // Primero actualizamos nombre y apellidos
    const nameUpdate = await putData(`Usuarios/${id}`, {
        nombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido
    });

    // Luego actualizamos el número telefónico usando el Firebase UID
    const phoneUpdate = await putData("Usuarios/phone", {
        firebase_uid,
        numero_telefono: numeroTelefono
    });

    // Considera ambas actualizaciones exitosas si ambas respuestas dicen "success"
    if (nameUpdate.status === "success" && phoneUpdate.status === "success") {
        return { status: "success" };
    }

    // Si uno falla, devuelve el error
    return {
        status: "error",
        message: (nameUpdate.message || phoneUpdate.message || "Error al actualizar usuario")
    };
}


// =======================================
// PUT para Empresas
// =======================================
export async function putEmpresas(id, infoEmpresa) {
    if (!id) {
        throw new Error("se debe especificar el id de la ruta.");
    }
    if (!infoEmpresa) {
        throw new Error("Updated route data cannot be empty.");
    }
    return putData("Rutas", id, infoEmpresa);

    /* Información esperada para actualizar Rutas:
{
    "idEmpresa": 1, //este también debe de coincidir con el que vas a actualizar, ya luego lo arreglo xd
    "nombre": "Prueba de Put2", 
    "fechaRegistro": "7-4-2025",
    "rfc": "EMP123456A1",
    "idUbicacion": 3
}
    Nota: El "id" se pasa a la ruta como parte del URL como un argumento serparado
    si es necesario también actualizar el ID este se debe de agregar en el cuerpo
*/
}

// =======================================
// PUT para PLANTAS
// =======================================
export async function putPlantas(id, infoPlantas) {
    if (!id) {
        throw new Error("se debe especificar el id de la ruta.");
    }
    if (!infoPlantas) {
        throw new Error("Updated route data cannot be empty.");
    }
    return putData("Plantas", id, infoPlantas);
}

// =======================================
// PUT para usar el método de canelar un itinerario (liberar ruta)
// =======================================
export async function cancelarRuta(id,idRutaLiberar) {
    if (!idRutaLiberar) {
        throw new Error("Updated route data cannot be empty.");
    }
    id = "liberar";
    return putData("Rutas", id, idRutaLiberar);

    /*
 el método espera un resultado parecido a:
    {"idRuta": 1} (no funciona si la ruta no existe o no está asignada)
*/
}

// =======================================
// PUT para UBICACION
// =======================================
export async function putEmpresa(id, infoUbicacion) {
    if (!id) {
        throw new Error("se debe especificar el id de la ruta.");
    }
    if (!infoUbicacion) {
        throw new Error("Updated route data cannot be empty.");
    }
    return putData("Rutas", id, infoUbicacion);

    /*información esperada por el método
    {
    "idUbicacion": 18,
    "direccion": "asereje ja dejebe tu dejebe",
    "latitud": 32.50112300,
    "longitud": -117.00345600
    }
    */

}

// =======================================
// PUT para USUARIOS
// =======================================
export async function putUsuarios(id, infoUsuario) {
    if (!id) {
        throw new Error("se debe especificar el id de la ruta.");
    }
    if (!infoUsuario) {
        throw new Error("Updated route data cannot be empty.");
    }
    return fetchPut("Usuarios", id, infoUsuario);
/*
{
  "nombre": "Nuevo Nombre",
  "primer_apellido": "Nuevo Primer Apellido",
  "segundo_apellido": "Nuevo Segundo Apellido"
}
*/
}

// =======================================
// PUT para cambiar estado del incidente
// =======================================
export async function putEstadoIncidente(id, nuevoEstado) {
    if (!nuevoEstado) {
        throw new Error("se debe especificar el id de la ruta.");
    }
    if (!nuevoEstado) {
        throw new Error("Updated route data cannot be empty.");
    }
    return fetchPut("Incidentes", id, nuevoEstado);

    /*información esperada por el método
    {
        "estado_Incidente": "CERRADO"
    }
    */
}

// =======================================
// PUT para CAMIONES
// =======================================
export async function putCamiones(id, infoCamion) {
    if (!id) {
        throw new Error("Se debe especificar el id del camión.");
    }
    if (!infoCamion) {
        throw new Error("La información del camión no puede estar vacía.");
    }

    return putData(`Camiones/${id}`, infoCamion);
}