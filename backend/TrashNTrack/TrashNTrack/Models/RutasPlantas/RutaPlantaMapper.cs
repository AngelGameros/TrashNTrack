using System;
using System.Collections.Generic;
using System.Data;

public class RutaPlantaMapper
{
    public static RutaPlanta ToObject(DataRow row)
    {
        return new RutaPlanta
        {
            IdRuta = row["id_ruta"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["id_ruta"]),
            IdPlanta = row["id_planta"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["id_planta"])
        };
    }

    public static List<RutaPlanta> ToList(DataTable table)
    {
        List<RutaPlanta> list = new List<RutaPlanta>();
        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }
        return list;
    }
}