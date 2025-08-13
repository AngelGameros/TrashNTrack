using System;
using System.Collections.Generic;
using System.Data;

public class AlertaMapper
{
    public static Alerta ToObject(DataRow row)
    {
        return new Alerta
        {
            IdAlerta = Convert.ToInt32(row["id_alerta"]),
            TipoAlerta = row["tipo_alerta"].ToString(),
            Descripcion = row["descripcion"].ToString(),
            FechaAlerta = Convert.ToDateTime(row["fecha_alerta"]),
            IdSensor = Convert.ToInt32(row["id_sensor"])
        };
    }

    public static List<Alerta> ToList(DataTable table)
    {
        List<Alerta> list = new List<Alerta>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}