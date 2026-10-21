using System.ComponentModel.DataAnnotations;

namespace Saay.Infrastructure.DTOs.TaskDTOs
{
    public class TasksByPrayersRequestDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive integer.")]

        public int UserId { get; set; }

        [Required]
        public string Latitude { get; set; }

        [Required]
        public string Longitude { get; set; }
    }
}
