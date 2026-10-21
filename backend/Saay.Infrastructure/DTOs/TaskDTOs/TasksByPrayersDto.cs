namespace Saay.Infrastructure.DTOs.TaskDTOs
{
    public class TasksByPrayersDto
    {
        public List<string> PrayerTimes { get; set; }
        public List<TaskDto> FajrTasks { get; set; }
        public List<TaskDto> DhuhaTasks { get; set; }
        public List<TaskDto> DhuhrTasks { get; set; }
        public List<TaskDto> AsrTasks { get; set; }
        public List<TaskDto> MaghribTasks { get; set; }
        public List<TaskDto> IshaTasks { get; set; }
        public List<TaskDto> TasksWithoutPrayers { get; set; }
    }
}
