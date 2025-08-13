using System;
using System.Collections.Generic;
using System.Data;

public class RutaEmpresaMapper
{
    public static RutaEmpresa ToObject(DataRow row)
    {
        return new RutaEmpresa
        {
            IdRuta = row["id_ruta"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["id_ruta"]),
            IdEmpresa = row["id_empresa"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["id_empresa"]),
            Orden = row["orden"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["orden"])
        };
    }

    public static List<RutaEmpresa> ToList(DataTable table)
    {
        List<RutaEmpresa> list = new List<RutaEmpresa>();
        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }
        return list;
    }
}