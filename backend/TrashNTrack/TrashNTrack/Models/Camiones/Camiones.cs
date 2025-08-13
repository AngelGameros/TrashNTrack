using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Camiones
{
    #region statements
    private static string CamionGetAll = @"
    SELECT id_camion, placa, marca, anio, capacidad_carga, modelo, id_usuario, estado
    FROM CAMIONES ORDER BY id_camion"; // Added 'estado'

    private static string CamionGetOne = @"
    SELECT id_camion, placa, marca, anio, capacidad_carga, modelo, id_usuario, estado
    FROM CAMIONES WHERE id_camion = @ID"; // Added 'estado'

    private static string CamionInsert = @"
    INSERT INTO CAMIONES (placa, marca, anio, capacidad_carga, modelo, id_usuario, estado)
    VALUES (@placa, @marca, @anio, @capacidadCarga, @modelo, @idUsuario, @estado);
    SELECT SCOPE_IDENTITY();"; // SQL for inserting a new truck and returning its ID

    private static string CamionUpdate = @"
    UPDATE CAMIONES
    SET placa = @placa, marca = @marca, anio = @anio, capacidad_carga = @capacidadCarga,
        modelo = @modelo, id_usuario = @idUsuario, estado = @estado
    WHERE id_camion = @idCamion;"; // SQL for updating an existing truck

    #endregion

    #region attributes
    private int _idCamion;
    private string _placa;
    private string _marca;
    private int _anio;
    private double _capacidadCarga;
    private string _modelo;
    private int _idUsuario;
    private string _estado; // Added _estado attribute
    #endregion

    #region properties
    public int IdCamion { get => _idCamion; set => _idCamion = value; }
    public string Placa { get => _placa; set => _placa = value; }
    public string Marca { get => _marca; set => _marca = value; }
    public int Anio { get => _anio; set => _anio = value; }
    public double CapacidadCarga { get => _capacidadCarga; set => _capacidadCarga = value; }
    public string Modelo { get => _modelo; set => _modelo = value; }
    public int IdUsuario { get => _idUsuario; set => _idUsuario = value; }
    public string Estado { get => _estado; set => _estado = value; } // Added Estado property
    #endregion

    #region constructors
    public Camiones()
    {
        _idCamion = 0;
        _placa = "";
        _marca = "";
        _anio = 0;
        _capacidadCarga = 0;
        _modelo = "";
        _idUsuario = 0;
        _estado = "activo"; // Default state
    }

    public Camiones(int idCamion, string placa, string marca, int anio, double capacidadCarga, string modelo, int idUsuario, string estado)
    {
        _idCamion = idCamion;
        _placa = placa;
        _marca = marca;
        _anio = anio;
        _capacidadCarga = capacidadCarga;
        _modelo = modelo;
        _idUsuario = idUsuario;
        _estado = estado; // Initialize estado
    }
    #endregion

    #region classMethods
    public static List<Camiones> Get()
    {
        SqlCommand command = new SqlCommand(CamionGetAll);
        return CamionesMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Camiones Get(int id)
    {
        SqlCommand command = new SqlCommand(CamionGetOne);
        command.Parameters.AddWithValue("@ID", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        if (table.Rows.Count > 0)
            return CamionesMapper.ToObject(table.Rows[0]);
        else
            throw new UsuarioNotFoundException(id); // Assuming UsuarioNotFoundException is a custom exception
    }

    public int Insert()
    {
        SqlCommand command = new SqlCommand(CamionInsert);
        command.Parameters.AddWithValue("@placa", _placa);
        command.Parameters.AddWithValue("@marca", _marca);
        command.Parameters.AddWithValue("@anio", _anio);
        command.Parameters.AddWithValue("@capacidadCarga", _capacidadCarga);
        command.Parameters.AddWithValue("@modelo", _modelo);
        command.Parameters.AddWithValue("@idUsuario", _idUsuario);
        command.Parameters.AddWithValue("@estado", _estado);

        // ExecuteScalar is used to retrieve the single value result from the query (SCOPE_IDENTITY)
        _idCamion = Convert.ToInt32(SqlServerConnection.ExecuteScalar(command));
        return _idCamion;
    }

    public void Update()
    {
        SqlCommand command = new SqlCommand(CamionUpdate);
        command.Parameters.AddWithValue("@idCamion", _idCamion);
        command.Parameters.AddWithValue("@placa", _placa);
        command.Parameters.AddWithValue("@marca", _marca);
        command.Parameters.AddWithValue("@anio", _anio);
        command.Parameters.AddWithValue("@capacidadCarga", _capacidadCarga);
        command.Parameters.AddWithValue("@modelo", _modelo);
        command.Parameters.AddWithValue("@idUsuario", _idUsuario);
        command.Parameters.AddWithValue("@estado", _estado);

        SqlServerConnection.ExecuteQuery(command);
    }
    #endregion
}