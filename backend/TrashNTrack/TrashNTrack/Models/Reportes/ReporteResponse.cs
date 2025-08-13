public class ReporteResponse
{
    public static object GetResponse(Reporte reporte)
    {
        return new
        {
            status = 0,
            message = "Reporte obtenido correctamente",
            data = new
            {
                id = reporte.IdReporte,
                nombre = reporte.Nombre,
                fechaReporte = reporte.FechaReporte.ToString("yyyy-MM-dd HH:mm:ss"),
                descripcion = reporte.Descripcion,
                idUsuario = reporte.IdUsuario,
                estado = reporte.Estado,
                id_contenedor = reporte.Id_contenedor,
                collected_amount = reporte.Collected_amount,
                container_status = reporte.Container_status,

            }
        };
    }
}