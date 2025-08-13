public class CamionAsignadoResponse : JsonResponse
{
    public CamionAsignado Camion { get; set; }

    public static CamionAsignadoResponse GetResponse(CamionAsignado camion)
    {
        return new CamionAsignadoResponse
        {
            Status = 0,
            Camion = camion
        };
    }
}
