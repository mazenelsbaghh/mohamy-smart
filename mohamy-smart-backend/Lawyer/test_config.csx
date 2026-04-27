using Microsoft.Extensions.Configuration;
using System.IO;
using System.Collections.Generic;

var builder = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .AddEnvironmentVariables();

var config = builder.Build();
Console.WriteLine("Gemini:ApiKey = " + config["Gemini:ApiKey"]);
