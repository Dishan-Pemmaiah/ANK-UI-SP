using anjk_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace anjk_api.Data
{
    public static class SeedData
    {
        public static void Seed(AppDbContext context)
        {
            if (context.AppUsers.Any())
            {
                return;
            }

            var admin = new AppUser
            {
                FullName = "ANK Admin",
                Email = "admin@ank.org",
                Role = "Admin",
                MembershipStatus = "Active",
                MembershipExpires = DateTime.UtcNow.AddYears(1),
                PasswordHash = ""
            };
            var member = new AppUser
            {
                FullName = "Rahul Kumar",
                Email = "rahul@ank.org",
                Role = "Member",
                MembershipStatus = "Active",
                MembershipExpires = DateTime.UtcNow.AddYears(1),
                PasswordHash = ""
            };

            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<AppUser>();
            admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin123!");
            member.PasswordHash = passwordHasher.HashPassword(member, "Member123!");

            context.AppUsers.AddRange(admin, member);

            context.SportCategories.AddRange(
                new SportCategory { Name = "Football", Description = "Football teams and competitions." },
                new SportCategory { Name = "Kabaddi", Description = "Kabaddi tournaments and league." }
            );

            context.NewsItems.AddRange(
                new NewsItem { Title = "ANK Tournament Announced", Content = "The annual ANK sports festival will be held next month.", PublishedOn = DateTime.UtcNow.AddDays(-10), IsFeatured = true },
                new NewsItem { Title = "Membership Renewal Open", Content = "Renew your membership for the upcoming season.", PublishedOn = DateTime.UtcNow.AddDays(-4), IsFeatured = false }
            );

            context.GalleryItems.AddRange(
                new GalleryItem { Title = "Football Finals", ImageUrl = "https://example.com/images/football-final.jpg" },
                new GalleryItem { Title = "Kabaddi Training", ImageUrl = "https://example.com/images/kabaddi-training.jpg" }
            );

            context.Events.AddRange(
                new Event { Name = "ANK Football Cup", Description = "Paid tournament for local football teams.", Category = "Football", Location = "Anjigeri Ground", StartDate = DateTime.UtcNow.AddDays(10), EndDate = DateTime.UtcNow.AddDays(12), Fee = 300M, IsPaid = true, IsPublished = true },
                new Event { Name = "Community Yoga Day", Description = "Free wellness event for families.", Category = "Health", Location = "Club Hall", StartDate = DateTime.UtcNow.AddDays(7), EndDate = DateTime.UtcNow.AddDays(7), Fee = 0M, IsPaid = false, IsPublished = true }
            );

            context.CommitteeMembers.AddRange(
                new CommitteeMember { Name = "Rahul Kumar", Role = "President", Description = "Leads the committee and oversees community initiatives." },
                new CommitteeMember { Name = "Meera Patil", Role = "Secretary", Description = "Coordinates event planning and member outreach." },
                new CommitteeMember { Name = "Suresh Babu", Role = "Treasurer", Description = "Manages funds and event sponsorships." }
            );

            context.HeritageItems.AddRange(
                new HeritageItem { Title = "Kailpodh", Description = "A festival of weapons and sports that honors martial heritage." },
                new HeritageItem { Title = "Puttari Festival", Description = "A harvest celebration that unites the Kodava villages." },
                new HeritageItem { Title = "Temple Rituals", Description = "Traditional ceremonies and clan gatherings that preserve Kodava identity." }
            );

            context.HallOfFameItems.AddRange(
                new HallOfFameItem { Title = "Armed Forces", Description = "Honoring servicemen and women from the Anjigeri Naad community." },
                new HallOfFameItem { Title = "Sports Champions", Description = "Recognizing athletes who have excelled in regional and national competitions." },
                new HallOfFameItem { Title = "Education Leaders", Description = "Celebrating alumni who have advanced education and civic leadership." }
            );

            context.Villages.AddRange(
                new Village { Name = "Hudikeri", Description = "Hudikeri is one of the nine villages, known for its Kodava culture and vibrant sports participation." },
                new Village { Name = "Konageri", Description = "Konageri supports community events and village traditions in the Naad." },
                new Village { Name = "Hysudloor", Description = "Hysudloor embraces Kodava customs and local festivals." },
                new Village { Name = "Begur", Description = "Begur is a historic village within Anjigeri Naad, rich in heritage." },
                new Village { Name = "Mugutageri", Description = "Mugutageri preserves local craftsmanship and family traditions." },
                new Village { Name = "Nadikeri", Description = "Nadikeri is a village with deep Kodava roots and communal spirit." },
                new Village { Name = "Thuchamakeri", Description = "Thuchamakeri maintains strong community bonds through sport and culture." },
                new Village { Name = "Chikkamundur", Description = "Chikkamundur contributes actively to local events and sports programs." },
                new Village { Name = "Baliamandur", Description = "Baliamandur is known for its festive gatherings and Kodava hospitality." }
            );

            context.SaveChanges();
        }
    }
}
