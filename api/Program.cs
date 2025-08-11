using api.Data;
using api.Mappings;
using api.Services;
using api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Stripe;
using api.Models;
using TokenServiceImpl = api.Services.TokenService;


var builder = WebApplication.CreateBuilder(args);

var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
        });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityApiEndpoints<AppUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITokenService, TokenServiceImpl>();
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<MappingProfile>();
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Villa Rental API",
        Version = "v1",
        Description = "API For Villa Rental Application",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Edon Berisha",
            Email = "edonberisha52@outlook.com",
            Url = new Uri("https://edonnberisha.netlify.app")
        }
    });
});


var app = builder.Build();


app.UseCors(myAllowSpecificOrigins);

StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"]; // ensure initialized
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed roles and admin user
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

    string[] roles = new[] { "Admin", "Customer" };
    foreach (var role in roles)
    {
        var exists = roleManager.RoleExistsAsync(role).GetAwaiter().GetResult();
        if (!exists)
        {
            roleManager.CreateAsync(new IdentityRole(role)).GetAwaiter().GetResult();
        }
    }

    var adminEmail = builder.Configuration["Admin:Email"] ?? "edonberisha52@gmail.com";
    var adminPassword = builder.Configuration["Admin:Password"] ?? "Edon1234!";
    var admin = userManager.FindByEmailAsync(adminEmail).GetAwaiter().GetResult();
    if (admin == null)
    {
        admin = new AppUser { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true, FullName = "Administrator" };
        var createResult = userManager.CreateAsync(admin, adminPassword).GetAwaiter().GetResult();
        if (createResult.Succeeded)
        {
            userManager.AddToRoleAsync(admin, "Admin").GetAwaiter().GetResult();
        }
    }
    else
    {
        var isAdmin = userManager.IsInRoleAsync(admin, "Admin").GetAwaiter().GetResult();
        if (!isAdmin)
        {
            userManager.AddToRoleAsync(admin, "Admin").GetAwaiter().GetResult();
        }
    }

    if (!db.Villas.Any())
    {
        db.Villas.Add(new Villa
        {
            Name = "Villa Rugova Escape",
            Region = "Rugova",
            Description = "Cozy mountain villa with fireplace.",
            PricePerNight = 120.00m,
            ImageUrlsJson = "[\"/images/villa1.jpg\",\"/images/villa2.jpg\"]"
        });

        db.Villas.Add(new Villa
        {
            Name = "Snowy Brezovica Chalet",
            Region = "Brezovica",
            Description = "Perfect for winter getaways.",
            PricePerNight = 150.00m,
            ImageUrlsJson = "[\"/images/villa3.jpg\"]"
        });
        db.SaveChanges();
    }
}
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Villa Rental API v1");
        options.RoutePrefix = string.Empty;
    });
    app.MapOpenApi();
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Villa Rental API v1");
        options.RoutePrefix = "swagger";
    });
}


app.MapControllers();


app.UseHttpsRedirection();
app.UseStaticFiles();


app.Run();
