using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class RutasEmpresasController : ControllerBase
{
    // GET: api/rutasempresas
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var rutasEmpresas = RutaEmpresa.GetAll();
            return Ok(RutaEmpresaListResponse.GetResponse(rutasEmpresas));
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

    // GET: api/rutasempresas/{idRuta}/{idEmpresa}
    [HttpGet("{idRuta}/{idEmpresa}")]
    public ActionResult GetByCompositeKey(int? idRuta, int? idEmpresa)
    {
        try
        {
            var rutaEmpresa = RutaEmpresa.GetByCompositeKey(idRuta, idEmpresa);

            if (rutaEmpresa == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Registro con IdRuta {idRuta} y IdEmpresa {idEmpresa} no encontrado",
                    type = "error"
                });

            return Ok(RutaEmpresaResponse.GetResponse(rutaEmpresa));
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

    // POST: api/rutasempresas
    [HttpPost]
    public ActionResult Post([FromBody] RutaEmpresa newRutaEmpresa)
    {
        try
        {
            if (newRutaEmpresa == null)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la ruta_empresa son nulos.",
                    type = "error"
                });
            }

            newRutaEmpresa.Insert();

            return Ok(new
            {
                status = 0,
                message = "Ruta_empresa agregada correctamente.",
                data = newRutaEmpresa
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al agregar la ruta_empresa: " + ex.Message,
                type = "error"
            });
        }
    }

    // PUT: api/rutasempresas
    [HttpPut]
    public ActionResult Put([FromBody] RutaEmpresa updatedRutaEmpresa)
    {
        try
        {
            if (updatedRutaEmpresa == null)
            {
                return BadRequest(new
                {
                    status = 1,
                    message = "Los datos de la ruta_empresa son nulos.",
                    type = "error"
                });
            }

            updatedRutaEmpresa.Update();

            return Ok(new
            {
                status = 0,
                message = "Ruta_empresa actualizada correctamente.",
                data = updatedRutaEmpresa
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = 999,
                message = "Ocurrió un error al actualizar la ruta_empresa: " + ex.Message,
                type = "error"
            });
        }
    }
}