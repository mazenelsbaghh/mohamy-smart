using FluentAssertions;
using Lawyer.Application.Services;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Setting;
using Lawyer.Application.IServices;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System.Security.Cryptography;
using System.Text;

namespace Lawyer.Tests.Services;

public class PaymobServiceHmacTests
{
    private readonly PaymobService _service;
    private const string HmacSecret = "test-hmac-secret-key";

    public PaymobServiceHmacTests()
    {
        var settings = Options.Create(new PaymobSettings
        {
            HMAC = HmacSecret,
            SecretKey = "sk",
            PublicKey = "pk",
            APIKey = "ak",
            CardIntegrationId = "1",
            MobileIntegrationId = "2",
            CallbackBaseUrl = "https://example.test"
        });

        _service = new PaymobService(
            new Mock<IUnitOfWork>().Object,
            new Mock<ISubscriptionService>().Object,
            new Mock<IHttpClientFactory>().Object,
            settings,
            new Mock<ILogger<PaymobService>>().Object);
    }

    [Fact]
    public void VerifyCallbackHmac_ReturnsTrue_ForValidSignature()
    {
        const string data = "amount100EGP";
        var expected = ComputeExpected(data, HmacSecret);

        _service.VerifyCallbackHmac(data, expected).Should().BeTrue();
    }

    [Fact]
    public void VerifyCallbackHmac_IsCaseInsensitive()
    {
        const string data = "amount100EGP";
        var expected = ComputeExpected(data, HmacSecret).ToUpperInvariant();

        _service.VerifyCallbackHmac(data, expected).Should().BeTrue();
    }

    [Fact]
    public void VerifyCallbackHmac_ReturnsFalse_ForTamperedData()
    {
        const string data = "amount100EGP";
        var expected = ComputeExpected(data, HmacSecret);

        _service.VerifyCallbackHmac("amount999EGP", expected).Should().BeFalse();
    }

    [Fact]
    public void VerifyCallbackHmac_ReturnsFalse_ForWrongSignature()
    {
        _service.VerifyCallbackHmac("any-data", "0000000000").Should().BeFalse();
    }

    private static string ComputeExpected(string data, string secret)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }
}
