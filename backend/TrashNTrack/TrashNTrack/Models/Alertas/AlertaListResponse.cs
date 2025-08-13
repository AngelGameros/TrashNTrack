using System.Collections.Generic;
using System.Linq;

public class AlertaListResponse
{
    public static object GetResponse(List<Alerta> alertas)
    {
        return new
        {
            status = 0,
            message = "Lista de alertas obtenida correctamente",
            data = alertas.Select(a => new
            {
                id = a.IdAlerta,
                tipo = a.TipoAlerta,
                descripcion = a.Descripcion,
                fechaAlerta = a.FechaAlerta.ToString("yyyy-MM-dd HH:mm:ss"),
                idSensor = a.IdSensor
            }).ToList()
        };
    }
}