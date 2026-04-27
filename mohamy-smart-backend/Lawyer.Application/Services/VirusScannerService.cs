using System.Net.Sockets;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using nClam;

namespace Lawyer.Application.Services;

public interface IVirusScannerService
{
    Task<bool> IsSafeAsync(IFormFile file, CancellationToken cancellationToken = default);
}

public class VirusScannerService : IVirusScannerService
{
    private readonly ILogger<VirusScannerService> _logger;
    private readonly ClamClient _clam;

    // Use localhost if not specified, default port 3310
    public VirusScannerService(ILogger<VirusScannerService> logger)
    {
        _logger = logger;
        
        // Fetch from environment, fallback to localhost for development out of container
        var host = Environment.GetEnvironmentVariable("CLAMAV_HOST") ?? "localhost";
        var portStr = Environment.GetEnvironmentVariable("CLAMAV_PORT") ?? "3310";
        var port = int.TryParse(portStr, out var p) ? p : 3310;
        
        _clam = new ClamClient(host, port);
    }

    public async Task<bool> IsSafeAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        try
        {
            if (file == null || file.Length == 0)
                return false;

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms, cancellationToken);
            var fileBytes = ms.ToArray();

            var scanResult = await _clam.SendAndScanFileAsync(fileBytes, cancellationToken);

            switch (scanResult.Result)
            {
                case ClamScanResults.Clean:
                    _logger.LogInformation("File {FileName} is clean.", file.FileName);
                    return true;
                case ClamScanResults.VirusDetected:
                    _logger.LogWarning("Virus {VirusName} detected in file {FileName}.", scanResult.InfectedFiles.FirstOrDefault()?.VirusName, file.FileName);
                    return false;
                case ClamScanResults.Error:
                    _logger.LogError("Error scanning file {FileName}: {ErrorMessage}", file.FileName, scanResult.RawResult);
                    // Deny by default on error
                    return false;
                case ClamScanResults.Unknown:
                default:
                    _logger.LogWarning("Unknown scan result for file {FileName}.", file.FileName);
                    return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to ClamAV for scanning {FileName}", file.FileName);
            // In a strict security environment, if scanner is down, we block uploads.
            // But for development, we might want to let it pass if CLAMAV_STRICT is false
            var isStrict = Environment.GetEnvironmentVariable("CLAMAV_STRICT") ?? "true";
            return !bool.Parse(isStrict);
        }
    }
}
