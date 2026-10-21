using Saay.Infrastructure.DTOs.TaskDTOs;
using Saay.Repository.Interfaces;
using Saay.Services.Interfaces;

namespace Saay.Services.Classes
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPrayerService _prayerService;

        public TaskService(ITaskRepository taskRepository, IUserRepository userRepository, IPrayerService prayerService)
        {
            _taskRepository = taskRepository;
            _userRepository = userRepository;
            _prayerService = prayerService;
        }

        private byte _GetRepetitionDays(byte repetition)
        {
            return repetition switch
            {
                0 => 1,   // Once
                1 => 30,  // Daily
                2 => 4,   // Weekly
                3 => 12,  // Monthly
                _ => throw new ArgumentOutOfRangeException(nameof(repetition))
            };
        }

        public async Task<bool?> AddTaskAsync(AddTaskDto addTaskDto)
        {
            if(!await _userRepository.DoesUserExist(addTaskDto.UserId))
                return null; // User does not exist

            byte numOfDays = _GetRepetitionDays(addTaskDto.Repetition);

            Data.Entities.Task taskEntity = new Data.Entities.Task
            {
                UserId = addTaskDto.UserId,
                TaskCategoryId = addTaskDto.TaskCategoryId,
                Title = addTaskDto.Title,
                DueDate = addTaskDto.DueDate,
                DueTime = addTaskDto.DueTime
            };
            return await _taskRepository.AddTaskAsync(taskEntity, addTaskDto.UserId, numOfDays);
        }
    
        public async Task<List<TaskDto>> GetUserTasksTodayAsync(int userId, int pageNumber, int pageSize)
        {
            if(!await _userRepository.DoesUserExist(userId))
                return null; // User does not exist

            return await _taskRepository.GetUserTasksTodayAsync(userId, pageNumber, pageSize);
        }

        public async Task<List<TaskDto>> GetUserTasksTomorrowAsync(int userId, int pageNumber, int pageSize)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User does not exist

            return await _taskRepository.GetUserTasksTomorrowAsync(userId, pageNumber, pageSize);
        }

        public async Task<List<TaskDto>> GetUserTasksForWeekAsync(int userId, int pageNumber, int pageSize)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User does not exist

            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            int daysSinceSunday = (int)today.DayOfWeek;
            DateOnly weekStart = today.AddDays(-daysSinceSunday);
            DateOnly weekEnd = weekStart.AddDays(6);

            return await _taskRepository.GetUserTasksForWeekAsync(userId, pageNumber, pageSize, weekStart, weekEnd);
        }

        public async Task<int?> UserTasksCountAsync(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found

            return await _taskRepository.UserTasksCountAsync(userId);
        }

        public async Task<bool?> UpdateTaskAsync(UpdateTaskDto updateTaskDto)
        {
            Data.Entities.Task task = new Data.Entities.Task
            {
                TaskId = updateTaskDto.TaskId,
                TaskCategoryId = updateTaskDto.TaskCategoryId,
                Title = updateTaskDto.Title,
                DueDate = updateTaskDto.DueDate,
                DueTime = updateTaskDto.DueTime,
                IsDone = updateTaskDto.IsDone,
                IsReminderSent = updateTaskDto.IsReminderSent
            };

            return await _taskRepository.UpdateTaskAsync(updateTaskDto.TaskId, task);
        }

        public async Task<bool?> DeleteTaskAsync(int taskId) =>
            await _taskRepository.DeleteTaskAsync(taskId);

        public async Task<int?> UserCompletedTasksCountAsync(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found

            return await _taskRepository.UserCompletedTasksCount(userId);
        }

        public async Task<int?> UserPendingTasksCountAsync(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found
            return await _taskRepository.UserPendingTasksCount(userId);
        }

        public async Task<TaskDto> GetTaskByIdAsync(int taskId) =>
            await _taskRepository.GetTaskByIdAsync(taskId);

        public async Task<bool> IsTaskOwner(int userId, int taskId) =>
            await _taskRepository.IsTaskOwner(userId, taskId);

        public async Task<bool?> MarkTaskAsCompletedAsync(int taskId)
        {
            TaskDto task = await _taskRepository.GetTaskByIdAsync(taskId);

            if (task.IsDone)
                return await _taskRepository.MarkTaskAsUncompletedAsync(taskId);
           
            return await _taskRepository.MarkTaskAsCompletedAsync(taskId);
        }

        public async Task<byte?> UserProgressToday(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found
            int? completedTasksCount = await _taskRepository.UserCompletedTasksTodayCount(userId);
            int? totalTasks = await _taskRepository.UserTasksTodayCountAsync(userId);
            if (totalTasks == 0)
                return null;
            return (byte)((completedTasksCount.GetValueOrDefault() * 100) / totalTasks.GetValueOrDefault());
        }

        public async Task<byte?> UserCompletedTasksTodayCount(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found
            return await _taskRepository.UserCompletedTasksTodayCount(userId);
        }

        public async Task<byte?> UserPendingTasksTodayCount(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found
            return await _taskRepository.UserPendingTasksTodayCount(userId);
        }

        public async Task<byte?> UserUrgentTasksTodayCount(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found
            return await _taskRepository.UserUrgentTasksTodayCount(userId);
        }

        public async Task<byte?> UserTasksTodayCountAsync(int userId)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null; // User not found
            return await _taskRepository.UserTasksTodayCountAsync(userId);
        }

        public async Task<TasksByPrayersDto?> GetTasksByPrayersAsync(
            int userId,
            string latitude,
            string longitude)
        {
            if (!await _userRepository.DoesUserExist(userId))
                return null;

            DateOnly today = DateOnly.FromDateTime(DateTime.Today);

            List<string> prayersTime = await _prayerService.GetPrayersTime(
                today, latitude, longitude);

            return new TasksByPrayersDto
            {
                PrayerTimes = prayersTime,
                FajrTasks = await _taskRepository.GetTasksByPrayerAsync(userId, 0, today),
                DhuhaTasks = await _taskRepository.GetTasksByPrayerAsync(userId, 1, today),
                DhuhrTasks = await _taskRepository.GetTasksByPrayerAsync(userId, 2, today),
                AsrTasks = await _taskRepository.GetTasksByPrayerAsync(userId, 3, today),
                MaghribTasks = await _taskRepository.GetTasksByPrayerAsync(userId, 4, today),
                IshaTasks = await _taskRepository.GetTasksByPrayerAsync(userId, 5, today),
                TasksWithoutPrayers = await _taskRepository.GetTasksWithoutPrayerAsync(userId, today)
            };
        }
    }
}
