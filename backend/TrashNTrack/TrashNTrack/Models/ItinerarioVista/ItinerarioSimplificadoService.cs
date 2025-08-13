using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public static class ItinerarioSimplificadoService
{
    private static string ItinerarioSimplificadoGetByUsuarioAsignado = @"
        SELECT * FROM vwItinerarioSimplificado
        WHERE id_usuario_asignado = @UsuarioId";

    public static List<ItinerarioSimplificado> GetByUsuarioAsignado(int usuarioId)
    {
        SqlCommand command = new SqlCommand(ItinerarioSimplificadoGetByUsuarioAsignado);
        command.Parameters.AddWithValue("@UsuarioId", usuarioId);

        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return ItinerarioSimplificadoMapper.ToList(table);
    }
}
