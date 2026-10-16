using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Saay.Infrastructure.DTOs.UserDTOs
{
    public class UpdateProfilePictureDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive integer.")]
        public int UserId { get; set; }
        public IFormFile? NewProfilePicture { get; set; }
    }
}
