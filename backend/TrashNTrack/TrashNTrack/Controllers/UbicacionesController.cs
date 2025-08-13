using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class UbicacionesController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        var listaUbicaciones = Ubicacion.Get();
        var response = UbicacionListResponse.GetResponse(listaUbicaciones);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public ActionResult GetById(int id)
    {
        try
        {
            var ubicacion = Ubicacion.Get(id);
            var response = UbicacionResponse.GetResponse(ubicacion);
            return Ok(response);
        }
        catch (UbicacionNotFoundException ex)
        {
            return NotFound(new { Status = 1, Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = 1, Message = "An error occurred: " + ex.Message });
        }
    }

    [HttpPost]
    public ActionResult Post([FromBody] Ubicacion ubicacion)
    {
        try
        {
            if (ubicacion == null)
            {
                return BadRequest(new { Status = 1, Message = "Ubicacion data is null." });
            }

            ubicacion.Insert();

            var response = UbicacionResponse.GetResponse(ubicacion);
            return CreatedAtAction(nameof(GetById), new { id = ubicacion.IdUbicacion }, response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = 1, Message = "An error occurred while adding the ubicacion: " + ex.Message });
        }
    }

    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Ubicacion ubicacion)
    {
        try
        {
            if (ubicacion == null || id != ubicacion.IdUbicacion)
            {
                return BadRequest(new { Status = 1, Message = "Ubicacion data is invalid or ID mismatch." });
            }

            var existingUbicacion = Ubicacion.Get(id);

            ubicacion.Update();

            var response = UbicacionResponse.GetResponse(ubicacion);
            return Ok(response);
        }
        catch (UbicacionNotFoundException)
        {
            return NotFound(new { Status = 1, Message = $"Ubicacion with ID {id} not found." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = 1, Message = "An error occurred while updating the ubicacion: " + ex.Message });
        }
    }
}