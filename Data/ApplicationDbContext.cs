using FlagQuizGame.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace FlagQuizGame.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<GameResults> GameResults { get; set; }
    }
}
