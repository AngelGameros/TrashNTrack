using System;
using System.Collections.Generic;
using System.Data;

public class ContenedorMapper
{
    public static Contenedor ToObject(DataRow row)
    {
        return new Contenedor
        {
            IdContenedor = Convert.ToInt32(row["id_contenedor"]),
            Descripcion = row["descripcion"].ToString(),
            FechaRegistro = row["fecha_registro"].ToString(),
            IdEmpresa = Convert.ToInt32(row["id_empresa"]),
            IdTipoResiduo = Convert.ToInt32(row["id_tipo_residuo"]),
            IdTipoContenedor = Convert.ToInt32(row["id_tipo_contenedor"])
        };
    }

    public static List<Contenedor> ToList(DataTable table)
    {
        List<Contenedor> list = new List<Contenedor>();

        foreach (DataRow row in table.Rows)
        {
            list.Add(ToObject(row));
        }

        return list;
    }
}