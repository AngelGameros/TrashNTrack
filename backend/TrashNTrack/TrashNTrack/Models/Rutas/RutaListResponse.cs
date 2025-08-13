using System.Collections.Generic;
using System.Linq;

public class RutaListResponse
{
    public static object GetResponse(List<Ruta> rutas)
    {
        return new
        {
            status = 0,
            message = "Lista de rutas obtenida correctamente",
            data = rutas.Select(r => new
            {
                id = r.IdRuta,
                nombre = r.NombreRuta,
                fechaCreacion = r.FechaCreacion.ToString("yyyy-MM-dd"),
                descripcion = r.Descripcion,
                estado = r.Estado, // Nueva propiedad
                idUsuarioAsignado = r.IdUsuarioAsignado, // Nueva propiedad
                progresoRuta = r.ProgresoRuta // Nueva propiedad
            }).ToList()
        };
    }
}