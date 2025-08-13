using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class SensoresController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var sensores = Sensor.GetAll();
            return Ok(SensorListResponse.GetResponse(sensores));
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
            var sensor = Sensor.GetById(id);

            if (sensor == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Sensor con ID {id} no encontrado",
                    type = "error"
                });

            return Ok(SensorResponse.GetResponse(sensor));
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

    [HttpGet("por-contenedor/{contenedorId}")]
    public ActionResult GetByContenedor(int contenedorId)
    {
        try
        {
            var sensores = Sensor.GetByContenedor(contenedorId);
            return Ok(SensorListResponse.GetResponse(sensores));
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
}