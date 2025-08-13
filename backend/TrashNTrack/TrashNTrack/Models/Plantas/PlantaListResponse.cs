using System.Collections.Generic;
using System.Linq;

public class PlantaListResponse
{
    public static object GetResponse(List<Planta> plantas)
    {
        return new
        {
            status = 0,
            message = "Lista de plantas obtenida correctamente",
            data = plantas.Select(p => new
            {
                id = p.IdPlanta,
                nombre = p.Nombre,
                idUbicacion = p.IdUbicacion
            }).ToList()
        };
    }
}