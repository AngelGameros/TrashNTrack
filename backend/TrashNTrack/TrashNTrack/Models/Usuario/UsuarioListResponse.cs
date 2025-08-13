using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class UsuarioListResponse : JsonResponse
{
    public List<Usuario> Usuarios { get; set; }

    public static UsuarioListResponse GetResponse()
    {
        UsuarioListResponse r = new UsuarioListResponse();
        r.Status = 0;
        r.Usuarios = Usuario.Get();
        return r;
    }
}