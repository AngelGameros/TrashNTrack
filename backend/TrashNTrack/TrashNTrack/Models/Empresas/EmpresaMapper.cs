using System;
using System.Collections.Generic;
using System.Data;

public class EmpresaMapper
{
    public static Empresa ToObject(DataRow row)
    {
        return new Empresa
        {
            IdEmpresa = Convert.ToInt32(row["id_empresa"]),
            Nombre = row["nombre"].ToString(),
            // Manejar FechaRegistro que podría ser NULL
            FechaRegistro = row["fecha_registro"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(row["fecha_registro"]),
            // Manejar RFC que podría ser NULL
            RFC = row["rfc"] == DBNull.Value ? null : row["rfc"].ToString(),
            // Manejar IdUbicacion que podría ser NULL
            IdUbicacion = row["id_ubicacion"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["id_ubicacion"])
        };
    }

    public static List<Empresa> ToList(DataTable table)
    {
        List<Empresa> list = new List<Empresa>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}