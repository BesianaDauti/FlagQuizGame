using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json;

namespace FlagQuizGame.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlagsController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public FlagsController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpGet("{continent}")]
        public async Task<IActionResult> GetFlags(string continent)
        {
            var continentMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["africa"] = "africa",
                ["asia"] = "asia",
                ["europe"] = "europe",
                ["north-america"] = "americas",
                ["south-america"] = "americas",
                ["australia"] = "oceania",
                ["antarctica"] = "antarctic"
            };

            try
            {
                List<string> urls = new();

                if (continent.Equals("all", StringComparison.OrdinalIgnoreCase))
                {
                    urls.Add("https://restcountries.com/v3.1/region/africa");
                    urls.Add("https://restcountries.com/v3.1/region/asia");
                    urls.Add("https://restcountries.com/v3.1/region/europe");
                    urls.Add("https://restcountries.com/v3.1/region/americas");
                    urls.Add("https://restcountries.com/v3.1/region/oceania");
                    urls.Add("https://restcountries.com/v3.1/region/antarctic");
                }
                else
                {
                    if (continentMap.ContainsKey(continent))
                        continent = continentMap[continent];

                    urls.Add($"https://restcountries.com/v3.1/region/{continent.ToLower()}");
                }

                var countries = new List<object>();

                var tasks = urls.Select(async url =>
                {
                    var response = await _httpClient.GetAsync(url);

                    if (!response.IsSuccessStatusCode)
                        return;

                    var json = await response.Content.ReadAsStringAsync();
                    var data = JsonDocument.Parse(json).RootElement.EnumerateArray();

                    lock (countries)
                    {
                        foreach (var country in data)
                        {
                            try
                            {
                                string name = country.GetProperty("name").GetProperty("common").GetString() ?? "";
                                string flag = country.GetProperty("flags").GetProperty("png").GetString() ?? "";

                                if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(flag))
                                    countries.Add(new { name, flag });
                            }
                            catch
                            {
                            }
                        }
                    }
                });

                await Task.WhenAll(tasks);

                return Ok(countries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching data: {ex.Message}");
            }
        }
    }
}
