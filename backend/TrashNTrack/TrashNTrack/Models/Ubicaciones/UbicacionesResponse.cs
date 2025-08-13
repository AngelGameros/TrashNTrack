public class UbicacionResponse
{
    public int Status { get; private set; }
    public Ubicacion Ubicacion { get; set; }

    public static UbicacionResponse GetResponse(Ubicacion ubicacion)
    {
        UbicacionResponse r = new UbicacionResponse();
        r.Status = 0;
        r.Ubicacion = ubicacion;
        return r;
    }
}