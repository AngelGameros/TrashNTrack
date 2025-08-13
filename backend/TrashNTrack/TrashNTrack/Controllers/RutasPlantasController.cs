using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class RutasPlantasController : ControllerBase
{
    // GET: api/rutasplantas
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var rutasPlantas = RutaPlanta.GetAll();
            return Ok(RutaPlantaListResponse.GetResponse(rutasPlantas));
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

    // GET: api/rutasplantas/{idRuta}/{idPlanta}
    [HttpGet("{idRuta}/{idPlanta}")]
    public ActionResult GetByCompositeKey(int? idRuta, int? idPlanta)
    {
        try
        {
            var rutaPlanta = RutaPlanta.GetByCompositeKey(idRuta, idPlanta);

            if (rutaPlanta == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Registro con IdRuta {idRuta} y IdPlanta {idPlanta} no encontrado",
                    type = "error"
                });

            return Ok(RutaPlantaResponse.GetResponse(rutaPlanta));
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

    // POST: api/rutasplantas
    [HttpPost]
    public ActionResult Post([FromBody] RutaPlanta newRutaPlanta)
    {
        try
        {
            if (newRutaPlanta == null)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la ruta_planta son nulos.",
                    type = "error"
                });
            }

            newRutaPlanta.Insert();

            return Ok(new
            {
                status = 0,
                message = "Ruta_planta agregada correctamente.",
                data = newRutaPlanta
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al agregar la ruta_planta: " + ex.Message,
                type = "error"
            });
        }
    }

    [HttpPut]
    public ActionResult Put([FromBody] RutaPlanta updatedRutaPlanta)
    {
        try
        {
            if (updatedRutaPlanta == null)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la ruta_planta son nulos.",
                    type = "error"
                });
            }

            updatedRutaPlanta.Update();

            return Ok(new
            {
                status = 0,
                message = "Ruta_planta actualizada correctamente (si hubiera campos a modificar).",
                data = updatedRutaPlanta
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al actualizar la ruta_planta: " + ex.Message,
                type = "error"
            });
        }
    }
}