using System.Collections.Generic;

public class CamionesListResponse : JsonResponse
{
    public List<Camiones> Camiones { get; set; }

    // Este método ya no es estático para que pueda acceder a la propiedad de instancia
    public List<Camiones> GetCamiones()
    {
        return this.Camiones;
    }

    // Corregimos la duplicidad en el nombre del parámetro
    public static CamionesListResponse GetResponse(List<Camiones> listaCamiones)
    {
        CamionesListResponse r = new CamionesListResponse();
        r.Status = 0;
        r.Camiones = listaCamiones; // Asignamos directamente la lista
        return r;
    }
}
