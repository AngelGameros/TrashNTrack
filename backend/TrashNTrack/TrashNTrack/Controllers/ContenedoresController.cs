using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ContenedoresController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var contenedores = Contenedor.GetAll();
            return Ok(ContenedorListResponse.GetResponse(contenedores));
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
            var contenedor = Contenedor.GetById(id);

            if (contenedor == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Contenedor con ID {id} no encontrado",
                    type = "error"
                });

            return Ok(ContenedorResponse.GetResponse(contenedor));
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

    [HttpGet("empresa/{idEmpresa}")]
public IActionResult GetContenedoresPorEmpresa(int idEmpresa)
{
    try
    {
        // Consulta a la vista
        SqlCommand cmd = new SqlCommand("SELECT * FROM ContenedoresPorEmpresa WHERE id_empresa = @idEmpresa");
        cmd.Parameters.AddWithValue("@idEmpresa", idEmpresa);

        DataTable resultado = SqlServerConnection.ExecuteQuery(cmd);

        if (resultado.Rows.Count == 0)
        {
            return NotFound(new
            {
                status = -1,
                message = "No se encontraron contenedores para esta empresa"
            });
        }

        // Extraer datos de empresa de la primera fila
        var empresa = new
        {
            id = Convert.ToInt32(resultado.Rows[0]["id_empresa"]),
            nombre = resultado.Rows[0]["nombre"].ToString()
        };

        // Lista de contenedores
        var contenedores = resultado.Rows.Cast<DataRow>().Select(row => new
        {
            id = Convert.ToInt32(row["id_contenedor"]),
            descripcion = row["descripcion_contenedor"].ToString(),
            fechaRegistro = Convert.ToDateTime(row["fecha_registro"]).ToString("yyyy-MM-dd"),
            tipoContenedor = row["tipo_contenedor"]?.ToString(),
            capacidadMaxima = row["capacidad_maxima"] != DBNull.Value ? Convert.ToDecimal(row["capacidad_maxima"]) : 0,
            tipoResiduo = row["tipo_residuo"]?.ToString()
        }).ToList();

        // Respuesta
        return Ok(new
        {
            status = 0,
            message = "Contenedores obtenidos correctamente",
            empresa,
            contenedores
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new
        {
            status = -1,
            message = "Error al obtener los contenedores",
            errorDetails = ex.Message
        });
    }
}


    [HttpGet("por-tipo-residuo/{tipoResiduoId}")]
    public ActionResult GetByTipoResiduo(int tipoResiduoId)
    {
        try
        {
            var contenedores = Contenedor.GetByTipoResiduo(tipoResiduoId);
            return Ok(ContenedorListResponse.GetResponse(contenedores));
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
            var contenedores = Contenedor.GetByEstado(estado);
            return Ok(ContenedorListResponse.GetResponse(contenedores));
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
    [RequestSizeLimit(10_000_000)]
    public Task<IActionResult> RegistrarContendor(
   [FromForm] string descripcion,
   [FromForm] string fecha_registro,
   [FromForm] int id_empresa,
   [FromForm] int id_tipo_residuo, // Esto ahora será un string ISO UTC
   [FromForm] int id_tipo_contenedor)
    {
        try
        {
            // Insertar en BD
            SqlCommand insertCmd = new SqlCommand(@"
            insert into contenedores (descripcion,fecha_registro,id_empresa,id_tipo_residuo,id_tipo_contenedor)
            VALUES 
                (@descripcion, @fecha_registro, @id_empresa, @id_tipo_residuo, @id_tipo_contenedor)");

            insertCmd.Parameters.AddWithValue("@descripcion", descripcion ?? "");
            insertCmd.Parameters.AddWithValue("@fecha_registro", fecha_registro); // Se guardará como UTC en la base de datos
            insertCmd.Parameters.AddWithValue("@id_empresa", id_empresa);
            insertCmd.Parameters.AddWithValue("@id_tipo_residuo", id_tipo_residuo );
            insertCmd.Parameters.AddWithValue("@id_tipo_contenedor", id_tipo_contenedor);

            SqlServerConnection.ExecuteCommand(insertCmd);

            return Task.FromResult<IActionResult>(Ok(new
            {
                status = 0,
                message = "Contenedor registrado correctamente",
            }));
        }
        catch (Exception ex)
        {
            return Task.FromResult<IActionResult>(StatusCode(500, new
            {
                status = -1,
                message = "Error interno del servidor",
                errorDetails = ex.Message
            }));
        }
    }
}