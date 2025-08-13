using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json; // This might not be strictly needed if using System.Text.Json (default in newer .NET Core)
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

[Route("api/[controller]")]
[ApiController]
public class RutasController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var rutas = Ruta.GetAll();
            return Ok(RutaListResponse.GetResponse(rutas));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = ex.Message,
                type = "error"
            });
        }
    }

    [HttpGet("{id}")]
    public ActionResult GetById(int id)
    {
        try
        {
            var ruta = Ruta.GetById(id);

            if (ruta == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Ruta con ID {id} no encontrada",
                    type = "error"
                });

            return Ok(RutaResponse.GetResponse(ruta));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = ex.Message,
                type = "error"
            });
        }
    }

    [HttpGet("detalladas")]
    public ActionResult GetRutasDetalladas()
    {
        try
        {
            var query = "SELECT * FROM vista_rutas_detalladas";
            var command = new SqlCommand(query);
            var table = SqlServerConnection.ExecuteQuery(command);

            var rutas = RutaDetalladaMapper.MapFromDataTable(table);
            return Ok(RutaDetalladaResponse.GetResponse(rutas));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = ex.Message,
                type = "error"
            });
        }
    }

    [HttpGet("detalladas/{id}")]
    public ActionResult GetRutaDetalladaPorId(int id)
    {
        try
        {
            var query = "SELECT * FROM vista_rutas_detalladas WHERE id_usuario_asignado = @id";
            var command = new SqlCommand(query);
            command.Parameters.AddWithValue("@id", id);

            var table = SqlServerConnection.ExecuteQuery(command);
            var rutas = RutaDetalladaMapper.MapFromDataTable(table);

            if (rutas.Count == 0)
            {
                return NotFound(new
                {
                    status = 1,
                    message = $"El usuario con id {id} no tiene rutas asignadas",
                    type = "error"
                });
            }

            return Ok(new
            {
                status = 0,
                message = "Consulta exitosa",
                type = "success",
                data = rutas
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = ex.Message,
                type = "error"
            });
        }
    }

    [HttpPut("update-progress")]
    public IActionResult UpdateRutaProgressAndStatus([FromBody] UpdateRutaProgressStatusRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { status = 1, message = "Datos de entrada inválidos." });
        }

        bool success = Ruta.UpdateProgresoAndEstado(request.IdRuta, request.ProgresoRuta, request.Estado);

        if (success)
        {
            return Ok(new { status = 0, message = "Progreso y estado de la ruta actualizados correctamente." });
        }
        else
        {
            return StatusCode(500, new { status = 1, message = "No se pudo actualizar el progreso y estado de la ruta o la ruta no fue encontrada." });
        }
    }

    // New: POST method to create a new Ruta
    [HttpPost]
    public ActionResult Post([FromBody] Ruta newRuta)
    {
        try
        {
            if (newRuta == null)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la ruta son nulos.",
                    type = "error"
                });
            }

            // The IdRuta will be set by the database upon insertion
            newRuta.Insert(); // Calling the new Insert method in Ruta class

            return CreatedAtAction(nameof(GetById), new { id = newRuta.IdRuta }, RutaResponse.GetResponse(newRuta));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al agregar la ruta: " + ex.Message,
                type = "error"
            });
        }
    }

    [HttpPost("asignar")] // Un endpoint POST con una ruta específica como "asignar"
    public ActionResult AsignarRuta([FromBody] AsignarRutaRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                status = 1,
                message = "Datos de entrada inválidos.",
                type = "error",
                errors = ModelState // Opcional: para mostrar errores de validación del modelo
            });
        }

        try
        {
            Ruta.AsignarRutaARecolector(
                request.IdRuta,
                request.IdRecolector,
                request.IdAprobador,
                request.FechaProgramada
            );

            return Ok(new
            {
                status = 0,
                message = "Ruta asignada correctamente al recolector.",
                type = "success"
            });
        }
        catch (Exception ex)
        {
            // Captura la excepción general o SqlException si quieres un manejo más granular
            return StatusCode(500, new
            {
                status = 999,
                message = "Error al asignar la ruta: " + ex.Message,
                type = "error"
            });
        }
    }

    // Nuevo: Endpoint para liberar una ruta asignada
    [HttpPut("liberar")] // Un endpoint PUT con una ruta específica como "liberar"
    public ActionResult LiberarRuta([FromBody] LiberarRutaRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                status = 1,
                message = "Datos de entrada inválidos.",
                type = "error",
                errors = ModelState
            });
        }

        try
        {
            Ruta.LiberarRutaAsignada(request.IdRuta);

            return Ok(new
            {
                status = 0,
                message = "Ruta liberada y itinerario cancelado correctamente.",
                type = "success"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Error al liberar la ruta: " + ex.Message,
                type = "error"
            });
        }
    }
}

public class UpdateRutaProgressStatusRequest
{
    public int IdRuta { get; set; }
    public int ProgresoRuta { get; set; }
    public string Estado { get; set; }
}