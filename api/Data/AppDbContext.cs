using api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts): base(opts)
        {}

        public DbSet<Villa> Villas => Set<Villa>();
        public DbSet<BlockedDate> BlockedDates => Set<BlockedDate>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<Review> Reviews => Set<Review>();
    public DbSet<PropertySubmission> PropertySubmissions => Set<PropertySubmission>();
    public DbSet<OwnerRequest> OwnerRequests => Set<OwnerRequest>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => r.ReservationCode)
                .IsUnique();
        }

    }
}
