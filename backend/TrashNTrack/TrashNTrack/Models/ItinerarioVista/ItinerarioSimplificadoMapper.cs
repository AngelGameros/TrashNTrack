using System;
using System.Collections.Generic;
using System.Data;

public class ItinerarioSimplificadoMapper
{
    public static ItinerarioSimplificado ToObject(DataRow row)
    {
        return new ItinerarioSimplificado
        {
            IdItinerario = Convert.ToInt32(row["id_itinerario"]),
            Estado = row["estado_itinerario"].ToString(),
            FechaProgramada = Convert.ToDateTime(row["fecha_programada"]),
            HoraInicioReal = row["hora_inicio_real"] != DBNull.Value ? Convert.ToDateTime(row["hora_inicio_real"]) : (DateTime?)null,
            HoraFinReal = row["hora_fin_real"] != DBNull.Value ? Convert.ToDateTime(row["hora_fin_real"]) : (DateTime?)null,
            IdAprobador = Convert.ToInt32(row["id_aprobador"]),
            IdRuta = Convert.ToInt32(row["id_ruta"]),
            NombreRuta = row["nombre_ruta"].ToString(),
            DescripcionRuta = row["descripcion_ruta"].ToString(),
            IdUsuarioAsignado = Convert.ToInt32(row["id_usuario_asignado"]),
            EmpresasJson = row["empresas"].ToString()
        };
    }

    public static List<ItinerarioSimplificado> ToList(DataTable table)
    {
        List<ItinerarioSimplificado> list = new List<ItinerarioSimplificado>();
        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }
        return list;
    }
}
