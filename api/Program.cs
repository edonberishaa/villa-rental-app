using api.Data;
using api.Mappings;
using api.Services;
using api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;


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
builder.Services.AddControllers();
builder.Services.AddScoped<IReservationService, ReservationService>();
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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Villas.Any())
    {
        db.Villas.Add(new Villa
        {
            Name = "Villa Rugova Escape",
            Region = "Rugovë",
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
            ImageUrlsJson = "[\"/images/chalet1.jpg\"]"
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
