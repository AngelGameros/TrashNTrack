using System;
using System.Collections.Generic;
using System.Data;

public class UbicacionMapper
{
    public static Ubicacion ToObject(DataRow row)
    {
        int idUbicacion = (int)row["id_ubicacion"];
        string direccion = row["direccion"].ToString();
        double latitud = Convert.ToDouble(row["latitud"]);
        double longitud = Convert.ToDouble(row["longitud"]);

        return new Ubicacion(idUbicacion, direccion, latitud, longitud);
    }

    public static List<Ubicacion> ToList(DataTable table)
    {
        List<Ubicacion> list = new List<Ubicacion>();
        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }
        return list;
    }
}