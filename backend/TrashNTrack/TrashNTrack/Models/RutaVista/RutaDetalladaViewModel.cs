using System;
using System.Collections.Generic;

public class RutaDetalladaViewModel
{
    // Hacemos que todos los tipos de valor sean anulables
    public int? id_ruta { get; set; }
    public string? nombre_ruta { get; set; } // string ya es anulable, pero se usa '?' para consistencia en el nuevo C#
    public DateTime? fecha_creacion { get; set; }
    public string? descripcion_ruta { get; set; }
    public string? estado_ruta { get; set; }
    public int? progreso_ruta { get; set; }
    public int? id_usuario_asignado { get; set; }
    public int? id_planta { get; set; }
    public string? nombre_planta { get; set; }
    public string? direccion_planta { get; set; }
    public double? latitud_planta { get; set; }
    public double? longitud_planta { get; set; }

    public string? empresas_json { get; set; }
    public string? coordenadas_inicio_json { get; set; }
    public string? coordenadas_ruta_json { get; set; }
}