using Microsoft.AspNetCore.Http;
using Saay.Infrastructure.Validation;
using System.ComponentModel.DataAnnotations;

namespace Saay.Infrastructure.DTOs.UserDTOs
{
    public class AddUserRequestDto
    {

        [Required]
        [MaxLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string FirstName { get; set; } = null!;

        [Required]
        [MaxLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string LastName { get; set; } = null!;

        [Required]
        [RegularExpression(ValidationRules.EMAIL_REGX, ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = null!;

        [Required]
        [RegularExpression(ValidationRules.PASSWORD_REGX,
            ErrorMessage = "Password must contain at least one uppercase letter," +
            " one lowercase letter, one digit, and one special character.")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        public string Password { get; set; } = null!;

        public IFormFile? ProfilePicture { get; set; }
    }
}
