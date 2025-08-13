public class PlantaResponse
{
    public static object GetResponse(Planta planta)
    {
        return new
        {
            status = 0,
            message = "Planta obtenida correctamente",
            data = new
            {
                id = planta.IdPlanta,
                nombre = planta.Nombre,
                idUbicacion = planta.IdUbicacion
            }
        };
    }
}