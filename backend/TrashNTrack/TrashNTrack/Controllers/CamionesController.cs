using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class CamionesController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        var listaCamiones = Camiones.Get();
        var response = CamionesListResponse.GetResponse(listaCamiones);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public ActionResult GetById(int id)
    {
        try
        {
            var camion = Camiones.Get(id);
            var response = CamionesResponse.GetResponse(camion);
            return Ok(response);
        }
        catch (UsuarioNotFoundException ex) // Catch the specific exception if a truck is not found
        {
            return NotFound(new { Status = 1, Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = 1, Message = "An error occurred: " + ex.Message });
        }
    }

    [HttpPost]
    public ActionResult Post([FromBody] Camiones camion)
    {
        try
        {
            if (camion == null)
            {
                return BadRequest(new { Status = 1, Message = "Truck data is null." });
            }

            // The ID should be 0 or handled by the database for new insertions
            camion.IdCamion = 0;
            camion.Insert(); // Call the Insert method

            var response = CamionesResponse.GetResponse(camion);
            return CreatedAtAction(nameof(GetById), new { id = camion.IdCamion }, response); // Return 201 Created
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = 1, Message = "An error occurred while adding the truck: " + ex.Message });
        }
    }

    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Camiones camion)
    {
        try
        {
            if (camion == null || id != camion.IdCamion)
            {
                return BadRequest(new { Status = 1, Message = "Truck data is invalid or ID mismatch." });
            }

            // Check if the truck exists before attempting to update
            var existingCamion = Camiones.Get(id); // This will throw UsuarioNotFoundException if not found

            camion.Update(); // Call the Update method

            var response = CamionesResponse.GetResponse(camion);
            return Ok(response); // Return 200 OK
        }
        catch (UsuarioNotFoundException)
        {
            return NotFound(new { Status = 1, Message = $"Truck with ID {id} not found." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = 1, Message = "An error occurred while updating the truck: " + ex.Message });
        }
    }
}