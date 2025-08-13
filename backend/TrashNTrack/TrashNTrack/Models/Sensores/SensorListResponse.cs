using System.Collections.Generic;
using System.Linq;

public class SensorListResponse
{
    public static object GetResponse(List<Sensor> sensores)
    {
        return new
        {
            status = 0,
            message = "Lista de sensores obtenida correctamente",
            data = sensores.Select(s => new
            {
                id = s.IdSensor,
                tipo = s.TipoSensor,
                descripcion = s.Descripcion,
                fechaRegistro = s.DiaRegistro.ToString("yyyy-MM-dd"),
                contenedorId = s.IdContenedor
            }).ToList()
        };
    }
}