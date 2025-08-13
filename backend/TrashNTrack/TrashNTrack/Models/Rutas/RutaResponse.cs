using System;

public class RutaResponse
{
    public static object GetResponse(Ruta ruta)
    {
        if (ruta == null)
        {
            return new
            {
                status = 1,
                message = "Ruta no encontrada",
                data = (object)null
            };
        }

        return new
        {
            status = 0,
            message = "Ruta obtenida correctamente",
            data = new
            {
                id = ruta.IdRuta,
                nombre = ruta.NombreRuta,
                fechaCreacion = ruta.FechaCreacion.ToString("yyyy-MM-dd"),
                descripcion = ruta.Descripcion,
                estado = ruta.Estado, // Nueva propiedad
                idUsuarioAsignado = ruta.IdUsuarioAsignado, // Nueva propiedad
                progresoRuta = ruta.ProgresoRuta // Nueva propiedad
            }
        };
    }
}