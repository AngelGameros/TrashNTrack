using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Planta
{
    #region SQL Statements
    private static string PlantaGetAll = @"
        SELECT id_planta, nombre, id_ubicacion
        FROM Plantas";

    private static string PlantaGetById = @"
        SELECT id_planta, nombre, id_ubicacion
        FROM Plantas
        WHERE id_planta = @Id";

    private static string PlantaGetByUbicacion = @"
        SELECT id_planta, nombre, id_ubicacion
        FROM Plantas
        WHERE id_ubicacion = @UbicacionId";

    // New: SQL statement for inserting a new Planta
    private static string PlantaInsert = @"
        INSERT INTO Plantas (nombre, id_ubicacion)
        VALUES (@Nombre, @IdUbicacion);
        SELECT SCOPE_IDENTITY();"; // Returns the ID of the newly inserted row

    // New: SQL statement for updating an existing Planta
    private static string PlantaUpdate = @"
        UPDATE Plantas
        SET nombre = @Nombre, id_ubicacion = @IdUbicacion
        WHERE id_planta = @IdPlanta;";
    #endregion

    #region Properties
    public int IdPlanta { get; set; }
    public string Nombre { get; set; }
    public int IdUbicacion { get; set; }
    #endregion

    #region Constructors
    public Planta()
    {
        IdPlanta = 0;
        Nombre = string.Empty;
        IdUbicacion = 0;
    }

    public Planta(int id, string nombre, int idUbicacion)
    {
        IdPlanta = id;
        Nombre = nombre;
        IdUbicacion = idUbicacion;
    }
    #endregion

    #region Methods
    public static List<Planta> GetAll()
    {
        SqlCommand command = new SqlCommand(PlantaGetAll);
        return PlantaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Planta GetById(int id)
    {
        SqlCommand command = new SqlCommand(PlantaGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? PlantaMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Planta> GetByUbicacion(int ubicacionId)
    {
        SqlCommand command = new SqlCommand(PlantaGetByUbicacion);
        command.Parameters.AddWithValue("@UbicacionId", ubicacionId);
        return PlantaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    // New: Insert method for Planta
    public int Insert()
    {
        SqlCommand command = new SqlCommand(PlantaInsert);
        command.Parameters.AddWithValue("@Nombre", Nombre);
        command.Parameters.AddWithValue("@IdUbicacion", IdUbicacion);

        // ExecuteScalar is used because SCOPE_IDENTITY() returns a single value (the new ID)
        IdPlanta = Convert.ToInt32(SqlServerConnection.ExecuteScalar(command));
        return IdPlanta;
    }

    // New: Update method for Planta
    public void Update()
    {
        SqlCommand command = new SqlCommand(PlantaUpdate);
        command.Parameters.AddWithValue("@IdPlanta", IdPlanta);
        command.Parameters.AddWithValue("@Nombre", Nombre);
        command.Parameters.AddWithValue("@IdUbicacion", IdUbicacion);

        SqlServerConnection.ExecuteCommand(command); // Use ExecuteCommand for UPDATE
    }
    #endregion
}