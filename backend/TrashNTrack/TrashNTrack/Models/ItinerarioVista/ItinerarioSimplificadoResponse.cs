using System.Collections.Generic;
using System.Linq;

public class ItinerarioSimplificadoResponse
{
    public static object GetListResponse(List<ItinerarioSimplificado> itinerarios)
    {
        return new
        {
            status = 0,
            message = "Itinerarios simplificados obtenidos correctamente",
            data = itinerarios.Select(i => new
            {
                id = i.IdItinerario,
                estado = i.Estado,
                fechaProgramada = i.FechaProgramada.ToString("yyyy-MM-ddTHH:mm:ss"),
                horaInicioReal = i.HoraInicioReal?.ToString("HH:mm") ?? null,
                horaFinReal = i.HoraFinReal?.ToString("HH:mm") ?? null,
                idAprobador = i.IdAprobador,
                idRuta = i.IdRuta,
                nombreRuta = i.NombreRuta,
                descripcionRuta = i.DescripcionRuta,
                idUsuarioAsignado = i.IdUsuarioAsignado,
                empresas = i.EmpresasJson
            }).ToList()
        };
    }
}
