using Saay.Services.Interfaces;
using System.Text.Json;

namespace Saay.Services.Classes
{
    public class AladhanPrayerService : IPrayerService
    {
        private readonly HttpClient _client;

        public AladhanPrayerService(HttpClient client)
        {
            _client = client;
        }

        public async Task<List<string>> GetPrayersTime(
        DateOnly date,
        string latitude,
        string longitude)
        {
            string url =
                $"https://api.aladhan.com/v1/timings/{Uri.EscapeDataString(date.ToString("dd-MM-yyyy"))}" +
                $"?latitude={Uri.EscapeDataString(latitude)}" +
                $"&longitude={Uri.EscapeDataString(longitude)}" +
                "&method=3";

            using HttpResponseMessage response = await _client.GetAsync(url);

            response.EnsureSuccessStatusCode();

            await using Stream stream = await response.Content.ReadAsStreamAsync();

            using JsonDocument document = await JsonDocument.ParseAsync(stream);

            JsonElement timings = document.RootElement
                .GetProperty("data")
                .GetProperty("timings");

            string sunrise = timings.GetProperty("Sunrise").GetString()!;

            string dhuha = TimeSpan
                .Parse(sunrise)
                .Add(TimeSpan.FromMinutes(20))
                .ToString(@"hh\:mm");

            List<string> prayers = new()
            {
                timings.GetProperty("Fajr").GetString()!,
                dhuha,
                timings.GetProperty("Dhuhr").GetString()!,
                timings.GetProperty("Asr").GetString()!,
                timings.GetProperty("Maghrib").GetString()!,
                timings.GetProperty("Isha").GetString()!
            };

            return prayers;
        }
    }
}
