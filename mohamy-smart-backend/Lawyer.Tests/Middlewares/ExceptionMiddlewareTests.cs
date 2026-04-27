using System.Net;
using System.Text.Json;
using Lawyer.Core.Exceptions;
using Lawyer.Middlewares;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace Lawyer.Tests.Middlewares;

public class ExceptionMiddlewareTests
{
    private static ExceptionMiddleware CreateMiddleware(Exception ex)
    {
        return new ExceptionMiddleware(
            next: _ => throw ex,
            logger: Mock.Of<ILogger<ExceptionMiddleware>>());
    }

    private static async Task<Result<string>?> ReadResponseAsync(HttpContext context)
    {
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        var json = await reader.ReadToEndAsync();
        return JsonSerializer.Deserialize<Result<string>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    private static HttpContext CreateHttpContext()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        return context;
    }

    [Fact]
    public async Task InvokeAsync_ForbiddenException_Returns403()
    {
        var middleware = CreateMiddleware(new ForbiddenException("access denied"));
        var context = CreateHttpContext();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Forbidden);
        var result = await ReadResponseAsync(context);
        result.Should().NotBeNull();
        result!.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task InvokeAsync_KeyNotFoundException_Returns404()
    {
        var middleware = CreateMiddleware(new KeyNotFoundException("not found"));
        var context = CreateHttpContext();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        var result = await ReadResponseAsync(context);
        result.Should().NotBeNull();
        result!.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task InvokeAsync_UnauthorizedAccessException_Returns401()
    {
        var middleware = CreateMiddleware(new UnauthorizedAccessException("unauthorized"));
        var context = CreateHttpContext();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Unauthorized);
        var result = await ReadResponseAsync(context);
        result.Should().NotBeNull();
        result!.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task InvokeAsync_SchemaValidationException_Returns400()
    {
        var middleware = CreateMiddleware(new SchemaValidationException("workflow", 1, "validation failed"));
        var context = CreateHttpContext();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        var result = await ReadResponseAsync(context);
        result.Should().NotBeNull();
        result!.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task InvokeAsync_DbUpdateException_Returns500()
    {
        var middleware = CreateMiddleware(new DbUpdateException("db error"));
        var context = CreateHttpContext();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        var result = await ReadResponseAsync(context);
        result.Should().NotBeNull();
        result!.Succeeded.Should().BeFalse();
        result!.Message.Should().Contain("قاعدة البيانات");
    }

    [Fact]
    public async Task InvokeAsync_UnknownException_Returns500()
    {
        var middleware = CreateMiddleware(new InvalidOperationException("something broke"));
        var context = CreateHttpContext();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        var result = await ReadResponseAsync(context);
        result.Should().NotBeNull();
        result!.Succeeded.Should().BeFalse();
        result!.Message.Should().Contain("غير متوقع");
    }
}
