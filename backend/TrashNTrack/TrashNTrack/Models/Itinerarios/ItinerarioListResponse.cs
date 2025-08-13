using System.Collections.Generic;
using System.Linq;

public class ItinerarioListResponse
{
    public static object GetResponse(List<Itinerario> itinerarios)
    {
        return new
        {
            status = 0,
            message = "Lista de itinerarios obtenida correctamente",
            data = itinerarios.Select(i => new
            {
                id = i.IdItinerario,
                estado = i.Estado,
                fechaProgramada = i.FechaProgramada.ToString("yyyy-MM-dd"),
                idRuta = i.IdRuta,
                horaInicioReal = i.HoraInicioReal?.ToString("HH:mm") ?? null,
                horaFinReal = i.HoraFinReal?.ToString("HH:mm") ?? null,
                idAprobador = i.IdAprobador
            }).ToList()
        };
    }
}