using Saay.Infrastructure.Validation;
using System.ComponentModel.DataAnnotations;

namespace Saay.Infrastructure.DTOs.UserDTOs
{
    public class UpdateUserDto
    {

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive integer.")]
        public int UserId { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "FirstName must be a string with a maximum length of 50 characters.")]
        public string FirstName { get; set; } = null!;
        [Required]
        [StringLength(50, ErrorMessage = "LastName must be a string with a maximum length of 50 characters.")]
        public string LastName { get; set; } = null!;

        [Required]
        [RegularExpression(ValidationRules.EMAIL_REGX, ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = null!;
    }
}
