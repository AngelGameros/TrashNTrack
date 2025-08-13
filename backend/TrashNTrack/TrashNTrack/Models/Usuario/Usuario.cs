using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data;
using Microsoft.Data.SqlClient;

public class Usuario
{
    #region statements
    private static String UsuarioGetAll = @"
    SELECT id_usuario, nombre, primer_apellido, segundo_apellido, correo, numero_telefono, firebase_uid, tipo_usuario
    FROM usuarios";

    private static String UsuarioGetOne = @"
    SELECT id_usuario, nombre, primer_apellido, segundo_apellido, correo, numero_telefono, firebase_uid, tipo_usuario
    FROM usuarios
    WHERE id_usuario = @ID";

    // Nuevo statement para actualizar por id_usuario
    private static String UsuarioUpdateById = @"
    UPDATE usuarios
    SET nombre = @Nombre,
        primer_apellido = @PrimerApellido,
        segundo_apellido = @SegundoApellido
    WHERE id_usuario = @IdUsuario";

    #endregion

    #region attributes

    private int _id_usuario;
    private string _nombre;
    private string _primer_apell;
    private string _segundo_apell;
    private string _correo;
    private string _numero_telefono;
    private string _firebase_uid;
    private string _tipo_usuario;


    #endregion

    #region properties

    public int IdUsuario => _id_usuario;
    public string Nombre { get => _nombre; set => _nombre = value; }
    public string PrimerApellido { get => _primer_apell; set => _primer_apell = value; }
    public string SegundoApellido { get => _segundo_apell; set => _segundo_apell = value; }
    public string Correo { get => _correo; set => _correo = value; }
    public string NumeroTelefono { get => _numero_telefono; set => _numero_telefono = value; }
    public string FirebaseUid { get => _firebase_uid; set => _firebase_uid = value; }
    public string TipoUsuario { get => _tipo_usuario; set => _tipo_usuario = value; }



    #endregion

    #region Constructors

    public Usuario()
    {
        _id_usuario = 0;
        _nombre = "";
        _primer_apell = "";
        _segundo_apell = "";
        _correo = "";
        _numero_telefono = "";
        _firebase_uid = "";
        _tipo_usuario = "";
    }

    public Usuario(int id_usuario, string nombre, string primer_apell, string segundo_apell, string correo, string numero_telefono, string firebase_uid, string tipo_usuario)
    {
        _id_usuario = id_usuario;
        _nombre = nombre;
        _primer_apell = primer_apell;
        _segundo_apell = segundo_apell;
        _correo = correo;
        _numero_telefono = numero_telefono;
        _firebase_uid = firebase_uid;
        _tipo_usuario = tipo_usuario;
    }


    #endregion

    #region classMethods

    public static List<Usuario> Get()
    {
        SqlCommand command = new SqlCommand(UsuarioGetAll);
        return UsuarioMapper.ToList(SqlServerConnection.ExecuteQuery(command));
    }



    public static Usuario Get(int id)
    {
        //sql command
        SqlCommand command = new SqlCommand(UsuarioGetOne);
        //paramaters
        command.Parameters.AddWithValue("@ID", id);
        //execute query 
        DataTable table = SqlServerConnection.ExecuteQuery(command);
        //check if rows were found
        if (table.Rows.Count > 0)
            return UsuarioMapper.ToObject(table.Rows[0]);
        else
            throw new UsuarioNotFoundException(id);
    }

    public bool Insert()
    {
        try
        {
            string insertQuery = @"
        INSERT INTO usuarios 
        (nombre, primer_apellido, segundo_apellido, correo, numero_telefono, firebase_uid, tipo_usuario)
        VALUES
        (@nombre, @primer_apellido, @segundo_apellido, @correo, @numero_telefono, @firebase_uid, @tipo_usuario)"; // 👈 Nombres corregidos

            using (SqlCommand command = new SqlCommand(insertQuery))
            {
                command.Parameters.AddWithValue("@nombre", Nombre ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@primer_apellido", PrimerApellido ?? (object)DBNull.Value); // 👈
                command.Parameters.AddWithValue("@segundo_apellido", SegundoApellido ?? (object)DBNull.Value); // 👈
                command.Parameters.AddWithValue("@correo", Correo ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@numero_telefono", NumeroTelefono ?? (object)DBNull.Value); // 👈
                command.Parameters.AddWithValue("@firebase_uid", FirebaseUid ?? (object)DBNull.Value); // 👈
                command.Parameters.AddWithValue("@tipo_usuario", TipoUsuario ?? "recolector"); // 👈

                int rowsAffected = SqlServerConnection.ExecuteCommand(command);
                return rowsAffected > 0;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al insertar usuario: {ex.Message}");
            throw;
        }
    }

    public static Usuario GetByFirebaseUid(string firebaseUid)
    {
        string query = @"
        SELECT id_usuario, nombre, primer_apellido, segundo_apellido, correo, 
               numero_telefono, firebase_uid, tipo_usuario
        FROM usuarios
        WHERE firebase_uid = @FirebaseUid";

        SqlCommand command = new SqlCommand(query);
        command.Parameters.AddWithValue("@FirebaseUid", firebaseUid);

        DataTable table = SqlServerConnection.ExecuteQuery(command);

        if (table.Rows.Count > 0)
            return UsuarioMapper.ToObject(table.Rows[0]);
        else
            throw new UsuarioNotFoundException(firebaseUid);
    }

    public static bool UpdatePhone(string firebaseUid, string newPhone)
    {
        string updateQuery = @"
        UPDATE usuarios
        SET numero_telefono = @Phone
        WHERE firebase_uid = @FirebaseUid";

        SqlCommand command = new SqlCommand(updateQuery);
        command.Parameters.AddWithValue("@Phone", newPhone ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@FirebaseUid", firebaseUid);

        int rowsAffected = SqlServerConnection.ExecuteCommand(command);
        return rowsAffected > 0;
    }

    // Nuevo método para actualizar por id_usuario
    public static bool UpdateUserById(int idUsuario, string newNombre, string newPrimerApellido, string newSegundoApellido)
    {
        using (SqlCommand command = new SqlCommand(UsuarioUpdateById))
        {
            command.Parameters.AddWithValue("@IdUsuario", idUsuario);
            command.Parameters.AddWithValue("@Nombre", newNombre ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@PrimerApellido", newPrimerApellido ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@SegundoApellido", newSegundoApellido ?? (object)DBNull.Value);

            int rowsAffected = SqlServerConnection.ExecuteCommand(command);
            return rowsAffected > 0;
        }
    }
    #endregion
}