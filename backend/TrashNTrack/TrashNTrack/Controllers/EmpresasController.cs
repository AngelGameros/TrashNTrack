using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class EmpresasController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var empresas = Empresa.GetAll();
            return Ok(EmpresaListResponse.GetResponse(empresas));
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
            var empresa = Empresa.GetById(id);

            if (empresa == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Empresa con ID {id} no encontrada",
                    type = "error"
                });

            return Ok(EmpresaResponse.GetResponse(empresa));
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
            var empresas = Empresa.GetByUbicacion(ubicacionId);
            return Ok(EmpresaListResponse.GetResponse(empresas));
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

    [HttpGet("buscar")]
    public ActionResult SearchByName([FromQuery] string term)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(term))
                return BadRequest(new
                {
                    status = 2,
                    message = "El término de búsqueda no puede estar vacío",
                    type = "error"
                });

            var empresas = Empresa.SearchByName(term);
            return Ok(EmpresaListResponse.GetResponse(empresas));
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

    [HttpPost]
    public ActionResult Post([FromBody] Empresa newEmpresa)
    {
        try
        {
            if (newEmpresa == null)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la empresa son nulos.",
                    type = "error"
                });
            }

            // The IdEmpresa will be set by the database upon insertion
            newEmpresa.Insert();

            return CreatedAtAction(nameof(GetById), new { id = newEmpresa.IdEmpresa }, EmpresaResponse.GetResponse(newEmpresa));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al agregar la empresa: " + ex.Message,
                type = "error"
            });
        }
    }

    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Empresa updatedEmpresa)
    {
        try
        {
            if (updatedEmpresa == null || id != updatedEmpresa.IdEmpresa)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la empresa son inválidos o el ID no coincide.",
                    type = "error"
                });
            }

            var existingEmpresa = Empresa.GetById(id);
            if (existingEmpresa == null)
            {
                return NotFound(new
                {
                    status = 1,
                    message = $"Empresa con ID {id} no encontrada para actualizar.",
                    type = "error"
                });
            }

            updatedEmpresa.Update();

            return Ok(EmpresaResponse.GetResponse(updatedEmpresa));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al actualizar la empresa: " + ex.Message,
                type = "error"
            });
        }
    }
}