using System;
using System.Collections.Generic;
using System.Linq;

public class IncidenteResponse
{
    public static object GetResponse(Incidente incidente)
    {
        DateTime? fechaIncidenteUtc = null;
        if (incidente.FechaIncidente.HasValue)
        {
            fechaIncidenteUtc = incidente.FechaIncidente.Value;
            if (fechaIncidenteUtc.Value.Kind == DateTimeKind.Unspecified)
            {
                fechaIncidenteUtc = DateTime.SpecifyKind(fechaIncidenteUtc.Value, DateTimeKind.Utc);
            }
            else if (fechaIncidenteUtc.Value.Kind == DateTimeKind.Local)
            {
                fechaIncidenteUtc = fechaIncidenteUtc.Value.ToUniversalTime();
            }
        }

        DateTime? fechaResolucionUtc = null;
        if (incidente.FechaResolucion.HasValue)
        {
            fechaResolucionUtc = incidente.FechaResolucion.Value;
            if (fechaResolucionUtc.Value.Kind == DateTimeKind.Unspecified)
            {
                fechaResolucionUtc = DateTime.SpecifyKind(fechaResolucionUtc.Value, DateTimeKind.Utc);
            }
            else if (fechaResolucionUtc.Value.Kind == DateTimeKind.Local)
            {
                fechaResolucionUtc = fechaResolucionUtc.Value.ToUniversalTime();
            }
        }

        return new
        {
            status = 0,
            message = "Incidente obtenido correctamente",
            data = new
            {
                id = incidente.IdIncidente,
                nombre = incidente.Nombre,
                fechaIncidente = fechaIncidenteUtc?.ToString("o"), // <--- CAMBIO: Ahora es nullable
                photoUrl = incidente.PhotoUrl,
                descripcion = incidente.Descripcion,
                idUsuario = incidente.IdUsuario,
                estadoIncidente = incidente.EstadoIncidente,
                fechaResolucion = fechaResolucionUtc?.ToString("o"),
                resueltoPor = incidente.ResueltoPor
            }
        };
    }

    public static object GetCreateResponse(int id)
    {
        return new
        {
            status = 0,
            message = "Incidente creado correctamente",
            data = new { id }
        };
    }
}