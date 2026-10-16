
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Saay.Services.Interfaces;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Saay.Services;

public sealed class ImgBBImageStorageService : IImageStorageService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public ImgBBImageStorageService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;

        _apiKey = configuration["ImgBB_API_Key"]
            ?? throw new InvalidOperationException(
                "ImgBB API key is missing from configuration.");

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new InvalidOperationException(
                "ImgBB API key is missing from configuration.");
        }
    }

    public async Task<string> UploadAsync(IFormFile image)
    {
        if (image is null || image.Length == 0)
        {
            throw new ArgumentException(
                "The image cannot be empty.",
                nameof(image));
        }

        using var formData = new MultipartFormDataContent();
        using var imageStream = image.OpenReadStream();
        using var imageContent = new StreamContent(imageStream);

        imageContent.Headers.ContentType =
            new System.Net.Http.Headers.MediaTypeHeaderValue(
                string.IsNullOrWhiteSpace(image.ContentType)
                    ? "application/octet-stream"
                    : image.ContentType);

        formData.Add(imageContent, "image", image.FileName);

        string requestUrl =
            $"https://api.imgbb.com/1/upload?key={Uri.EscapeDataString(_apiKey)}";

        using HttpResponseMessage response = await _httpClient.PostAsync(
            requestUrl,
            formData);

        if (!response.IsSuccessStatusCode)
        {
            string error = await response.Content.ReadAsStringAsync();

            throw new HttpRequestException(
                $"ImgBB API returned {(int)response.StatusCode}: {error}");
        }

        ImgBBUploadResponse? result =
            await response.Content.ReadFromJsonAsync<ImgBBUploadResponse>();

        return result?.Data?.Url
            ?? throw new InvalidOperationException(
                "ImgBB returned no image URL.");
    }

    private sealed class ImgBBUploadResponse
    {
        [JsonPropertyName("data")]
        public ImgBBImageData? Data { get; set; }
    }

    private sealed class ImgBBImageData
    {
        [JsonPropertyName("url")]
        public string? Url { get; set; }
    }
}
