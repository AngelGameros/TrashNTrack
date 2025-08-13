using System.Collections.Generic;
using System.Linq;

public class EmpresaListResponse
{
    public static object GetResponse(List<Empresa> empresas)
    {
        return new
        {
            status = 0,
            message = "Lista de empresas obtenida correctamente",
            data = empresas.Select(e => new
            {
                id = e.IdEmpresa,
                nombre = e.Nombre,
                fechaRegistro = e.FechaRegistro.HasValue ? e.FechaRegistro.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                rfc = e.RFC,
                idUbicacion = e.IdUbicacion
            }).ToList()
        };
    }
}