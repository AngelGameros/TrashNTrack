using System;
using System.ComponentModel.DataAnnotations;

public class AsignarRutaRequest
{
    [Required] // Opcional: para validación de modelo
    public int IdRuta { get; set; }

    [Required]
    public int IdRecolector { get; set; }

    [Required]
    public int IdAprobador { get; set; }

    [Required]
    public DateTime FechaProgramada { get; set; }
}