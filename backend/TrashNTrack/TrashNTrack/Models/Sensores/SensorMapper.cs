using System;
using System.Collections.Generic;
using System.Data;

public class SensorMapper
{
    public static Sensor ToObject(DataRow row)
    {
        Sensor sensor = new Sensor();

        sensor.IdSensor = Convert.ToInt32(row["id_sensor"]);
        sensor.TipoSensor = row["tipo_sensor"].ToString();
        sensor.Descripcion = row["descripcion"].ToString();
        sensor.DiaRegistro = Convert.ToDateTime(row["dia_registro"]);
        sensor.IdContenedor = Convert.ToInt32(row["id_contenedor"]);

        return sensor;
    }

    public static List<Sensor> ToList(DataTable table)
    {
        List<Sensor> list = new List<Sensor>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}