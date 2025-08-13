using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class IncidenteVista
{
    #region SQL Statements
    private static string IncidenteGetAll = @"
        SELECT id_incidente, nombre, fecha_incidente, photo_url, descripcion, id_usuario 
        FROM Incidentes";

    private static string IncidenteGetById = @"
        SELECT id_incidente, nombre, fecha_incidente, photo_url, descripcion, id_usuario 
        FROM Incidentes 
        WHERE id_incidente = @Id";

    private static string IncidenteGetByUsuario = @"
        SELECT id_incidente, nombre, fecha_incidente, photo_url, descripcion, id_usuario 
        FROM Incidentes 
        WHERE id_usuario = @UsuarioId";

    private static string IncidenteGetByDateRange = @"
        SELECT id_incidente, nombre, fecha_incidente, photo_url, descripcion, id_usuario 
        FROM Incidentes 
        WHERE fecha_incidente BETWEEN @FechaInicio AND @FechaFin";

    private static string IncidenteCreate = @"
        INSERT INTO Incidentes (nombre, fecha_incidente, photo_url, descripcion, id_usuario)
        OUTPUT INSERTED.id_incidente
        VALUES (@Nombre, @FechaIncidente, @PhotoUrl, @Descripcion, @IdUsuario)";
    #endregion

    #region Properties
    public int IdIncidente { get; set; }
    public string Nombre { get; set; }
    public DateTime FechaIncidente { get; set; }
    public string PhotoUrl { get; set; }
    public string Descripcion { get; set; }
    public int IdUsuario { get; set; }
    #endregion

    #region Constructors
    public IncidenteVista()
    {
        IdIncidente = 0;
        Nombre = string.Empty;
        FechaIncidente = DateTime.Now;
        PhotoUrl = string.Empty;
        Descripcion = string.Empty;
        IdUsuario = 0;
    }

    public IncidenteVista(int id, string nombre, DateTime fechaIncidente, string photoUrl, string descripcion, int idUsuario)
    {
        IdIncidente = id;
        Nombre = nombre;
        FechaIncidente = fechaIncidente;
        PhotoUrl = photoUrl;
        Descripcion = descripcion;
        IdUsuario = idUsuario;
    }
    #endregion

    #region Methods
    public static List<IncidenteVista> GetAll()
    {
        SqlCommand command = new SqlCommand(IncidenteGetAll);
        return IncidenteMapperVista.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static IncidenteVista GetById(int id)
    {
        SqlCommand command = new SqlCommand(IncidenteGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? IncidenteMapperVista.ToObject(table.Rows[0]) : null;
    }

    public static List<IncidenteVista> GetByUsuario(int usuarioId)
    {
        SqlCommand command = new SqlCommand(IncidenteGetByUsuario);
        command.Parameters.AddWithValue("@UsuarioId", usuarioId);
        return IncidenteMapperVista.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<IncidenteVista> GetByDateRange(DateTime fechaInicio, DateTime fechaFin)
    {
        SqlCommand command = new SqlCommand(IncidenteGetByDateRange);
        command.Parameters.AddWithValue("@FechaInicio", fechaInicio);
        command.Parameters.AddWithValue("@FechaFin", fechaFin);
        return IncidenteMapperVista.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static int Create(IncidenteVista incidente)
    {
        SqlCommand command = new SqlCommand(IncidenteCreate);
        command.Parameters.AddWithValue("@Nombre", incidente.Nombre);
        command.Parameters.AddWithValue("@FechaIncidente", incidente.FechaIncidente);
        command.Parameters.AddWithValue("@PhotoUrl", incidente.PhotoUrl);
        command.Parameters.AddWithValue("@Descripcion", incidente.Descripcion);
        command.Parameters.AddWithValue("@IdUsuario", incidente.IdUsuario);

        return Convert.ToInt32(SqlServerConnection.ExecuteScalar(command));
    }
    #endregion
}