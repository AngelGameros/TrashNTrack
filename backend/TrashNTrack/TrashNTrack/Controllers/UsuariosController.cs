using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TrashNTrack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public ActionResult Get()
        {
            try
            {
                var usuarios = Usuario.Get();

                // Pasa la lista de usuarios al método GetResponse
                var response = UsuarioListResponse.GetResponse();
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR EN CONTROLADOR: {ex.ToString()}");
                return StatusCode(500, new
                {
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // GET api/<UsuariosController>/5
        [HttpGet]
        [Route("{id}")]
        public ActionResult Get(int id)
        {
            try
            {
                Usuario a = Usuario.Get(id);
                return Ok(UsuarioResponse.GetResponse(a));
            }
            catch (UsuarioNotFoundException e)
            {
                return Ok(MessageResponse.GetResponse(1, e.Message, MessageType.Error));
            }
            catch (Exception e)
            {
                return Ok(MessageResponse.GetResponse(999, e.Message, MessageType.Error));
            }
        }

        // Obtener usuario por Firebase UID
        [HttpGet]
        [Route("firebase/{uid}")]
        public ActionResult GetByFirebaseUid(string uid)
        {
            try
            {
                // Necesitarás implementar este método en tu clase Usuario
                Usuario a = Usuario.GetByFirebaseUid(uid);
                return Ok(UsuarioResponse.GetResponse(a));
            }
            catch (UsuarioNotFoundException e)
            {
                return Ok(MessageResponse.GetResponse(1, e.Message, MessageType.Error));
            }
            catch (Exception e)
            {
                return Ok(MessageResponse.GetResponse(999, e.Message, MessageType.Error));
            }
        }

        // Actualizar número de teléfono
        [HttpPut]
        [Route("phone")]
        public ActionResult UpdatePhone([FromBody] PhoneUpdateRequest request)
        {
            try
            {
                // Necesitarás implementar este método en tu clase Usuario
                bool updated = Usuario.UpdatePhone(request.firebase_uid, request.numero_telefono);

                if (updated)
                    return Ok(new { status = "success", message = "Número actualizado correctamente" });
                else
                    return BadRequest(new { status = "error", message = "No se pudo actualizar el número" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        // Nuevo método PUT para actualizar nombre y apellidos por id_usuario
        [HttpPut("{id}")]
        public ActionResult UpdateUserDetails(int id, [FromBody] UserUpdateDetailsRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { status = "error", message = "Datos de solicitud inválidos." });
                }

                bool updated = Usuario.UpdateUserById(
                    id,
                    request.nombre,
                    request.primer_apellido,
                    request.segundo_apellido
                );

                if (updated)
                    return Ok(new { status = "success", message = "Detalles del usuario actualizados correctamente" });
                else
                    return BadRequest(new { status = "error", message = "No se pudieron actualizar los detalles del usuario o el usuario no fue encontrado." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR EN CONTROLADOR al actualizar detalles de usuario: {ex.ToString()}");
                return StatusCode(500, new
                {
                    status = "error",
                    message = "Error interno del servidor al actualizar detalles del usuario.",
                    detailedError = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        public class UserUpdateDetailsRequest
        {
            public string nombre { get; set; }
            public string primer_apellido { get; set; }
            public string segundo_apellido { get; set; }
        }

        public class PhoneUpdateRequest
        {
            public string firebase_uid { get; set; }
            public string numero_telefono { get; set; }
        }

        [HttpPost]
        [Route("")]
        public ActionResult Post([FromBody] Usuario usuario)
        {
            if (usuario == null)
                return BadRequest("Datos del usuario inválidos.");

            try
            {
                if (string.IsNullOrEmpty(usuario.TipoUsuario) || (usuario.TipoUsuario != "admin" && usuario.TipoUsuario != "recolector"))
                {
                    usuario.TipoUsuario = "recolector";
                }

                bool inserted = usuario.Insert();

                if (inserted)
                    return Ok(new { status = "success", message = "Usuario creado correctamente" });
                else
                    return BadRequest(new { status = "error", message = "No se pudo crear el usuario" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

    }
}