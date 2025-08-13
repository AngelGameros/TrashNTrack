using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class PlantasController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var plantas = Planta.GetAll();
            return Ok(PlantaListResponse.GetResponse(plantas));
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
            var planta = Planta.GetById(id);

            if (planta == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Planta con ID {id} no encontrada",
                    type = "error"
                });

            return Ok(PlantaResponse.GetResponse(planta));
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

    [HttpGet("por-ubicacion/{ubicacionId}")]
    public ActionResult GetByUbicacion(int ubicacionId)
    {
        try
        {
            var plantas = Planta.GetByUbicacion(ubicacionId);
            return Ok(PlantaListResponse.GetResponse(plantas));
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

    // New: POST method to create a new Planta
    [HttpPost]
    public ActionResult Post([FromBody] Planta newPlanta)
    {
        try
        {
            if (newPlanta == null)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la planta son nulos.",
                    type = "error"
                });
            }

            // The IdPlanta will be set by the database upon insertion
            newPlanta.Insert();

            // Return 201 Created status with the location of the new resource
            return CreatedAtAction(nameof(GetById), new { id = newPlanta.IdPlanta }, PlantaResponse.GetResponse(newPlanta));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al agregar la planta: " + ex.Message,
                type = "error"
            });
        }
    }

    // New: PUT method to update an existing Planta
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Planta updatedPlanta)
    {
        try
        {
            if (updatedPlanta == null || id != updatedPlanta.IdPlanta)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la planta son inválidos o el ID no coincide.",
                    type = "error"
                });
            }

            var existingPlanta = Planta.GetById(id);
            if (existingPlanta == null)
            {
                return NotFound(new
                {
                    status = 1,
                    message = $"Planta con ID {id} no encontrada para actualizar.",
                    type = "error"
                });
            }

            updatedPlanta.Update(); // Call the Update method on the object

            return Ok(PlantaResponse.GetResponse(updatedPlanta));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al actualizar la planta: " + ex.Message,
                type = "error"
            });
        }
    }
}