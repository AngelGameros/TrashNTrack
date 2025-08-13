using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

public class ContainerInfo
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    
    public int IdEmpresa { get; set; }
    public string Name { get; set; }
    public string Descripcion { get; set; }
    public string Status { get; set; }
    public int Type { get; set; }
    public double MaxWeight_kg { get; set; }
    public SensorValues Values { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

public class SensorValues
{
    public double Temperature_C { get; set; }
    public double Humidity_RH { get; set; }
    public double Air_Quality_Ppm { get; set; }
    public double Gas_Ppm { get; set; }
    public double Distance_Cm { get; set; }
    public double Weight_Kg { get; set; }
    public string Is_Open { get; set; }
    public int Open_Count { get; set; }
}