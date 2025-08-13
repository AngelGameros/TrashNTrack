public class SensorResponse
{
    public static object GetResponse(Sensor sensor)
    {
        return new
        {
            status = 0,
            message = "Sensor obtenido correctamente",
            data = new
            {
                id = sensor.IdSensor,
                tipo = sensor.TipoSensor,
                descripcion = sensor.Descripcion,
                fechaRegistro = sensor.DiaRegistro.ToString("yyyy-MM-dd"),
                contenedorId = sensor.IdContenedor
            }
        };
    }
}