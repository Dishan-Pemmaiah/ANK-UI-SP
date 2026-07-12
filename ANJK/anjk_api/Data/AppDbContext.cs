using anjk_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace anjk_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<AppUser> AppUsers => Set<AppUser>();
        public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
        public DbSet<Event> Events => Set<Event>();
        public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();
        public DbSet<NewsItem> NewsItems => Set<NewsItem>();
        public DbSet<GalleryItem> GalleryItems => Set<GalleryItem>();
        public DbSet<SportCategory> SportCategories => Set<SportCategory>();
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<Player> Players => Set<Player>();
        public DbSet<Fixture> Fixtures => Set<Fixture>();
        public DbSet<PointTableEntry> PointTableEntries => Set<PointTableEntry>();
        public DbSet<CommitteeMember> CommitteeMembers => Set<CommitteeMember>();
        public DbSet<HeritageItem> HeritageItems => Set<HeritageItem>();
        public DbSet<HallOfFameItem> HallOfFameItems => Set<HallOfFameItem>();
        public DbSet<Village> Villages => Set<Village>();
        public DbSet<AboutSection> AboutSections => Set<AboutSection>();
        public DbSet<SportTournamentRecord> SportTournamentRecords => Set<SportTournamentRecord>();
        public DbSet<LiveUpdate> LiveUpdates => Set<LiveUpdate>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AppUser>()
                .HasMany(u => u.FamilyMembers)
                .WithOne(f => f.AppUser)
                .HasForeignKey(f => f.AppUserId);

            modelBuilder.Entity<AppUser>()
                .HasMany(u => u.EventRegistrations)
                .WithOne(r => r.AppUser)
                .HasForeignKey(r => r.AppUserId);

            modelBuilder.Entity<Event>()
                .HasMany(e => e.Registrations)
                .WithOne(r => r.Event)
                .HasForeignKey(r => r.EventId);

            modelBuilder.Entity<SportCategory>()
                .HasMany(c => c.Teams)
                .WithOne(t => t.SportCategory)
                .HasForeignKey(t => t.SportCategoryId);

            modelBuilder.Entity<Team>()
                .HasMany(t => t.Players)
                .WithOne(p => p.Team)
                .HasForeignKey(p => p.TeamId);

            modelBuilder.Entity<PointTableEntry>()
                .HasOne(p => p.Team)
                .WithMany()
                .HasForeignKey(p => p.TeamId);
        }
    }
}