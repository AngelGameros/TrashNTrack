using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Ubicacion
{
    #region statements
    private static string UbicacionGetAll = @"
    SELECT id_ubicacion, direccion, latitud, longitud
    FROM UBICACION ORDER BY id_ubicacion";

    private static string UbicacionGetOne = @"
    SELECT id_ubicacion, direccion, latitud, longitud
    FROM UBICACION WHERE id_ubicacion = @ID";

    private static string UbicacionInsert = @"
    INSERT INTO UBICACION (direccion, latitud, longitud)
    VALUES (@direccion, @latitud, @longitud);
    SELECT SCOPE_IDENTITY();";

    private static string UbicacionUpdate = @"
    UPDATE UBICACION
    SET direccion = @direccion, latitud = @latitud, longitud = @longitud
    WHERE id_ubicacion = @idUbicacion;";
    #endregion

    #region attributes
    private int _idUbicacion;
    private string _direccion;
    private double _latitud;
    private double _longitud;
    #endregion

    #region properties
    public int IdUbicacion { get => _idUbicacion; set => _idUbicacion = value; }
    public string Direccion { get => _direccion; set => _direccion = value; }
    public double Latitud { get => _latitud; set => _latitud = value; }
    public double Longitud { get => _longitud; set => _longitud = value; }
    #endregion

    #region constructors
    public Ubicacion()
    {
        _idUbicacion = 0;
        _direccion = "";
        _latitud = 0.0;
        _longitud = 0.0;
    }

    public Ubicacion(int idUbicacion, string direccion, double latitud, double longitud)
    {
        _idUbicacion = idUbicacion;
        _direccion = direccion;
        _latitud = latitud;
        _longitud = longitud;
    }
    #endregion

    #region classMethods
    public static List<Ubicacion> Get()
    {
        SqlCommand command = new SqlCommand(UbicacionGetAll);
        return UbicacionMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Ubicacion Get(int id)
    {
        SqlCommand command = new SqlCommand(UbicacionGetOne);
        command.Parameters.AddWithValue("@ID", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        if (table.Rows.Count > 0)
            return UbicacionMapper.ToObject(table.Rows[0]);
        else
            throw new UbicacionNotFoundException(id);
    }

    public int Insert()
    {
        SqlCommand command = new SqlCommand(UbicacionInsert);
        command.Parameters.AddWithValue("@direccion", _direccion);
        command.Parameters.AddWithValue("@latitud", _latitud);
        command.Parameters.AddWithValue("@longitud", _longitud);

        _idUbicacion = Convert.ToInt32(SqlServerConnection.ExecuteScalar(command));
        return _idUbicacion;
    }

    public void Update()
    {
        SqlCommand command = new SqlCommand(UbicacionUpdate);
        command.Parameters.AddWithValue("@idUbicacion", _idUbicacion);
        command.Parameters.AddWithValue("@direccion", _direccion);
        command.Parameters.AddWithValue("@latitud", _latitud);
        command.Parameters.AddWithValue("@longitud", _longitud);

        SqlServerConnection.ExecuteQuery(command);
    }
    #endregion
}
