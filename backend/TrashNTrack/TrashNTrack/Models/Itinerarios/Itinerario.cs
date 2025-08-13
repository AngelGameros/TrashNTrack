using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Itinerario
{
    #region SQL Statements
    private static string ItinerarioGetAll = @"
        SELECT id_itinerario, estado, fecha_programada, id_ruta, 
               hora_inicio_real, hora_fin_real, id_aprobador
        FROM Itinerarios";

    private static string ItinerarioGetById = @"
        SELECT id_itinerario, estado, fecha_programada, id_ruta, 
               hora_inicio_real, hora_fin_real, id_aprobador
        FROM Itinerarios 
        WHERE id_itinerario = @Id";

    private static string ItinerarioGetByRuta = @"
        SELECT id_itinerario, estado, fecha_programada, id_ruta, 
               hora_inicio_real, hora_fin_real, id_aprobador
        FROM Itinerarios 
        WHERE id_ruta = @RutaId";

    private static string ItinerarioGetByEstado = @"
        SELECT id_itinerario, estado, fecha_programada, id_ruta, 
               hora_inicio_real, hora_fin_real, id_aprobador
        FROM Itinerarios 
        WHERE estado = @Estado";
    #endregion

    #region Properties
    public int IdItinerario { get; set; }
    public string Estado { get; set; }
    public DateTime FechaProgramada { get; set; }
    public int IdRuta { get; set; }
    public DateTime? HoraInicioReal { get; set; }
    public DateTime? HoraFinReal { get; set; }
    public int IdAprobador { get; set; }
    #endregion

    #region Constructors
    public Itinerario()
    {
        Estado = "Pendiente";
        FechaProgramada = DateTime.Today;
    }

    public Itinerario(int id, string estado, DateTime fechaProgramada, int idRuta,
                      DateTime? horaInicioReal, DateTime? horaFinReal, int idAprobador)
    {
        IdItinerario = id;
        Estado = estado;
        FechaProgramada = fechaProgramada;
        IdRuta = idRuta;
        HoraInicioReal = horaInicioReal;
        HoraFinReal = horaFinReal;
        IdAprobador = idAprobador;
    }
    #endregion

    #region Methods
    public static List<Itinerario> GetAll()
    {
        SqlCommand command = new SqlCommand(ItinerarioGetAll);
        return ItinerarioMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Itinerario GetById(int id)
    {
        SqlCommand command = new SqlCommand(ItinerarioGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? ItinerarioMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Itinerario> GetByRuta(int rutaId)
    {
        SqlCommand command = new SqlCommand(ItinerarioGetByRuta);
        command.Parameters.AddWithValue("@RutaId", rutaId);
        return ItinerarioMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<Itinerario> GetByEstado(string estado)
    {
        SqlCommand command = new SqlCommand(ItinerarioGetByEstado);
        command.Parameters.AddWithValue("@Estado", estado);
        return ItinerarioMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static bool CambiarEstado(int idItinerario, string nuevoEstado)
    {
        using (var command = new SqlCommand())
        {
            command.CommandText = @"
        -- Actualizar el itinerario
        UPDATE itinerarios
        SET estado = @nuevoEstado,
            hora_inicio_real = CASE WHEN @nuevoEstado = 'INICIADO' THEN GETDATE() ELSE hora_inicio_real END
        WHERE id_itinerario = @idItinerario;

        -- Si el estado es INICIADO, también actualizar la ruta asociada
        IF @nuevoEstado = 'INICIADO'
        BEGIN
            UPDATE rutas
            SET estado = 'INICIADA'
            WHERE id_ruta = (
                SELECT id_ruta
                FROM itinerarios
                WHERE id_itinerario = @idItinerario
            );
        END
        ";

            command.Parameters.AddWithValue("@nuevoEstado", nuevoEstado);
            command.Parameters.AddWithValue("@idItinerario", idItinerario);

            int rowsAffected = SqlServerConnection.ExecuteCommand(command);
            return rowsAffected > 0;
        }
    }
    #endregion
}
