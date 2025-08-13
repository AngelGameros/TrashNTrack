using System;

public class IncidenteNotFoundException : Exception
{
    public IncidenteNotFoundException() { }

    public IncidenteNotFoundException(int id)
        : base($"Incidente con ID {id} no encontrado.") { }

    public IncidenteNotFoundException(string message)
        : base(message) { }

    public IncidenteNotFoundException(string message, Exception inner)
        : base(message, inner) { }
}
