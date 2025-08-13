using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class RutaPlanta
{
    #region SQL Statements
    private static string RutaPlantaGetAll = @"
        SELECT id_ruta, id_planta
        FROM rutas_plantas";

    private static string RutaPlantaGetByCompositeKey = @"
        SELECT id_ruta, id_planta
        FROM rutas_plantas
        WHERE id_ruta = @IdRuta AND id_planta = @IdPlanta";

    private static string RutaPlantaInsert = @"
        INSERT INTO rutas_plantas (id_ruta, id_planta)
        VALUES (@IdRuta, @IdPlanta);";

    private static string RutaPlantaUpdate = @"
        UPDATE rutas_plantas
        SET id_planta= @IdPlanta
        WHERE id_ruta = @IdRuta;";
    #endregion

    #region Properties
    public int? IdRuta { get; set; }
    public int? IdPlanta { get; set; }
    #endregion

    #region Methods (Data Access)
    public static List<RutaPlanta> GetAll()
    {
        SqlCommand command = new SqlCommand(RutaPlantaGetAll);
        return RutaPlantaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static RutaPlanta GetByCompositeKey(int? idRuta, int? idPlanta)
    {
        SqlCommand command = new SqlCommand(RutaPlantaGetByCompositeKey);
        command.Parameters.AddWithValue("@IdRuta", idRuta.HasValue ? (object)idRuta.Value : DBNull.Value);
        command.Parameters.AddWithValue("@IdPlanta", idPlanta.HasValue ? (object)idPlanta.Value : DBNull.Value);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? RutaPlantaMapper.ToObject(table.Rows[0]) : null;
    }

    public void Insert()
    {
        SqlCommand command = new SqlCommand(RutaPlantaInsert);
        command.Parameters.AddWithValue("@IdRuta", IdRuta.HasValue ? (object)IdRuta.Value : DBNull.Value);
        command.Parameters.AddWithValue("@IdPlanta", IdPlanta.HasValue ? (object)IdPlanta.Value : DBNull.Value);

        SqlServerConnection.ExecuteCommand(command);
    }

    public void Update()
    {
        SqlCommand command = new SqlCommand(RutaPlantaUpdate);
        command.Parameters.AddWithValue("@IdRuta", IdRuta.HasValue ? (object)IdRuta.Value : DBNull.Value);
        command.Parameters.AddWithValue("@IdPlanta", IdPlanta.HasValue ? (object)IdPlanta.Value : DBNull.Value);
        SqlServerConnection.ExecuteCommand(command);
    }
    #endregion
}