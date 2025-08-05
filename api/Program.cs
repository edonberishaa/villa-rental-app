using api.Data;
using api.Services;
using api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();
builder.Services.AddScoped<IReservationService, ReservationService>();

var app = builder.Build();

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
    app.MapOpenApi();
}
app.MapControllers();

app.UseHttpsRedirection();


app.Run();
