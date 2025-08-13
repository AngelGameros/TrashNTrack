using System;

public class ItinerarioSimplificado
{
    public int IdItinerario { get; set; }
    public string Estado { get; set; }
    public DateTime FechaProgramada { get; set; }
    public DateTime? HoraInicioReal { get; set; }
    public DateTime? HoraFinReal { get; set; }
    public int IdAprobador { get; set; }

    public int IdRuta { get; set; }
    public string NombreRuta { get; set; }
    public string DescripcionRuta { get; set; }
    public int IdUsuarioAsignado { get; set; }

    public string EmpresasJson { get; set; }
}
