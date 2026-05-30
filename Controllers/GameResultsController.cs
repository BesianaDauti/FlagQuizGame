using FlagQuizGame.Data;
using FlagQuizGame.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace FlagQuizGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ResultsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SaveResult([FromBody] GameResults result)
        {
            _context.GameResults.Add(result);
            await _context.SaveChangesAsync();
            return Ok(result);
        }

        /*[HttpGet]
        public async Task<IActionResult> GetResults()
        {
            var results = await _context.GameResults
                .OrderByDescending(r => r.Score)
                .ToListAsync();

            return Ok(results);
        }*/
    }
}
