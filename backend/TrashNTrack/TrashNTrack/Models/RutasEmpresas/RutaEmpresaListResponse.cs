using System.Collections.Generic;
using System.Linq;

public class RutaEmpresaListResponse
{
    public static object GetResponse(List<RutaEmpresa> rutasEmpresas)
    {
        return new
        {
            status = 0,
            message = "Lista de rutas_empresas obtenida correctamente",
            data = rutasEmpresas.Select(re => new
            {
                idRuta = re.IdRuta,
                idEmpresa = re.IdEmpresa,
                orden = re.Orden
            }).ToList()
        };
    }
}