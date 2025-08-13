using System.Collections.Generic;

public class RutaDetalladaResponse
{
    public int status { get; set; }
    public string message { get; set; }
    public string type { get; set; }
    public List<RutaDetalladaViewModel> data { get; set; }

    public static RutaDetalladaResponse GetResponse(List<RutaDetalladaViewModel> rutas)
    {
        return new RutaDetalladaResponse
        {
            status = 0,
            message = "Consulta exitosa",
            type = "success",
            data = rutas
        };
    }
}
