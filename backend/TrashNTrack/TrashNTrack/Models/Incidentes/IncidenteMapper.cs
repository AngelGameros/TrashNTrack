using System;
using System.Collections.Generic;
using System.Data;

public class IncidenteMapper
{
    public static Incidente ToObject(DataRow row)
    {
        return new Incidente
        {
            IdIncidente = Convert.ToInt32(row["id_incidente"]),
            Nombre = row["nombre"].ToString(),
            // <--- CAMBIOS: Manejar posibles valores nulos para FechaIncidente, PhotoUrl y EstadoIncidente
            FechaIncidente = row["fecha_incidente"] != DBNull.Value ? Convert.ToDateTime(row["fecha_incidente"]) : (DateTime?)null,
            PhotoUrl = row["url_foto"] != DBNull.Value ? row["url_foto"]?.ToString() ?? string.Empty : (string ? )null, // Asignar null si DBNull
            Descripcion = row["descripcion"].ToString(),
            IdUsuario = Convert.ToInt32(row["id_usuario"]),
            EstadoIncidente = row["estado_incidente"] != DBNull.Value ? row["estado_incidente"].ToString() : (string?)null, // Asignar null si DBNull
            FechaResolucion = row["fecha_resolucion"] != DBNull.Value ? Convert.ToDateTime(row["fecha_resolucion"]) : (DateTime?)null,
            ResueltoPor = row["resuelto_por"] != DBNull.Value ? Convert.ToInt32(row["resuelto_por"]) : (int?)null
        };
    }

    public static List<Incidente> ToList(DataTable table)
    {
        List<Incidente> list = new List<Incidente>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}