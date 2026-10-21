using Saay.Infrastructure.DTOs.TaskDTOs;

namespace Saay.Services.Interfaces
{
    public interface ITaskService
    {
        public Task<bool?> AddTaskAsync(AddTaskDto addTaskDto);

        public Task<List<TaskDto>> GetUserTasksTodayAsync(int userId, int pageNumber, int pageSize);
        public Task<List<TaskDto>> GetUserTasksTomorrowAsync(int userId, int pageNumber, int pageSize);
        public Task<List<TaskDto>> GetUserTasksForWeekAsync(int userId, int pageNumber, int pageSize);

        public Task<int?> UserTasksCountAsync(int userId);

        public Task<bool?> UpdateTaskAsync(UpdateTaskDto updateTaskDto);

        public Task<bool?> DeleteTaskAsync(int taskId);

        public Task<int?> UserCompletedTasksCountAsync(int userId);

        public Task<int?> UserPendingTasksCountAsync(int userId);

        public Task<TaskDto> GetTaskByIdAsync(int taskId);

        public Task<bool?> MarkTaskAsCompletedAsync(int taskId);

        public Task<bool> IsTaskOwner(int userId, int taskId);

        public Task<byte?> UserProgressToday(int userId);

        public Task<byte?> UserCompletedTasksTodayCount(int userId);

        public Task<byte?> UserPendingTasksTodayCount(int userId);

        public Task<byte?> UserUrgentTasksTodayCount(int userId);

        public Task<byte?> UserTasksTodayCountAsync(int userId);

        public Task<TasksByPrayersDto> GetTasksByPrayersAsync(int userId, string latitude, string longitude);
    }
}
