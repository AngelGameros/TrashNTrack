public class ItinerarioResponse
{
    public static object GetResponse(Itinerario itinerario)
    {
        return new
        {
            status = 0,
            message = "Itinerario obtenido correctamente",
            data = new
            {
                id = itinerario.IdItinerario,
                estado = itinerario.Estado,
                fechaProgramada = itinerario.FechaProgramada.ToString("yyyy-MM-dd"),
                idRuta = itinerario.IdRuta,
                horaInicioReal = itinerario.HoraInicioReal?.ToString("HH:mm") ?? null,
                horaFinReal = itinerario.HoraFinReal?.ToString("HH:mm") ?? null,
                idAprobador = itinerario.IdAprobador
            }
        };
    }

    public static object GetCreateResponse(int id)
    {
        return new
        {
            status = 0,
            message = "Itinerario creado correctamente",
            data = new { id }
        };
    }

    public static object GetUpdateEstadoResponse(bool success)
    {
        return new
        {
            status = success ? 0 : 1,
            message = success ? "Estado actualizado correctamente" : "No se pudo actualizar el estado"
        };
    }
}