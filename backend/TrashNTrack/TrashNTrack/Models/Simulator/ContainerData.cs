using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class ContainerData
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    [BsonElement("deviceID")]
    [JsonPropertyName("deviceID")]
    public string DeviceID { get; set; }

    [BsonElement("clientID")]
    [JsonPropertyName("clientID")]
    public string ClientID { get; set; }

    [BsonElement("name")]
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [BsonElement("status")]
    [JsonPropertyName("status")]
    public string Status { get; set; }

    [BsonElement("type")]
    [JsonPropertyName("type")]
    public string Type { get; set; }

    [BsonElement("maxWeight_kg")]
    [JsonPropertyName("maxWeight_kg")]
    public double MaxWeight_kg { get; set; }

    [BsonElement("values")]
    [JsonPropertyName("values")]
    public ContainerSensorValues Values { get; set; }

    [BsonElement("last_updated")]
    [JsonPropertyName("last_updated")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime LastUpdated { get; set; }

    public void PrepareForInsert()
    {
        // ✅ Generar nuevo ObjectId para cada lectura
        this.Id = ObjectId.GenerateNewId().ToString();

        // ✅ NO modificar LastUpdated - mantener la fecha original del ESP32
        // Solo asegurar que esté marcada como UTC si no lo está
        if (this.LastUpdated.Kind != DateTimeKind.Utc)
        {
            this.LastUpdated = DateTime.SpecifyKind(this.LastUpdated, DateTimeKind.Utc);
        }
    }
}

public class ContainerSensorValues
{
    [BsonElement("device_id")]
    [JsonPropertyName("device_id")]
    public int Device_id { get; set; }

    [BsonElement("temperature_C")]
    [JsonPropertyName("temperature_C")]
    public double Temperature_C { get; set; }

    [BsonElement("humidity_RH")]
    [JsonPropertyName("humidity_RH")]
    public double Humidity_RH { get; set; }

    [BsonElement("air_quality_ppm")]
    [JsonPropertyName("air_quality_ppm")]
    public double Air_quality_ppm { get; set; }

    [BsonElement("gas_ppm")]
    [JsonPropertyName("gas_ppm")]
    public double Gas_ppm { get; set; }

    [BsonElement("distance_cm")]
    [JsonPropertyName("distance_cm")]
    public double Distance_cm { get; set; } = 0; // Valor por defecto

    [BsonElement("weight_kg")]
    [JsonPropertyName("weight_kg")]
    public double Weight_kg { get; set; }

    [BsonElement("is_open")]
    [JsonPropertyName("is_open")]
    public bool Is_open { get; set; }

    [BsonElement("open_count")]
    [JsonPropertyName("open_count")]
    public int Open_count { get; set; }
}
