using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

public class MongoDbConnection
{
    private readonly IMongoDatabase _database;
    private readonly string _defaultCollectionName;

    public MongoDbConnection(IConfiguration configuration)
    {
        Console.WriteLine("[MONGODB] Inicializando conexión a MongoDB...");

        try
        {
            var connectionString = configuration.GetValue<string>("mongoDb:ConnectionString");
            var databaseName = configuration.GetValue<string>("mongoDb:DatabaseName");
            _defaultCollectionName = configuration.GetValue<string>("mongoDb:CollectionName");

            if (string.IsNullOrEmpty(connectionString) || string.IsNullOrEmpty(databaseName))
            {
                throw new InvalidOperationException("La cadena de conexión o el nombre de la base de datos de MongoDB no se encuentran en la configuración.");
            }

            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
            Console.WriteLine($"[MONGODB] Conexión a MongoDB exitosa. Base de datos: {databaseName}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[MONGODB] Error al conectar a MongoDB: {ex.Message}");
            throw;
        }
    }

    // Método para obtener la colección por defecto, usado por el servicio MQTT y otros endpoints no dinámicos
    public IMongoCollection<TDocument> GetCollection<TDocument>()
    {
        return _database.GetCollection<TDocument>(_defaultCollectionName);
    }

    // Método para obtener una colección por su nombre (dinámico), usado por el simulador
    public IMongoCollection<TDocument> GetCollection<TDocument>(string collectionName)
    {
        return _database.GetCollection<TDocument>(collectionName);
    }

    // Método unificado para insertar o actualizar datos (usado por MQTT y la API)
    public async Task UpsertContainerInfo(ContainerInfo container, string collectionName)
    {
        if (container == null) throw new ArgumentNullException(nameof(container));

        var collection = GetCollection<ContainerInfo>(collectionName);
        var filter = Builders<ContainerInfo>.Filter.Eq(c => c.Id, container.Id);

        // Usamos ReplaceOneAsync para insertar o reemplazar un documento existente
        // El parámetro IsUpsert = true garantiza que si no existe, se inserta uno nuevo.
        container.UpdatedAt = DateTime.UtcNow; // Aseguramos que la fecha de actualización sea la actual

        var result = await collection.ReplaceOneAsync(filter, container, new ReplaceOptions { IsUpsert = true });

        if (result.IsAcknowledged)
        {
            if (result.MatchedCount == 0)
            {
                Console.WriteLine($"[MONGODB] Documento insertado en la colección '{collectionName}' para DeviceID: {container.Id}");
            }
            else if (result.ModifiedCount > 0)
            {
                Console.WriteLine($"[MONGODB] Documento actualizado en la colección '{collectionName}' para DeviceID: {container.Id}");
            }
            else
            {
                Console.WriteLine($"[MONGODB] Documento existente en la colección '{collectionName}' no se modificó para DeviceID: {container.Id}");
            }
        }
        else
        {
            Console.Error.WriteLine($"[MONGODB] La operación Upsert no fue reconocida para DeviceID: {container.Id}");
        }
    }
}