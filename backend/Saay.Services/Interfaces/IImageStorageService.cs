using Microsoft.AspNetCore.Http;

namespace Saay.Services.Interfaces
{
    public interface IImageStorageService
    {
        public Task<string> UploadAsync(IFormFile img);
    }
}
