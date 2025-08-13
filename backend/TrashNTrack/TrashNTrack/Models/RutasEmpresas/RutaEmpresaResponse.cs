public class RutaEmpresaResponse
{
    public static object GetResponse(RutaEmpresa rutaEmpresa)
    {
        if (rutaEmpresa == null)
        {
            return new
            {
                status = 1,
                message = "RutaEmpresa no encontrada",
                data = (object)null
            };
        }

        return new
        {
            status = 0,
            message = "RutaEmpresa obtenida correctamente",
            data = new
            {
                idRuta = rutaEmpresa.IdRuta,
                idEmpresa = rutaEmpresa.IdEmpresa,
                orden = rutaEmpresa.Orden
            }
        };
    }
}