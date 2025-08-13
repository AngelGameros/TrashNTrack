using System;
using System.Collections.Generic;
using System.Data;

public class ItinerarioMapper
{
    public static Itinerario ToObject(DataRow row)
    {
        return new Itinerario
        {
            IdItinerario = Convert.ToInt32(row["id_itinerario"]),
            Estado = row["estado"].ToString(),
            FechaProgramada = Convert.ToDateTime(row["fecha_programada"]),
            IdRuta = Convert.ToInt32(row["id_ruta"]),
            HoraInicioReal = row["hora_inicio_real"] != DBNull.Value ? Convert.ToDateTime(row["hora_inicio_real"]) : (DateTime?)null,
            HoraFinReal = row["hora_fin_real"] != DBNull.Value ? Convert.ToDateTime(row["hora_fin_real"]) : (DateTime?)null,
            IdAprobador = Convert.ToInt32(row["id_aprobador"])
        };
    }

    public static List<Itinerario> ToList(DataTable table)
    {
        List<Itinerario> list = new List<Itinerario>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}
