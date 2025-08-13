using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Reporte
{
    #region statements
    private static string ReporteGetAll = @"
        SELECT id_reporte, nombre, fecha_reporte , descripcion, id_usuario, estado, id_contenedor, collected_amount, container_status 
        FROM Reportes";

    private static string ReporteGetById = @"
        SELECT id_reporte, nombre, fecha_reporte , descripcion, id_usuario, estado, id_contenedor, collected_amount, container_status 
        FROM Reportes 
        WHERE id_reporte = @Id";

    private static string ReporteGetByUsuario = @"
        SELECT id_reporte, nombre, fecha_reporte , descripcion, id_usuario, estado, id_contenedor, collected_amount, container_status 
        FROM Reportes 
        WHERE id_usuario = @UsuarioId";

    private static string ReporteGetByDateRange = @"
        SELECT id_reporte, nombre, fecha_reporte , descripcion, id_usuario, estado, id_contenedor, collected_amount, container_status 
        FROM Reportes 
        WHERE fecha_reporte BETWEEN @FechaInicio AND @FechaFin";
    #endregion

    #region properties
    public int IdReporte { get; set; }
    public string Nombre { get; set; }
    public DateTime FechaReporte { get; set; }
    public string Descripcion { get; set; }
    public int IdUsuario { get; set; }
    public string Estado { get; set; }
    public int Id_contenedor { get; set; }
    public int Collected_amount { get; set; }
    public string Container_status { get; set; }
    #endregion

    #region constructors
    public Reporte()
    {
        IdReporte = 0;
        Nombre = string.Empty;
        FechaReporte = DateTime.MinValue;
        Descripcion = string.Empty;
        IdUsuario = 0;
        Estado = string.Empty;
        Id_contenedor = 0;
        Collected_amount = 0;
        Container_status = string.Empty;
    }

    public Reporte(int id, string nombre, DateTime fecha, string descripcion, int idUsuario,string estado, int id_contenedor, int collected_amount, string container_status)
    {
        IdReporte = id;
        Nombre = nombre;
        FechaReporte = fecha;
        Descripcion = descripcion;
        IdUsuario = idUsuario;
        Estado = estado;
        Id_contenedor = id_contenedor;
        Collected_amount = collected_amount;
        Container_status = container_status;
    }
    #endregion

    #region methods
    public static List<Reporte> GetAll()
    {
        SqlCommand command = new SqlCommand(ReporteGetAll);
        return ReporteMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Reporte GetById(int id)
    {
        SqlCommand command = new SqlCommand(ReporteGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? ReporteMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Reporte> GetByUsuario(int usuarioId)
    {
        SqlCommand command = new SqlCommand(ReporteGetByUsuario);
        command.Parameters.AddWithValue("@UsuarioId", usuarioId);
        return ReporteMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<Reporte> GetByDateRange(DateTime fechaInicio, DateTime fechaFin)
    {
        SqlCommand command = new SqlCommand(ReporteGetByDateRange);
        command.Parameters.AddWithValue("@FechaInicio", fechaInicio);
        command.Parameters.AddWithValue("@FechaFin", fechaFin);
        return ReporteMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }
    #endregion
}