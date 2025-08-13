using System;
using System.Collections.Generic;
using System.Data;

public class IncidenteMapperVista
{
    public static IncidenteVista ToObject(DataRow row)
    {
        return new IncidenteVista
        {
            IdIncidente = Convert.ToInt32(row["id_incidente"]),
            Nombre = row["nombre_incidente"].ToString(),        // alias usado en la vista
            FechaIncidente = Convert.ToDateTime(row["fecha_incidente"]),
            PhotoUrl = row["url_foto"]?.ToString() ?? string.Empty,  // alias usado en la vista
            Descripcion = row["descripcion"].ToString(),
            IdUsuario = Convert.ToInt32(row["id_usuario"])
        };
    }

    public static List<IncidenteVista> ToList(DataTable table)
    {
        List<IncidenteVista> list = new List<IncidenteVista>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}