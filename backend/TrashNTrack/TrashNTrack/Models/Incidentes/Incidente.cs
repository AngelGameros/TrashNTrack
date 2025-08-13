using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Incidente
{
    #region SQL Statements
    private static string IncidenteGetAll = @"
        SELECT id_incidente, nombre, fecha_incidente, url_foto, descripcion, id_usuario, estado_incidente, fecha_resolucion, resuelto_por 
        FROM Incidentes";

    private static string IncidenteGetById = @"
        SELECT id_incidente, nombre, fecha_incidente, url_foto, descripcion, id_usuario, estado_incidente, fecha_resolucion, resuelto_por
        FROM Incidentes 
        WHERE id_incidente = @Id";

    private static string IncidenteGetByUsuario = @"
        SELECT id_incidente, nombre, fecha_incidente, url_foto, descripcion, id_usuario, estado_incidente, fecha_resolucion, resuelto_por        
        FROM Incidentes 
        WHERE id_usuario = @UsuarioId";

    private static string IncidenteGetByDateRange = @"
        SELECT id_incidente, nombre, fecha_incidente, url_foto, descripcion, id_usuario, estado_incidente, fecha_resolucion, resuelto_por
        FROM Incidentes 
        WHERE fecha_incidente BETWEEN @FechaInicio AND @FechaFin";

    private static string IncidenteCreate = @"
        INSERT INTO Incidentes ( nombre, fecha_incidente, url_foto, descripcion, id_usuario, estado_incidente, fecha_resolucion, resuelto_por)
        OUTPUT INSERTED.id_incidente
        VALUES (@Nombre, @FechaIncidente, @PhotoUrl, @Descripcion, @IdUsuario, @EstadoIncidente, @FechaResolucion, @ResueltoPor)";

    private static string IncidenteUpdateEstado = @"
        UPDATE Incidentes
        SET estado_incidente = @estado_incidente
        WHERE id_incidente = @id_incidente";
    #endregion

    #region Properties
    public int IdIncidente { get; set; }
    public string Nombre { get; set; }
    public DateTime? FechaIncidente { get; set; } // <--- CAMBIO: Ahora es nullable
    public string? PhotoUrl { get; set; } // <--- CAMBIO: Ahora es nullable
    public string Descripcion { get; set; }
    public int IdUsuario { get; set; }
    public string? EstadoIncidente { get; set; } // <--- CAMBIO: Ahora es nullable
    public DateTime? FechaResolucion { get; set; }
    public int? ResueltoPor { get; set; }
    #endregion

    #region Constructors
    public Incidente()
    {
        IdIncidente = 0;
        Nombre = string.Empty;
        FechaIncidente = null; // <--- CAMBIO: Inicializar como null
        PhotoUrl = null; // <--- CAMBIO: Inicializar como null
        Descripcion = string.Empty;
        IdUsuario = 0;
        EstadoIncidente = null; // <--- CAMBIO: Inicializar como null
        FechaResolucion = null;
        ResueltoPor = null;
    }

    public Incidente(int id, string nombre, DateTime? fechaIncidente, string? photoUrl, string descripcion, int idUsuario, string? estadoIncidente, DateTime? fechaResolucion, int? resueltoPor)
    {
        IdIncidente = id;
        Nombre = nombre;
        FechaIncidente = fechaIncidente;
        PhotoUrl = photoUrl;
        Descripcion = descripcion;
        IdUsuario = idUsuario;
        EstadoIncidente = estadoIncidente;
        FechaResolucion = fechaResolucion;
        ResueltoPor = resueltoPor;
    }
    #endregion


    #region Methods
    public static List<Incidente> GetAll()
    {
        SqlCommand command = new SqlCommand(IncidenteGetAll);
        return IncidenteMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Incidente GetById(int id)
    {
        SqlCommand command = new SqlCommand(IncidenteGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? IncidenteMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Incidente> GetByUsuario(int usuarioId)
    {
        SqlCommand command = new SqlCommand(IncidenteGetByUsuario);
        command.Parameters.AddWithValue("@UsuarioId", usuarioId);
        return IncidenteMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<Incidente> GetByDateRange(DateTime fechaInicio, DateTime fechaFin)
    {
        SqlCommand command = new SqlCommand(IncidenteGetByDateRange);
        command.Parameters.AddWithValue("@FechaInicio", fechaInicio);
        command.Parameters.AddWithValue("@FechaFin", fechaFin);
        return IncidenteMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static int Create(Incidente incidente)
    {
        SqlCommand command = new SqlCommand(IncidenteCreate);
        command.Parameters.AddWithValue("@Nombre", incidente.Nombre);

        command.Parameters.AddWithValue("@FechaIncidente", (object)incidente.FechaIncidente ?? DBNull.Value);
        command.Parameters.AddWithValue("@PhotoUrl", (object)incidente.PhotoUrl ?? DBNull.Value);
        command.Parameters.AddWithValue("@Descripcion", incidente.Descripcion);
        command.Parameters.AddWithValue("@IdUsuario", incidente.IdUsuario);

        // <--- CAMBIO CLAVE AQUÍ: Si EstadoIncidente es null, usa un valor por defecto ("abierto")
        command.Parameters.AddWithValue("@EstadoIncidente", (object)incidente.EstadoIncidente ?? "ABIERTO"); // <-- Valor por defecto

        command.Parameters.AddWithValue("@FechaResolucion", (object)incidente.FechaResolucion ?? DBNull.Value);
        command.Parameters.AddWithValue("@ResueltoPor", (object)incidente.ResueltoPor ?? DBNull.Value);

        return Convert.ToInt32(SqlServerConnection.ExecuteScalar(command));
    }


    public static bool UpdateEstadoIncidente(int idIncidente, string nuevoEstado)
    {
        using (SqlCommand command = new SqlCommand(IncidenteUpdateEstado))
        {
            command.Parameters.AddWithValue("@id_incidente", idIncidente);
            command.Parameters.AddWithValue("@estado_incidente", nuevoEstado ?? (object)DBNull.Value);

            int rowsAffected = SqlServerConnection.ExecuteCommand(command);
            return rowsAffected > 0;
        }
    }
    #endregion
}