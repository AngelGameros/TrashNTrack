using System;
using System.Collections.Generic;
using System.Data;

public class RutaMapper
{
    public static Ruta ToObject(DataRow row)
    {
        return new Ruta
        {
            IdRuta = Convert.ToInt32(row["id_ruta"]),
            NombreRuta = row["nombre_ruta"].ToString(),
            FechaCreacion = Convert.ToDateTime(row["fecha_creacion"]),
            Descripcion = row["descripcion"].ToString(),
            Estado = row["estado"].ToString(), // Nueva propiedad
            IdUsuarioAsignado = row["id_usuario_asignado"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["id_usuario_asignado"]), // Nueva propiedad, maneja NULL
            ProgresoRuta = Convert.ToInt32(row["progreso_ruta"]) // Nueva propiedad
        };
    }

    public static List<Ruta> ToList(DataTable table)
    {
        List<Ruta> list = new List<Ruta>();
        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }
        return list;
    }
}