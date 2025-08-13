using System;

public class UbicacionNotFoundException : Exception
{
    public UbicacionNotFoundException() { }
        
    public UbicacionNotFoundException(int id)
        : base($"Ubicacion con ID {id} no encontrado.") { }

    public UbicacionNotFoundException(string message)
        : base(message) { }

    public UbicacionNotFoundException(string message, Exception inner)
        : base(message, inner) { }
}
