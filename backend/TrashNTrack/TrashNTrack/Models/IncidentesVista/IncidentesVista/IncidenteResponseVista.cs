using System;

public class IncidenteResponseVista
{
    public static object GetResponse(IncidenteVista incidente)
    {
        // Asegurarse de que la fecha se convierta a UTC antes de formatearla como ISO con 'Z'
        // Esto es crucial para que el frontend la interprete correctamente como UTC
        DateTime fechaUtc = incidente.FechaIncidente;
        if (incidente.FechaIncidente.Kind == DateTimeKind.Unspecified)
        {
            // Si el Kind es Unspecified (común cuando se lee de la DB sin especificar),
            // asumimos que ya es UTC porque así lo guardamos.
            // Para asegurar, podemos hacerla Utc explícitamente si sabemos que fue guardada como tal.
            fechaUtc = DateTime.SpecifyKind(incidente.FechaIncidente, DateTimeKind.Utc);
        }
        else if (incidente.FechaIncidente.Kind == DateTimeKind.Local)
        {
            // Si por alguna razón es Local, convertirla a UTC.
            fechaUtc = incidente.FechaIncidente.ToUniversalTime();
        }

        return new
        {
            status = 0,
            message = "Incidente obtenido correctamente",
            data = new
            {
                id = incidente.IdIncidente,
                nombre = incidente.Nombre,
                // Usar "o" (round-trip format) que incluye el 'Z' si DateTimeKind es Utc
                fechaIncidente = fechaUtc.ToString("o"),
                photoUrl = incidente.PhotoUrl,
                descripcion = incidente.Descripcion,
                idUsuario = incidente.IdUsuario
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