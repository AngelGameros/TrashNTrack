using System.Collections.Generic;
using System.Linq;
using System;

public class IncidenteListResponse
{
    public static object GetResponse(List<Incidente> incidentes)
    {
        return new
        {
            status = 0,
            message = "Lista de incidentes obtenida correctamente",
            data = incidentes.Select(i =>
            {
                DateTime? fechaIncidenteUtc = null; // <--- CAMBIO: Ahora es nullable
                if (i.FechaIncidente.HasValue)
                {
                    fechaIncidenteUtc = i.FechaIncidente.Value;
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
                if (i.FechaResolucion.HasValue)
                {
                    fechaResolucionUtc = i.FechaResolucion.Value;
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
                    id = i.IdIncidente,
                    nombre = i.Nombre,
                    fechaIncidente = fechaIncidenteUtc?.ToString("o"), // <--- CAMBIO: Ahora es nullable
                    photoUrl = i.PhotoUrl,
                    descripcion = i.Descripcion,
                    idUsuario = i.IdUsuario,
                    estadoIncidente = i.EstadoIncidente,
                    fechaResolucion = fechaResolucionUtc?.ToString("o"),
                    resueltoPor = i.ResueltoPor
                };
            }).ToList()
        };
    }
}