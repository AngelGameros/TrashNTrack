using System;
using System.Data;
using System.Data.SqlClient;

public class CamionAsignadoMapper
{
    public static CamionAsignado ToObject(DataRow row)
    {
        try
        {
            int id_camion = Convert.ToInt32(row["id_camion"]);
            string placa = Convert.ToString(row["placa"]);
            string marca = Convert.ToString(row["marca"]);
            string modelo = Convert.ToString(row["modelo"]);
            int anio = Convert.ToInt32(row["anio"]);
            decimal capacidad_carga = Convert.ToDecimal(row["capacidad_carga"]);
            string estado = Convert.ToString(row["estado"]);
            int id_usuario = Convert.ToInt32(row["id_usuario"]);
            int total_viajes = Convert.ToInt32(row["total_viajes"]);
            DateTime? ultima_fecha_viaje = row.IsNull("ultima_fecha_viaje") ? (DateTime?)null : Convert.ToDateTime(row["ultima_fecha_viaje"]);

            return new CamionAsignado(id_camion, placa, marca, modelo, anio, capacidad_carga, estado, id_usuario, total_viajes, ultima_fecha_viaje);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error mapeando CamionAsignado: {ex.Message}");
            throw;
        }
    }
}
