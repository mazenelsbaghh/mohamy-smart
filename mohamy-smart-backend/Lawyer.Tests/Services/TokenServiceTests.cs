using FluentAssertions;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using Lawyer.Infrastructure.Services.Identity;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Lawyer.Tests.Services;

public class TokenServiceTests
{
    private readonly TokenService _service;

    public TokenServiceTests()
    {
        _service = new TokenService(Options.Create(new JWT
        {
            Key = "unit-test-signing-key-with-more-than-32-chars-xxxxxx",
            Issuer = "test-issuer",
            Audience = "test-audience",
            DurationInMinutes = 30
        }));
    }

    [Fact]
    public async Task GenerateRefreshToken_ProducesUniqueValues()
    {
        var a = await _service.GenerateRefreshToken();
        var b = await _service.GenerateRefreshToken();

        a.Should().NotBeNullOrWhiteSpace();
        a.Should().NotBe(b);
    }

    [Fact]
    public async Task GenerateRefreshToken_ProducesBase64String()
    {
        var token = await _service.GenerateRefreshToken();

        var act = () => Convert.FromBase64String(token);
        act.Should().NotThrow();
    }

    [Fact]
    public async Task CreateToken_EmbedsUserIdEmailAndRoles()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            UserName = "test@example.com",
            FullName = "Test User"
        };

        var jwt = await _service.CreateToken(user, new List<string> { "Lawyer", "Admin" });

        var parsed = new JwtSecurityTokenHandler().ReadJwtToken(jwt);
        parsed.Issuer.Should().Be("test-issuer");
        parsed.Audiences.Should().Contain("test-audience");
        parsed.Claims.Should().Contain(c => c.Type == ClaimTypes.Email && c.Value == "test@example.com");
        parsed.Claims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier && c.Value == user.Id.ToString());
        parsed.Claims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == "Lawyer");
        parsed.Claims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
    }

    [Fact]
    public async Task CreateToken_EachCallHasUniqueJti()
    {
        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = "a@b.com", UserName = "a@b.com" };
        var handler = new JwtSecurityTokenHandler();

        var jti1 = handler.ReadJwtToken(await _service.CreateToken(user, new List<string>()))
            .Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value;
        var jti2 = handler.ReadJwtToken(await _service.CreateToken(user, new List<string>()))
            .Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value;

        jti1.Should().NotBe(jti2);
    }
}
