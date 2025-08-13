    public class CamionesResponse
    {
    public int Status { get; private set; }
    public Camiones Camiones { get; set; }

        public static CamionesResponse GetResponse(Camiones camiones)
        {
            CamionesResponse r = new CamionesResponse();
            r.Status = 0;
            r.Camiones = camiones;
            return r;
        }
    }
