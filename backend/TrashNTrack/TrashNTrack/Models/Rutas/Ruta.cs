using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Ruta
{
    #region SQL Statements
    private static string RutaGetAll = @"
        SELECT id_ruta, nombre_ruta, fecha_creacion, descripcion, estado, id_usuario_asignado, progreso_ruta
        FROM RUTAS";

    private static string RutaGetById = @"
        SELECT id_ruta, nombre_ruta, fecha_creacion, descripcion, estado, id_usuario_asignado, progreso_ruta
        FROM RUTAS
        WHERE id_ruta = @Id";

    private static string RutaGetByUsuarioAsignado = @"
        SELECT id_ruta, nombre_ruta, fecha_creacion, descripcion, estado, id_usuario_asignado, progreso_ruta
        FROM RUTAS
        WHERE id_usuario_asignado = @IdUsuarioAsignado";

    private static string RutaUpdateProgresoEstado = @"
        UPDATE RUTAS
        SET progreso_ruta = @ProgresoRuta, estado = @Estado
        WHERE id_ruta = @IdRuta";

    private static string RutaInsert = @"
        INSERT INTO RUTAS (nombre_ruta, fecha_creacion, descripcion, estado, id_usuario_asignado, progreso_ruta)
        VALUES (@NombreRuta, @FechaCreacion, @Descripcion, @Estado, @IdUsuarioAsignado, @ProgresoRuta);
        SELECT SCOPE_IDENTITY();";

    private static string RutaUpdate = @"
        UPDATE RUTAS
        SET nombre_ruta = @NombreRuta, fecha_creacion = @FechaCreacion, descripcion = @Descripcion,
            estado = @Estado, id_usuario_asignado = @IdUsuarioAsignado, progreso_ruta = @ProgresoRuta
        WHERE id_ruta = @IdRuta;";

    // Nuevos: Nombres de los procedimientos almacenados
    private static string AsignarRutaSP = "AsignarRutaARecolector";
    private static string LiberarRutaSP = "LiberarRutaAsignada";
    #endregion

    #region Properties
    public int IdRuta { get; set; }
    public string NombreRuta { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string Descripcion { get; set; }
    public string Estado { get; set; }
    public int? IdUsuarioAsignado { get; set; } // int? para permitir NULL en la BD
    public int ProgresoRuta { get; set; }
    #endregion

    #region Constructors
    public Ruta()
    {
        IdRuta = 0;
        NombreRuta = string.Empty;
        FechaCreacion = DateTime.MinValue;
        Descripcion = string.Empty;
        Estado = string.Empty;
        IdUsuarioAsignado = null;
        ProgresoRuta = 0;
    }

    public Ruta(int id, string nombre, DateTime fecha, string descripcion, string estado, int? idUsuarioAsignado, int progresoRuta)
    {
        IdRuta = id;
        NombreRuta = nombre;
        FechaCreacion = fecha;
        Descripcion = descripcion;
        Estado = estado;
        IdUsuarioAsignado = idUsuarioAsignado;
        ProgresoRuta = progresoRuta;
    }
    #endregion

    #region Methods (Data Access)
    public static List<Ruta> GetAll()
    {
        SqlCommand command = new SqlCommand(RutaGetAll);
        return RutaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Ruta GetById(int id)
    {
        SqlCommand command = new SqlCommand(RutaGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? RutaMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Ruta> GetByUsuarioAsignado(int idUsuarioAsignado)
    {
        SqlCommand command = new SqlCommand(RutaGetByUsuarioAsignado);
        command.Parameters.AddWithValue("@IdUsuarioAsignado", idUsuarioAsignado);
        return RutaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static bool UpdateProgresoAndEstado(int idRuta, int progresoRuta, string estado)
    {
        SqlCommand command = new SqlCommand(RutaUpdateProgresoEstado);
        command.Parameters.AddWithValue("@IdRuta", idRuta);
        command.Parameters.AddWithValue("@ProgresoRuta", progresoRuta);
        command.Parameters.AddWithValue("@Estado", estado);
        int rowsAffected = SqlServerConnection.ExecuteCommand(command);
        return rowsAffected > 0;
    }

    public int Insert()
    {
        SqlCommand command = new SqlCommand(RutaInsert);
        command.Parameters.AddWithValue("@NombreRuta", NombreRuta);
        command.Parameters.AddWithValue("@FechaCreacion", FechaCreacion);
        command.Parameters.AddWithValue("@Descripcion", Descripcion);
        command.Parameters.AddWithValue("@Estado", Estado);
        if (IdUsuarioAsignado.HasValue)
        {
            command.Parameters.AddWithValue("@IdUsuarioAsignado", IdUsuarioAsignado.Value);
        }
        else
        {
            command.Parameters.AddWithValue("@IdUsuarioAsignado", DBNull.Value);
        }
        command.Parameters.AddWithValue("@ProgresoRuta", ProgresoRuta);

        IdRuta = Convert.ToInt32(SqlServerConnection.ExecuteScalar(command));
        return IdRuta;
    }

    public void Update()
    {
        SqlCommand command = new SqlCommand(RutaUpdate);
        command.Parameters.AddWithValue("@IdRuta", IdRuta);
        command.Parameters.AddWithValue("@NombreRuta", NombreRuta);
        command.Parameters.AddWithValue("@FechaCreacion", FechaCreacion);
        command.Parameters.AddWithValue("@Descripcion", Descripcion);
        command.Parameters.AddWithValue("@Estado", Estado);
        if (IdUsuarioAsignado.HasValue)
        {
            command.Parameters.AddWithValue("@IdUsuarioAsignado", IdUsuarioAsignado.Value);
        }
        else
        {
            command.Parameters.AddWithValue("@IdUsuarioAsignado", DBNull.Value);
        }
        command.Parameters.AddWithValue("@ProgresoRuta", ProgresoRuta);

        SqlServerConnection.ExecuteCommand(command);
    }

    public static void AsignarRutaARecolector(int idRuta, int idRecolector, int idAprobador, DateTime fechaProgramada)
    {
        SqlCommand command = new SqlCommand(AsignarRutaSP);
        command.CommandType = CommandType.StoredProcedure; // Indica que es un Stored Procedure

        command.Parameters.AddWithValue("@id_ruta", idRuta);
        command.Parameters.AddWithValue("@id_recolector", idRecolector);
        command.Parameters.AddWithValue("@id_aprobador", idAprobador);
        command.Parameters.AddWithValue("@fecha_programada", fechaProgramada);

        try
        {
            SqlServerConnection.ExecuteCommand(command);
        }
        catch (SqlException ex)
        {
            // Propagar el mensaje de error para que el controlador lo maneje
            throw new Exception($"Error al asignar la ruta: {ex.Message}", ex);
        }
    }

    public static void LiberarRutaAsignada(int idRuta)
    {
        SqlCommand command = new SqlCommand(LiberarRutaSP);
        command.CommandType = CommandType.StoredProcedure; // Indica que es un Stored Procedure

        command.Parameters.AddWithValue("@id_ruta", idRuta);

        try
        {
            SqlServerConnection.ExecuteCommand(command);
        }
        catch (SqlException ex)
        {
            // Propagar el mensaje de error para que el controlador lo maneje
            throw new Exception($"Error al liberar la ruta: {ex.Message}", ex);
        }
    }
    #endregion
}