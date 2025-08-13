using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class RutaEmpresa
{
    #region SQL Statements
    private static string RutaEmpresaGetAll = @"
        SELECT id_ruta, id_empresa, orden
        FROM rutas_empresas";

    private static string RutaEmpresaGetByCompositeKey = @"
        SELECT id_ruta, id_empresa, orden
        FROM rutas_empresas
        WHERE id_ruta = @IdRuta AND id_empresa = @IdEmpresa";

    private static string RutaEmpresaInsert = @"
        INSERT INTO rutas_empresas (id_ruta, id_empresa, orden)
        VALUES (@IdRuta, @IdEmpresa, @Orden);";

    private static string RutaEmpresaUpdate = @"
        UPDATE rutas_empresas
        SET orden = @Orden
        WHERE id_ruta = @IdRuta AND id_empresa = @IdEmpresa;";
    #endregion

    #region Properties
    public int? IdRuta { get; set; }
    public int? IdEmpresa { get; set; }
    public int? Orden { get; set; }
    #endregion

    #region Methods (Data Access)
    public static List<RutaEmpresa> GetAll()
    {
        SqlCommand command = new SqlCommand(RutaEmpresaGetAll);
        return RutaEmpresaMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static RutaEmpresa GetByCompositeKey(int? idRuta, int? idEmpresa)
    {
        SqlCommand command = new SqlCommand(RutaEmpresaGetByCompositeKey);
        command.Parameters.AddWithValue("@IdRuta", idRuta.HasValue ? (object)idRuta.Value : DBNull.Value);
        command.Parameters.AddWithValue("@IdEmpresa", idEmpresa.HasValue ? (object)idEmpresa.Value : DBNull.Value);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? RutaEmpresaMapper.ToObject(table.Rows[0]) : null;
    }

    public void Insert()
    {
        SqlCommand command = new SqlCommand(RutaEmpresaInsert);
        command.Parameters.AddWithValue("@IdRuta", IdRuta.HasValue ? (object)IdRuta.Value : DBNull.Value);
        command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa.HasValue ? (object)IdEmpresa.Value : DBNull.Value);
        command.Parameters.AddWithValue("@Orden", Orden.HasValue ? (object)Orden.Value : DBNull.Value);

        SqlServerConnection.ExecuteCommand(command);
    }

    public void Update()
    {
        SqlCommand command = new SqlCommand(RutaEmpresaUpdate);
        command.Parameters.AddWithValue("@IdRuta", IdRuta.HasValue ? (object)IdRuta.Value : DBNull.Value);
        command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa.HasValue ? (object)IdEmpresa.Value : DBNull.Value);
        command.Parameters.AddWithValue("@Orden", Orden.HasValue ? (object)Orden.Value : DBNull.Value);

        SqlServerConnection.ExecuteCommand(command);
    }
    #endregion
}