using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

public class Contenedor
{
    #region SQL Statements
    private static string ContenedorGetAll = @"
        SELECT id_contenedor, descripcion, fecha_registro, id_empresa, id_tipo_residuo, id_tipo_contenedor 
        FROM Contenedores";

    private static string ContenedorGetById = @"
        SELECT id_contenedor, descripcion, fecha_registro, id_empresa, id_tipo_residuo, id_tipo_contenedor 
        FROM Contenedores 
        WHERE id_contenedor = @Id";

    private static string ContenedorGetByEmpresa = @"
        SELECT id_contenedor, descripcion, fecha_registro, id_empresa, id_tipo_residuo, id_tipo_contenedor 
        FROM Contenedores 
        WHERE id_empresa = @EmpresaId";

    private static string ContenedorGetByTipoResiduo = @"
        SELECT id_contenedor, descripcion, fecha_registro, id_empresa, id_tipo_residuo, id_tipo_contenedor 
        FROM Contenedores 
        WHERE id_tipo_residuo = @TipoResiduoId";

    private static string ContenedorGetByEstado = @"
        SELECT id_contenedor, descripcion, fecha_registro, id_empresa, id_tipo_residuo, id_tipo_contenedor 
        FROM Contenedores 
        WHERE estado = @Estado";
    #endregion

    #region Properties
    public int IdContenedor { get; set; }
    public string Descripcion { get; set; }
    public string FechaRegistro { get; set; }
    public int IdEmpresa { get; set; }
    public int IdTipoResiduo { get; set; }
    public int IdTipoContenedor { get; set; }
    #endregion

    #region Constructors
    public Contenedor()
    {
        IdContenedor = 0;
        Descripcion = string.Empty;
        FechaRegistro = string.Empty;
        IdEmpresa = 0;
        IdTipoResiduo = 0;
        IdTipoContenedor = 0;
    }

    public Contenedor(int id, string descripcion, string fechaRegistro,
                     int idEmpresa, int idTipoResiduo, int idTipoContenedor)
    {
        IdContenedor = id;
        Descripcion = descripcion;
        FechaRegistro = fechaRegistro;
        IdEmpresa = idEmpresa;
        IdTipoResiduo = idTipoResiduo;
        IdTipoContenedor = idTipoContenedor;
    }
    #endregion

    #region Methods
    public static List<Contenedor> GetAll()
    {
        SqlCommand command = new SqlCommand(ContenedorGetAll);
        return ContenedorMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static Contenedor GetById(int id)
    {
        SqlCommand command = new SqlCommand(ContenedorGetById);
        command.Parameters.AddWithValue("@Id", id);
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        return table.Rows.Count > 0 ? ContenedorMapper.ToObject(table.Rows[0]) : null;
    }

    public static List<Contenedor> GetByEmpresa(int empresaId)
    {
        SqlCommand command = new SqlCommand(ContenedorGetByEmpresa);
        command.Parameters.AddWithValue("@EmpresaId", empresaId);
        return ContenedorMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<Contenedor> GetByTipoResiduo(int tipoResiduoId)
    {
        SqlCommand command = new SqlCommand(ContenedorGetByTipoResiduo);
        command.Parameters.AddWithValue("@TipoResiduoId", tipoResiduoId);
        return ContenedorMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }

    public static List<Contenedor> GetByEstado(string estado)
    {
        SqlCommand command = new SqlCommand(ContenedorGetByEstado);
        command.Parameters.AddWithValue("@Estado", estado);
        return ContenedorMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }
    #endregion
}