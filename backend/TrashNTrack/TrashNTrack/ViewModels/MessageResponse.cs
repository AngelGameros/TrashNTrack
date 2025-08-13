using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class MessageResponse : JsonResponse
{
    public string Message { get; set; }
    public string Type { get; set; }

    public static MessageResponse GetResponse(int status, string message, MessageType type)
    {
        MessageResponse r = new MessageResponse();
        r.Status = status;
        r.Message = message;
        r.Type = type.ToString();
        return r;
    }
}
