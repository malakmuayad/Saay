using Microsoft.AspNetCore.Http;

namespace Saay.Infrastructure.Validation
{
    public static class ValidationRules
    {
        public const string PASSWORD_REGX = @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z\d\s]).{8,}$";
        public const string EMAIL_REGX = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";

        public static bool ValidateImageFormat(IFormFile? image) =>
                image == null ? true : (image != null &&
                (image.ContentType == "image/jpeg" ||
                image.ContentType == "image/png"));
    }
}
