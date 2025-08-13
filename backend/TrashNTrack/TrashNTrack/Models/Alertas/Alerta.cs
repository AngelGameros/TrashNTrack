using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Alerta
{
    #region SQL Statements
    private static string AlertaGetAll = @"
        SELECT id_alerta, tipo_alerta, descripcion, fecha_alerta, id_sensor 
        FROM Alertas";

    private static string AlertaGetById = @"
        SELECT id_alerta, tipo_alerta, descripcion, fecha_alerta, id_sensor 
        FROM Alertas 
        WHERE id_alerta = @Id";

    private static string AlertaGetBySensor = @"
        SELECT id_alerta, tipo_alerta, descripcion, fecha_alerta, id_sensor 
        FROM Alertas 
        WHERE id_sensor = @SensorId";

    private static string AlertaGetByTipo = @"
        SELECT id_alerta, tipo_alerta, descripcion, fecha_alerta, id_sensor 
        FROM Alertas 
        WHERE tipo_alerta = @TipoAlerta";

    private static string AlertaGetByDateRange = @"
        SELECT id_alerta, tipo_alerta, descripcion, fecha_alerta, id_sensor 
        FROM Alertas 
        WHERE fecha_alerta BETWEEN @FechaInicio AND @FechaFin";
    #endregion

    #region Properties
    public int IdAlerta { get; set; }
    public string TipoAlerta { get; set; }
    public string Descripcion { get; set; }
    public DateTime FechaAlerta { get; set; }
    public int IdSensor { get; set; }
    #endregion

    #region Constructors
    public Alerta()
    {
        IdAlerta = 0;
        TipoAlerta = string.Empty;
        Descripcion = string.Empty;
        FechaAlerta = DateTime.MinValue;
        IdSensor = 0;
    }

    public Alerta(int id, string tipo, string descripcion, DateTime fecha, int idSensor)
    {
        IdAlerta = id;
        TipoAlerta = tipo;
        Descripcion = descripcion;
        FechaAlerta = fecha;
        IdSensor = idSensor;
    }
    #endregion

    #region Methods
    public static List<Alerta> GetAll()
    {
        SqlCommand command = new SqlCommand(AlertaGetAll);
        return AlertaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Alerta GetById(int id)
    {
        SqlCommand command = new SqlCommand(AlertaGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? AlertaMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Alerta> GetBySensor(int sensorId)
    {
        SqlCommand command = new SqlCommand(AlertaGetBySensor);
        command.Parameters.AddWithValue("@SensorId", sensorId);
        return AlertaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<Alerta> GetByTipo(string tipoAlerta)
    {
        SqlCommand command = new SqlCommand(AlertaGetByTipo);
        command.Parameters.AddWithValue("@TipoAlerta", tipoAlerta);
        return AlertaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<Alerta> GetByDateRange(DateTime fechaInicio, DateTime fechaFin)
    {
        SqlCommand command = new SqlCommand(AlertaGetByDateRange);
        command.Parameters.AddWithValue("@FechaInicio", fechaInicio);
        command.Parameters.AddWithValue("@FechaFin", fechaFin);
        return AlertaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }
    #endregion
}