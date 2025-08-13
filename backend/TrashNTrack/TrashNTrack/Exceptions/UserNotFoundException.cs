using System;

public class UsuarioNotFoundException : Exception
{
    public UsuarioNotFoundException() { }

    public UsuarioNotFoundException(int id)
        : base($"Usuario con ID {id} no encontrado.") { }

    public UsuarioNotFoundException(string message)
        : base(message) { }

    public UsuarioNotFoundException(string message, Exception inner)
        : base(message, inner) { }
}
