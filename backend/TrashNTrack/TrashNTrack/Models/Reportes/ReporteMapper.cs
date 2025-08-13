using System;
using System.Collections.Generic;
using System.Data;

public class ReporteMapper
{
    public static Reporte ToObject(DataRow row)
    {
        return new Reporte
        {
            IdReporte = Convert.ToInt32(row["id_reporte"]),
            Nombre = row["nombre"].ToString(),
            FechaReporte = Convert.ToDateTime(row["fecha_reporte"]),
            Descripcion = row["descripcion"].ToString(),
            IdUsuario = Convert.ToInt32(row["id_usuario"]),
            Estado = row["estado"].ToString(),
            Id_contenedor = Convert.ToInt32(row["id_contenedor"]),
            Collected_amount = Convert.ToInt32(row["collected_amount"]),
            Container_status = row["container_status"].ToString()

        };
    }

    public static List<Reporte> ToList(DataTable table)
    {
        List<Reporte> list = new List<Reporte>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}