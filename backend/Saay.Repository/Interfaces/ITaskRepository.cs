using Saay.Infrastructure.DTOs.TaskDTOs;

namespace Saay.Repository.Interfaces
{
    public interface ITaskRepository
    {
        public Task<bool> AddTaskAsync(Data.Entities.Task task, int userId, byte repetation);

        public Task<List<TaskDto>> GetUserTasksTodayAsync(int userId, int pageNumber, int pageSize);

        public Task<List<TaskDto>> GetUserTasksTomorrowAsync(int userId, int pageNumber, int pageSize);

        public Task<List<TaskDto>> GetUserTasksForWeekAsync(int userId, int pageNumber, int pageSize, DateOnly weekStart, DateOnly weekEnd);

        public Task<int> UserTasksCountAsync(int userId);

        public Task<bool?> UpdateTaskAsync(int taskId, Data.Entities.Task newTask);

        public Task<bool?> DeleteTaskAsync(int taskId);

        public Task<byte> UserCompletedTasksCount(int userId);

        public Task<byte> UserPendingTasksCount(int userId);

        public Task<byte> UserCompletedTasksTodayCount(int userId);

        public Task<byte> UserPendingTasksTodayCount(int userId);

        public Task<byte> UserUrgentTasksTodayCount(int userId);

        public Task<TaskDto> GetTaskByIdAsync(int taskId);

        public Task<bool> IsTaskOwner(int userId, int taskId);

        public Task<bool?> MarkTaskAsCompletedAsync(int taskId);

        public Task<bool?> MarkTaskAsUncompletedAsync(int taskId);

        public Task<byte> UserTasksTodayCountAsync(int userId);

        public Task<List<TaskDto>> GetTasksByPrayerAsync(int userId, byte prayerNumber, DateOnly dueDate);
        
        public Task<List<TaskDto>> GetTasksWithoutPrayerAsync(int userId, DateOnly dueDate);
    }
}
