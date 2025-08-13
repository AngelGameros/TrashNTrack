public class AlertaResponse
{
    public static object GetResponse(Alerta alerta)
    {
        return new
        {
            status = 0,
            message = "Alerta obtenida correctamente",
            data = new
            {
                id = alerta.IdAlerta,
                tipo = alerta.TipoAlerta,
                descripcion = alerta.Descripcion,
                fechaAlerta = alerta.FechaAlerta.ToString("yyyy-MM-dd HH:mm:ss"),
                idSensor = alerta.IdSensor
            }
        };
    }
}