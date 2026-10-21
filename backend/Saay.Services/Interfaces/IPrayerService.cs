namespace Saay.Services.Interfaces
{
    public interface IPrayerService
    {
        public Task<List<string>> GetPrayersTime(DateOnly date, string latitude, string longitude);
    }
}
