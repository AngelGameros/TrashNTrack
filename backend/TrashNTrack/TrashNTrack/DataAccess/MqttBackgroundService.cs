using MQTTnet;
using MQTTnet.Extensions.ManagedClient;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MQTTnet.Client;
using System.Globalization;

public class MqttBackgroundService : BackgroundService
{
    private readonly ILogger<MqttBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private IManagedMqttClient _mqttClient;

    public MqttBackgroundService(ILogger<MqttBackgroundService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Servicio de cliente MQTT gestionado iniciado.");

        try
        {
            var mqttFactory = new MqttFactory();
            _mqttClient = mqttFactory.CreateManagedMqttClient();

            var managedOptions = new ManagedMqttClientOptionsBuilder()
                .WithAutoReconnectDelay(TimeSpan.FromSeconds(5))
                .WithClientOptions(new MqttClientOptionsBuilder()
                    .WithClientId("YourClientId_1") // ID de cliente único para tu servicio
                    .WithTcpServer("broker.emqx.io", 1883) // Reemplaza con tu broker MQTT si es necesario
                    .WithCleanSession()
                    .Build())
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += async e =>
            {
                var topic = e.ApplicationMessage.Topic;
                var payloadRaw = e.ApplicationMessage.Payload == null ? "<no data>" : Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
                _logger.LogInformation("[MQTT] Mensaje recibido. Tópico: {Topic}. Payload: {Payload}", topic, payloadRaw);

                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var mongoDb = scope.ServiceProvider.GetRequiredService<MongoDbConnection>();

                        var container = JsonSerializer.Deserialize<ContainerInfo>(payloadRaw, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        if (container != null)
                        {
                            await mongoDb.UpsertContainerInfo(container, "devices"); // El nombre de colección por defecto
                        }
                    }

                    _logger.LogInformation("[MQTT] Mensaje procesado y guardado correctamente.");
                }
                catch (JsonException je)
                {
                    _logger.LogError(je, "[MQTT] Error de deserialización JSON del mensaje");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[MQTT] Error inesperado al procesar el mensaje");
                }

                await Task.CompletedTask;
            };

            _mqttClient.ConnectedAsync += e =>
            {
                _logger.LogInformation("[MQTT] Cliente conectado al broker.");
                // Te suscribes al tópico una vez que el cliente está conectado
                _mqttClient.SubscribeAsync("trash_n_track/device_data");
                return Task.CompletedTask;
            };

            _mqttClient.DisconnectedAsync += e =>
            {
                _logger.LogInformation("[MQTT] Cliente desconectado. Causa: {Cause}", e.ClientWasConnected ? "Conexión perdida" : "Error de conexión");
                return Task.CompletedTask;
            };

            await _mqttClient.StartAsync(managedOptions);
            _logger.LogInformation("Cliente MQTT gestionado iniciado y suscrito a tópicos.");

            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (TaskCanceledException)
        {
            _logger.LogInformation("[MQTT] Servicio detenido por cancelación");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[MQTT] Error crítico en el servicio");
            throw;
        }
        finally
        {
            if (_mqttClient != null)
            {
                await _mqttClient.StopAsync();
                _mqttClient.Dispose();
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Servicio de cliente MQTT gestionado deteniéndose.");
        if (_mqttClient != null)
        {
            await _mqttClient.StopAsync();
        }
        await base.StopAsync(cancellationToken);
    }
}