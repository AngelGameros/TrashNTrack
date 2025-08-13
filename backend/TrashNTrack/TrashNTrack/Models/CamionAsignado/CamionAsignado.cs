using System;
using System.Data;
using Microsoft.Data.SqlClient;


public class CamionAsignado
{
    private int _id_camion;
    private string _placa;
    private string _marca;
    private string _modelo;
    private int _anio;
    private decimal _capacidad_carga;
    private string _estado;
    private int _id_usuario;
    private int _total_viajes;
    private DateTime? _ultima_fecha_viaje;

    public int IdCamion => _id_camion;
    public string Placa => _placa;
    public string Marca => _marca;
    public string Modelo => _modelo;
    public int Anio => _anio;
    public decimal CapacidadCarga => _capacidad_carga;
    public string Estado => _estado;
    public int IdUsuario => _id_usuario;
    public int TotalViajes => _total_viajes;
    public DateTime? UltimaFechaViaje => _ultima_fecha_viaje;

    public CamionAsignado(int idCamion, string placa, string marca, string modelo, int anio, decimal capacidadCarga, string estado, int idUsuario, int totalViajes, DateTime? ultimaFechaViaje)
    {
        _id_camion = idCamion;
        _placa = placa;
        _marca = marca;
        _modelo = modelo;
        _anio = anio;
        _capacidad_carga = capacidadCarga;
        _estado = estado;
        _id_usuario = idUsuario;
        _total_viajes = totalViajes;
        _ultima_fecha_viaje = ultimaFechaViaje;
    }

    public static CamionAsignado GetByUsuario(int idUsuario)
    {
        string query = "SELECT * FROM detallesCamionUsuario WHERE id_usuario = @ID";
        SqlCommand command = new SqlCommand(query);
        command.Parameters.AddWithValue("@ID", idUsuario);
        DataTable table = SqlServerConnection.ExecuteQuery(command);

        if (table.Rows.Count > 0)
            return CamionAsignadoMapper.ToObject(table.Rows[0]);
        else
            throw new Exception("No se encontró camión asignado para este usuario.");
    }
}
