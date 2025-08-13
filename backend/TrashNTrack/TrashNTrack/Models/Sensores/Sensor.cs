using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Sensor
{
    #region statements
    private static string SensorGetAll = @"
        SELECT id_sensor, tipo_sensor, descripcion, dia_registro, id_contenedor 
        FROM Sensores";

    private static string SensorGetById = @"
        SELECT id_sensor, tipo_sensor, descripcion, dia_registro, id_contenedor 
        FROM Sensores 
        WHERE id_sensor = @Id";

    private static string SensorGetByContenedor = @"
        SELECT id_sensor, tipo_sensor, descripcion, dia_registro, id_contenedor 
        FROM Sensores 
        WHERE id_contenedor = @ContenedorId";
    #endregion

    #region properties
    public int IdSensor { get; set; }
    public string TipoSensor { get; set; }
    public string Descripcion { get; set; }
    public DateTime DiaRegistro { get; set; }
    public int IdContenedor { get; set; }
    #endregion

    #region constructors
    public Sensor()
    {
        IdSensor = 0;
        TipoSensor = "";
        Descripcion = "";
        DiaRegistro = DateTime.MinValue;
        IdContenedor = 0;
    }

    public Sensor(int id, string tipo, string descripcion, DateTime registro, int contenedor)
    {
        IdSensor = id;
        TipoSensor = tipo;
        Descripcion = descripcion;
        DiaRegistro = registro;
        IdContenedor = contenedor;
    }
    #endregion

    #region methods
    public static List<Sensor> GetAll()
    {
        SqlCommand command = new SqlCommand(SensorGetAll);
        return SensorMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Sensor GetById(int id)
    {
        SqlCommand command = new SqlCommand(SensorGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? SensorMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Sensor> GetByContenedor(int contenedorId)
    {
        SqlCommand command = new SqlCommand(SensorGetByContenedor);
        command.Parameters.AddWithValue("@ContenedorId", contenedorId);
        return SensorMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }
    #endregion
}