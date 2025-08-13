using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class AlertasController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var alertas = Alerta.GetAll();
            return Ok(AlertaListResponse.GetResponse(alertas));
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
            var alerta = Alerta.GetById(id);

            if (alerta == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Alerta con ID {id} no encontrada",
                    type = "error"
                });

            return Ok(AlertaResponse.GetResponse(alerta));
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

    [HttpGet("por-sensor/{sensorId}")]
    public ActionResult GetBySensor(int sensorId)
    {
        try
        {
            var alertas = Alerta.GetBySensor(sensorId);
            return Ok(AlertaListResponse.GetResponse(alertas));
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

    [HttpGet("por-tipo/{tipoAlerta}")]
    public ActionResult GetByTipo(string tipoAlerta)
    {
        try
        {
            var alertas = Alerta.GetByTipo(tipoAlerta);
            return Ok(AlertaListResponse.GetResponse(alertas));
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

    [HttpGet("por-fecha")]
    public ActionResult GetByDateRange([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
    {
        try
        {
            var alertas = Alerta.GetByDateRange(fechaInicio, fechaFin);
            return Ok(AlertaListResponse.GetResponse(alertas));
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