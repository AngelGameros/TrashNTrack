public class EmpresaResponse
{
    public static object GetResponse(Empresa empresa)
    {
        return new
        {
            status = 0,
            message = "Empresa obtenida correctamente",
            data = new
            {
                id = empresa.IdEmpresa,
                nombre = empresa.Nombre,
                fechaRegistro = empresa.FechaRegistro.HasValue ? empresa.FechaRegistro.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                rfc = empresa.RFC,
                idUbicacion = empresa.IdUbicacion
            }
        };
    }
}