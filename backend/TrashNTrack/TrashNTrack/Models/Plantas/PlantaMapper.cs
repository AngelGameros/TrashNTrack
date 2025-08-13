using System;
using System.Collections.Generic;
using System.Data;

public class PlantaMapper
{
    public static Planta ToObject(DataRow row)
    {
        return new Planta
        {
            IdPlanta = Convert.ToInt32(row["id_planta"]),
            Nombre = row["nombre"].ToString(),
            IdUbicacion = Convert.ToInt32(row["id_ubicacion"])
        };
    }

    public static List<Planta> ToList(DataTable table)
    {
        List<Planta> list = new List<Planta>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}