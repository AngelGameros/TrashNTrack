public class ContenedorResponse
{
    public static object GetResponse(Contenedor contenedor)
    {
        return new
        {
            status = 0,
            message = "Contenedor obtenido correctamente",
            data = new
            {
                id = contenedor.IdContenedor,
                descripcion = contenedor.Descripcion,
                fechaRegistro = contenedor.FechaRegistro,
                idEmpresa = contenedor.IdEmpresa,
                idTipoResiduo = contenedor.IdTipoResiduo,
                idTipoContenedor = contenedor.IdTipoContenedor
            }
        };
    }
}