using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class UsuarioResponse : JsonResponse
{
    public Usuario Usuario { get; set; }

    public static UsuarioResponse GetResponse(Usuario a)
    {
        UsuarioResponse r = new UsuarioResponse();
        r.Status = 0;
        r.Usuario = a;
        return r;
    }
}
