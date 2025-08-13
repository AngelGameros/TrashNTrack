using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/[controller]")]
public class ContainersController : ControllerBase
{
    private readonly MongoDbConnection _mongoDbConnection;
    private readonly IConfiguration _configuration;

    public ContainersController(IConfiguration configuration)
    {
        _configuration = configuration;
        _mongoDbConnection = new MongoDbConnection(configuration);
    }

    [HttpPost("{collectionName}")]
    public async Task<IActionResult> PostContainer(string collectionName, [FromBody] ContainerInfo container)
    {
        if (container == null)
        {
            return BadRequest(new { error = "No se recibieron datos del contenedor." });
        }

        try
        {
            var collection = _mongoDbConnection.GetCollection<ContainerInfo>(collectionName);
            
            container.UpdatedAt = DateTime.UtcNow; // La fecha de actualización será la misma
            
            await collection.InsertOneAsync(container);
            
            Console.WriteLine($"Nuevo dato de contenedor insertado en la colección '{collectionName}': {container.Id}");
            return Ok(new { message = $"Dato de contenedor insertado en la colección '{collectionName}'.", Id = container.Id });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error al procesar PostContainer para la colección '{collectionName}': {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Endpoint para obtener todos los contenedores de una colección específica
    [HttpGet("{collectionName}")]
    public async Task<ActionResult<List<ContainerInfo>>> GetAllContainers(string collectionName)
    {
        try
        {
            var collection = _mongoDbConnection.GetCollection<ContainerInfo>(collectionName);
            var containers = await collection.Find(_ => true).ToListAsync();

            if (containers == null || containers.Count == 0)
            {
                return Ok(new List<ContainerInfo>());
            }

            return Ok(containers);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error al obtener contenedores de la colección '{collectionName}': {ex.Message}");
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }

    // Endpoint para actualizar por lotes en una colección específica
    [HttpPost("batch-update/{collectionName}")]
    public async Task<IActionResult> BatchUpdateContainers(string collectionName, [FromBody] List<ContainerInfo> containers)
    {
        if (containers == null || containers.Count == 0)
        {
            return BadRequest(new { error = "No se recibieron datos de contenedores." });
        }

        try
        {
            var collection = _mongoDbConnection.GetCollection<ContainerInfo>(collectionName);
            var results = new List<object>();

            foreach (var container in containers)
            {
                var filter = Builders<ContainerInfo>.Filter.Eq(c => c.Id, container.Id);
                var existing = await collection.Find(filter).FirstOrDefaultAsync();

                if (existing == null)
                {
                    container.UpdatedAt = DateTime.UtcNow;
                    await collection.InsertOneAsync(container);
                    results.Add(new { action = "inserted", id = container.Id });
                }
                else
                {
                    container.Id = existing.Id;
                    container.UpdatedAt = DateTime.UtcNow;
                    var result = await collection.ReplaceOneAsync(filter, container);
                    results.Add(new { action = result.ModifiedCount > 0 ? "updated" : "unchanged", id = existing.Id });
                }
            }

            return Ok(new { message = $"Procesados {containers.Count} contenedores en la colección '{collectionName}'.", details = results });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error al procesar batch-update para la colección '{collectionName}': {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}