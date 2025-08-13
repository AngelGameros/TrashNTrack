using Microsoft.AspNetCore.Mvc;
using System;
using Microsoft.Data.SqlClient;
using System.Data;

[Route("api/[controller]")]
[ApiController]
public class CamionAsignadoController : ControllerBase
{
    [HttpGet("{firebaseUid}")]
    public IActionResult GetCamionAsignado(string firebaseUid)
    {
        try
        {
            // Paso 1: obtener ID del usuario por UID de Firebase
            SqlCommand getUserCmd = new SqlCommand("SELECT id_usuario FROM USUARIOS WHERE firebase_uid = @UID");
            getUserCmd.Parameters.AddWithValue("@UID", firebaseUid);

            DataTable userTable = SqlServerConnection.ExecuteQuery(getUserCmd);
            if (userTable.Rows.Count == 0)
                return NotFound(new { status = -1, message = "Usuario no encontrado" });

            int idUsuario = Convert.ToInt32(userTable.Rows[0]["id_usuario"]);

            // Paso 2: obtener camión con vista
            SqlCommand getTruckCmd = new SqlCommand("SELECT * FROM detallesCamionUsuario WHERE id_usuario = @ID");
            getTruckCmd.Parameters.AddWithValue("@ID", idUsuario);

            DataTable truckTable = SqlServerConnection.ExecuteQuery(getTruckCmd);
            if (truckTable.Rows.Count == 0)
                return NotFound(new { status = -1, message = "No hay camión asignado" });

            // Puedes mapearlo si tienes una clase Camion
            var camion = CamionAsignadoMapper.ToObject(truckTable.Rows[0]);
            return Ok(new
            {
                camion,
                status = 0
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { status = -1, message = ex.Message });
        }
    }

}
