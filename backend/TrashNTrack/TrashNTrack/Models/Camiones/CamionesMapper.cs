using System;
using System.Collections.Generic;
using System.Data;

public class CamionesMapper
{
    public static Camiones ToObject(DataRow row)
    {
        int idCamion = (int)row["id_camion"];
        string placa = row["placa"].ToString();
        string marca = row["marca"].ToString();
        string modelo = row["modelo"].ToString();
        int anio = row["anio"] != DBNull.Value ? (int)row["anio"] : 0;
        double capacidadCarga = row["capacidad_carga"] != DBNull.Value ? Convert.ToDouble(row["capacidad_carga"]) : 0;
        int idUsuario = row["id_usuario"] != DBNull.Value ? (int)row["id_usuario"] : 0;
        string estado = row["estado"] != DBNull.Value ? row["estado"].ToString() : "activo"; // Mapear el estado

        return new Camiones(idCamion, placa, marca, anio, capacidadCarga, modelo, idUsuario, estado);
    }

    public static List<Camiones> ToList(DataTable table)
    {
        List<Camiones> list = new List<Camiones>();
        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }
        return list;
    }
}