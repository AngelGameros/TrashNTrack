using System.Collections.Generic;
using System.Linq;

public class ContenedorListResponse
{
    public static object GetResponse(List<Contenedor> contenedores)
    {
        return new
        {
            status = 0,
            message = "Lista de contenedores obtenida correctamente",
            data = contenedores.Select(c => new
            {
                id = c.IdContenedor,
                descripcion = c.Descripcion,
                fechaRegistro = c.FechaRegistro,
                idEmpresa = c.IdEmpresa,
                idTipoResiduo = c.IdTipoResiduo,
                idTipoContenedor = c.IdTipoContenedor
            }).ToList()
        };
    }
}