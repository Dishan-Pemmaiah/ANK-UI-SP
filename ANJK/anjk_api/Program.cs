using anjk_api.Data;
using anjk_api.Live;
using anjk_api.Middleware;
using anjk_api.Repositories;
using anjk_api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var configuredOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?.Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim())
    .ToArray()
    ?? Array.Empty<string>();

var envOrigins = (builder.Configuration["CORS_ALLOWED_ORIGINS"] ?? string.Empty)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .ToArray();

var allowedOrigins = configuredOrigins
    .Concat(envOrigins)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            // Fallback for local/dev when no explicit UI domains are configured.
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Basic", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "basic",
        In = ParameterLocation.Header,
        Description = "Enter username and password via Basic auth."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Basic"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<IGalleryService, GalleryService>();
builder.Services.AddScoped<ILiveService, LiveService>();
builder.Services.AddScoped<ISportsService, SportsService>();

builder.Services.AddSignalR();

builder.Services.AddAuthentication("Basic")
    .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>("Basic", null);

builder.Services.AddAuthorization();

var app = builder.Build();

var allowStartWithoutDb = string.Equals(
    builder.Configuration["ALLOW_START_WITHOUT_DB"],
    "true",
    StringComparison.OrdinalIgnoreCase);

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        dbContext.Database.Migrate();
        SeedData.Seed(dbContext);
    }
    catch (Exception ex)
    {
        if (allowStartWithoutDb)
        {
            app.Logger.LogError(ex, "Database migration/seed failed at startup. Continuing because ALLOW_START_WITHOUT_DB=true.");
        }
        else
        {
            throw;
        }
    }
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("FrontendPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<LiveHub>("/livehub");

app.Run();
