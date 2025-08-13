using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class ItinerariosController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var itinerarios = Itinerario.GetAll();
            return Ok(ItinerarioListResponse.GetResponse(itinerarios));
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
            var itinerario = Itinerario.GetById(id);

            if (itinerario == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Itinerario con ID {id} no encontrado",
                    type = "error"
                });

            return Ok(ItinerarioResponse.GetResponse(itinerario));
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

    [HttpGet("por-ruta/{rutaId}")]
    public ActionResult GetByRuta(int rutaId)
    {
        try
        {
            var itinerarios = Itinerario.GetByRuta(rutaId);
            return Ok(ItinerarioListResponse.GetResponse(itinerarios));
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

    [HttpGet("por-estado/{estado}")]
    public ActionResult GetByEstado(string estado)
    {
        try
        {
            var itinerarios = Itinerario.GetByEstado(estado);
            return Ok(ItinerarioListResponse.GetResponse(itinerarios));
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

    [HttpGet("usuario/{idUsuario}")]
    public IActionResult GetItinerariosPorUsuario(int idUsuario)
    {
        var itinerarios = ItinerarioSimplificadoService.GetByUsuarioAsignado(idUsuario);
        return Ok(ItinerarioSimplificadoResponse.GetListResponse(itinerarios));
    }

    [HttpPut("{id}/estado")]
    public IActionResult CambiarEstado(int id, [FromBody] string nuevoEstado)
    {
        try
        {
            bool actualizado = Itinerario.CambiarEstado(id, nuevoEstado);
            if (!actualizado)
                return NotFound(new { status = 1, message = "Itinerario no encontrado" });

            return Ok(new { status = 0, message = "Estado actualizado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { status = 999, message = ex.Message });
        }
    }

}