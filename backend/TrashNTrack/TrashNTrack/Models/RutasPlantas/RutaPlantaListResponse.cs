using System.Collections.Generic;
using System.Linq;

public class RutaPlantaListResponse
{
    public static object GetResponse(List<RutaPlanta> rutasPlantas)
    {
        return new
        {
            status = 0,
            message = "Lista de rutas_plantas obtenida correctamente",
            data = rutasPlantas.Select(rp => new
            {
                idRuta = rp.IdRuta,
                idPlanta = rp.IdPlanta
            }).ToList()
        };
    }
}