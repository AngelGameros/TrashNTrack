using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Linq;
using Newtonsoft.Json;

[Route("api/[controller]")]
[ApiController]
public class IncidentesPorUsuarioController : ControllerBase
{
    [HttpGet("{firebaseUid}")]
    public IActionResult GetIncidentesPorUsuario(string firebaseUid)
    {
        try
        {
            SqlCommand getUserCmd = new SqlCommand("SELECT id_usuario FROM USUARIOS WHERE firebase_uid = @UID");
            getUserCmd.Parameters.AddWithValue("@UID", firebaseUid);
            DataTable userTable = SqlServerConnection.ExecuteQuery(getUserCmd);

            if (userTable.Rows.Count == 0)
                return NotFound(new { status = -1, message = "Usuario no encontrado" });

            int idUsuario = Convert.ToInt32(userTable.Rows[0]["id_usuario"]);

            SqlCommand getIncidentesCmd = new SqlCommand("SELECT * FROM IncidentesPorUsuario WHERE id_usuario = @ID ORDER BY id_incidente DESC");
            getIncidentesCmd.Parameters.AddWithValue("@ID", idUsuario);
            DataTable incidentesTable = SqlServerConnection.ExecuteQuery(getIncidentesCmd);

            if (incidentesTable.Rows.Count == 0)
                return Ok(new { status = 0, message = "No hay incidentes reportados", incidentes = new object[0] });

            // CAMBIO: Usar IncidenteMapperVista en lugar de IncidenteMapper
            var incidentesList = IncidenteMapperVista.ToList(incidentesTable);

            // CAMBIO: Usar IncidenteListResponseVista en lugar de IncidenteListResponse
            var response = IncidenteListResponseVista.GetResponse(incidentesList);

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { status = -1, message = ex.Message });
        }
    }

    [HttpPost]
    [RequestSizeLimit(10_000_000)]
    public Task<IActionResult> RegistrarIncidente(
    [FromForm] string foto,
    [FromForm] string nombre,
    [FromForm] string descripcion,
    [FromForm] string fechaIncidente, // Esto ahora será un string ISO UTC
    [FromForm] string firebaseUid)
    {
        try
        {
            if (string.IsNullOrEmpty(foto) || string.IsNullOrEmpty(firebaseUid))
                return Task.FromResult<IActionResult>(BadRequest(new { status = -1, message = "Faltan datos obligatorios" }));

            // Obtener ID del usuario
            SqlCommand getUserCmd = new SqlCommand("SELECT id_usuario FROM USUARIOS WHERE firebase_uid = @UID");
            getUserCmd.Parameters.AddWithValue("@UID", firebaseUid);
            DataTable userTable = SqlServerConnection.ExecuteQuery(getUserCmd);

            if (userTable.Rows.Count == 0)
                return Task.FromResult<IActionResult>(NotFound(new { status = -1, message = "Usuario no encontrado" }));

            int idUsuario = Convert.ToInt32(userTable.Rows[0]["id_usuario"]);

            // Validar y parsear fecha desde el cliente como UTC
            DateTime fecha;
            // Se espera un formato ISO 8601, que new Date().toISOString() produce
            if (!DateTime.TryParse(fechaIncidente, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.AdjustToUniversal, out fecha))
            {
                // Si el parsing falla, usa DateTime.UtcNow (la fecha y hora actual en UTC)
                fecha = DateTime.UtcNow;
            }

            // Insertar en BD
            SqlCommand insertCmd = new SqlCommand(@"
            INSERT INTO INCIDENTES 
                (nombre, fecha_incidente, url_foto, descripcion, id_usuario)
            VALUES 
                (@nombre, @fecha, @foto, @descripcion, @usuario)");

            insertCmd.Parameters.AddWithValue("@nombre", nombre ?? "");
            insertCmd.Parameters.AddWithValue("@fecha", fecha); // Se guardará como UTC en la base de datos
            insertCmd.Parameters.AddWithValue("@foto", foto);
            insertCmd.Parameters.AddWithValue("@descripcion", descripcion ?? "");
            insertCmd.Parameters.AddWithValue("@usuario", idUsuario);

            SqlServerConnection.ExecuteCommand(insertCmd);

            return Task.FromResult<IActionResult>(Ok(new
            {
                status = 0,
                message = "Incidente registrado correctamente",
                imageUrl = foto,
                fecha = fecha.ToString("yyyy-MM-dd HH:mm:ss.fffZ") // Opcional: devolver la fecha en UTC para confirmación
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

    [HttpGet("/{firebaseUid}")]
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