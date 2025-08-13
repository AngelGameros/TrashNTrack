using System.Collections.Generic;

public class UbicacionListResponse : JsonResponse
{
    public List<Ubicacion> Ubicaciones { get; set; }

    public List<Ubicacion> GetUbicaciones()
    {
        return this.Ubicaciones;
    }

    public static UbicacionListResponse GetResponse(List<Ubicacion> listaUbicaciones)
    {
        UbicacionListResponse r = new UbicacionListResponse();
        r.Status = 0;
        r.Ubicaciones = listaUbicaciones;
        return r;
    }
}