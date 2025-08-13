using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Linq;

[Route("api/[controller]")]
[ApiController]
public class ReportesController : ControllerBase
{
    [HttpGet]
    public ActionResult GetAll()
    {
        try
        {
            var reportes = Reporte.GetAll();
            return Ok(ReporteListResponse.GetResponse(reportes));
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
            var reporte = Reporte.GetById(id);

            if (reporte == null)
                return NotFound(new
                {
                    status = 1,
                    message = $"Reporte con ID {id} no encontrado",
                    type = "error"
                });

            return Ok(ReporteResponse.GetResponse(reporte));
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

    [HttpGet("por-usuario/{usuarioId}")]
    public ActionResult GetByUsuario(int usuarioId)
    {
        try
        {
            var reportes = Reporte.GetByUsuario(usuarioId);
            return Ok(ReporteListResponse.GetResponse(reportes));
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
            var reportes = Reporte.GetByDateRange(fechaInicio, fechaFin);
            return Ok(ReporteListResponse.GetResponse(reportes));
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

    [HttpPost("registrar")]
    [RequestSizeLimit(5_000_000)]
    public IActionResult RegistrarReporte(
    [FromForm] string nombre,
    [FromForm] string descripcion,
    [FromForm] int idUsuario,
    [FromForm] int idContenedor,
    [FromForm] decimal cantidadRecolectada,
    [FromForm] string estadoContenedor,
    [FromForm] int idCamion // si se permite NULL en la tabla, este puede ser opcional
)
    {
        try
        {
            // Validar campos mínimos
            if (string.IsNullOrEmpty(nombre) || idUsuario <= 0 || idContenedor <= 0 || cantidadRecolectada <= 0 || string.IsNullOrEmpty(estadoContenedor))
            {
                return BadRequest(new { status = -1, message = "Faltan campos requeridos" });
            }

            // Insertar en REPORTES con todos los campos necesarios
            SqlCommand cmd = new SqlCommand(@"
            INSERT INTO REPORTES 
            (nombre, fecha_reporte, descripcion, id_usuario, id_contenedor, collected_amount, container_status, estado)
            VALUES 
            (@nombre, GETDATE(), @descripcion, @idUsuario, @idContenedor, @cantidadRecolectada, @estadoContenedor, 'ACTIVO');
            SELECT SCOPE_IDENTITY();
        ");
            cmd.Parameters.AddWithValue("@nombre", nombre);
            cmd.Parameters.AddWithValue("@descripcion", descripcion ?? "");
            cmd.Parameters.AddWithValue("@idUsuario", idUsuario);
            cmd.Parameters.AddWithValue("@idContenedor", idContenedor);
            cmd.Parameters.AddWithValue("@cantidadRecolectada", cantidadRecolectada);
            cmd.Parameters.AddWithValue("@estadoContenedor", estadoContenedor);

            var result = SqlServerConnection.ExecuteScalar(cmd);
            int idReporte = Convert.ToInt32(result);

            // Insertar en REGISTRO_CARGA
            SqlCommand detallesCmd = new SqlCommand(@"
            INSERT INTO REGISTRO_CARGA 
            (fecha_carga, peso_carga, id_camion, id_contenedor, id_reporte)
            VALUES 
            (GETDATE(), @peso, @idCamion, @idContenedor, @idReporte);
        ");
            detallesCmd.Parameters.AddWithValue("@peso", cantidadRecolectada);
            detallesCmd.Parameters.AddWithValue("@idCamion", idCamion == 0 ? (object)DBNull.Value : idCamion); // si idCamion puede ser null
            detallesCmd.Parameters.AddWithValue("@idContenedor", idContenedor);
            detallesCmd.Parameters.AddWithValue("@idReporte", idReporte);

            SqlServerConnection.ExecuteCommand(detallesCmd);

            return Ok(new
            {
                status = 0,
                message = "Reporte registrado correctamente",
                idReporte
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = -1,
                message = "Error interno del servidor",
                errorDetails = ex.Message
            });
        }
    }

    [HttpGet("uid/{firebaseUid}")]
    public IActionResult GetReportesPorFirebaseUid(string firebaseUid)
    {
        try
        {
            SqlCommand getReportsCmd = new SqlCommand(@"
            SELECT 
                r.id_reporte,
                r.nombre,
                r.fecha_reporte,
                r.descripcion,
                r.id_usuario,
                r.id_contenedor,
                r.collected_amount,
                r.container_status,
                r.estado
            FROM REPORTES r
            INNER JOIN USUARIOS u ON r.id_usuario = u.id_usuario
            WHERE u.firebase_uid = @firebaseUid
            ORDER BY r.fecha_reporte DESC;
        ");
            getReportsCmd.Parameters.AddWithValue("@firebaseUid", firebaseUid);

            DataTable reportsTable = SqlServerConnection.ExecuteQuery(getReportsCmd);

            if (reportsTable.Rows.Count == 0)
            {
                return Ok(new { status = 0, message = "No hay reportes para este usuario", data = new List<object>() });
            }

            var reportes = reportsTable.AsEnumerable().Select(row => new
            {
                id = Convert.ToInt32(row["id_reporte"]),
                nombre = row["nombre"].ToString(),
                fecha = Convert.ToDateTime(row["fecha_reporte"]).ToString("yyyy-MM-dd HH:mm:ss"),
                descripcion = row["descripcion"].ToString(),
                containerId = row["id_contenedor"] != DBNull.Value ? Convert.ToInt32(row["id_contenedor"]) : (int?)null,
                collectedAmount = row["collected_amount"] != DBNull.Value ? Convert.ToDecimal(row["collected_amount"]) : (decimal?)null,
                containerStatus = row["container_status"]?.ToString(),
                estado = row["estado"]?.ToString()
            }).ToList();

            return Ok(new
            {
                status = 0,
                message = "Reportes obtenidos correctamente",
                data = reportes
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = -1,
                message = "Error al obtener los reportes",
                errorDetails = ex.Message
            });
        }
    }

}