using System.ComponentModel.DataAnnotations;

public sealed class AIChatRequestDto
{
    [Required]
    public List<AIChatMessageDto> Messages { get; set; }
}

public sealed class AIChatMessageDto {

    [Required]
    public string Role { get; set; }
    [Required]
    public string Content { get; set; }
};