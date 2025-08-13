public class RutaPlantaResponse
{
    public static object GetResponse(RutaPlanta rutaPlanta)
    {
        if (rutaPlanta == null)
        {
            return new
            {
                status = 1,
                message = "RutaPlanta no encontrada",
                data = (object)null
            };
        }

        return new
        {
            status = 0,
            message = "RutaPlanta obtenida correctamente",
            data = new
            {
                idRuta = rutaPlanta.IdRuta,
                idPlanta = rutaPlanta.IdPlanta
            }
        };
    }
}