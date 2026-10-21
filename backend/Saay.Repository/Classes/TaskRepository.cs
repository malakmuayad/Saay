using Microsoft.EntityFrameworkCore;
using Saay.Data;
using Saay.Infrastructure.DTOs.TaskDTOs;
using Saay.Repository.Interfaces;

namespace Saay.Repository.Classes
{
    public class TaskRepository : ITaskRepository
    {
        private readonly SaayContext _context;

        public TaskRepository(SaayContext context)
        {
            _context = context;
        }

        private async Task<bool> _AddTaskOnce(Data.Entities.Task task, int userId)
        {
            Data.Entities.Task newTask = new Data.Entities.Task
            {
                UserId = userId,
                TaskCategoryId = task.TaskCategoryId,
                Title = task.Title,
                DueDate = task.DueDate,
                DueTime = task.DueTime,
                IsDone = false,
                IsReminderSent = false
            };
            _context.Tasks.Add(newTask);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> AddTaskAsync(Data.Entities.Task task, int userId, byte repetition)
        {
            if (repetition == 1) return await _AddTaskOnce(task, userId);

            List<Data.Entities.Task> tasks = new List<Data.Entities.Task>();

            // Weekly -> Add the task once each week for a month (4 weeks)
            if (repetition == 4)
            {
                for(byte i = 0; i <= 3; i++)
                {
                    tasks.Add(
                        new Data.Entities.Task
                        {
                            UserId = userId,
                            TaskCategoryId = task.TaskCategoryId,
                            Title = task.Title,
                            DueDate = task.DueDate.AddDays(i * 7),
                            DueTime = task.DueTime,
                            IsDone = false,
                            IsReminderSent = false
                        }
                    );
                }
            }

            // Monthly -> Add the task once each month for a year (12 months)
            if (repetition == 12)
            {
                for (byte i = 0; i < 12; i++)
                {
                    tasks.Add(
                        new Data.Entities.Task
                        {
                            UserId = userId,
                            TaskCategoryId = task.TaskCategoryId,
                            Title = task.Title,
                            DueDate = task.DueDate.AddMonths(i),
                            DueTime = task.DueTime,
                            IsDone = false,
                            IsReminderSent = false
                        }
                    );
                }
            }

            else if(repetition == 30)
            {
                for (byte i = 1; i <= repetition; i++)
                {
                    tasks.Add(
                        new Data.Entities.Task
                        {
                            UserId = userId,
                            TaskCategoryId = task.TaskCategoryId,
                            Title = task.Title,
                            DueDate = task.DueDate.AddDays(i - 1),
                            DueTime = task.DueTime,
                            IsDone = false,
                            IsReminderSent = false
                        }
                    );
                }
            }

            _context.Tasks.AddRange(tasks);
            
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<TaskDto>> GetUserTasksTodayAsync(int userId,
            int pageNumber, int pageSize) =>
            await _context.Tasks
                .Where(task => task.UserId == userId &&
                    task.DueDate == DateOnly.FromDateTime(DateTime.Today))
                .Select(task => new TaskDto
                {
                    TaskId = task.TaskId,
                    TaskCategoryTitle = task.TaskCategory.Title,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    DueDate = task.DueDate,
                    DueTime = task.DueTime
                })
                .OrderBy(task => task.DueTime == null)
                .ThenBy(task => task.DueTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

        public async Task<List<TaskDto>> GetUserTasksTomorrowAsync(int userId, int pageNumber, int pageSize) =>
             await _context.Tasks
                .Where(task => task.UserId == userId &&
                    task.DueDate == DateOnly.FromDateTime(DateTime.Today.AddDays(1)))
                .Select(task => new TaskDto
                {
                    TaskId = task.TaskId,
                    TaskCategoryTitle = task.TaskCategory.Title,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    DueDate = task.DueDate,
                    DueTime = task.DueTime
                })
                .OrderBy(task => task.DueTime == null)
                .ThenBy(task => task.DueTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

        public async Task<List<TaskDto>> GetUserTasksForWeekAsync(
        int userId, int pageNumber, int pageSize, DateOnly weekStart, DateOnly weekEnd)
        {
            return await _context.Tasks
                .Where(task =>
                    task.UserId == userId &&
                    task.DueDate >= weekStart &&
                    task.DueDate <= weekEnd)
                .Select(task => new TaskDto
                {
                    TaskId = task.TaskId,
                    TaskCategoryTitle = task.TaskCategory.Title,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    DueDate = task.DueDate,
                    DueTime = task.DueTime
                })
                .OrderBy(task => task.DueDate)
                .ThenBy(task => task.DueTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<byte> UserTasksTodayCountAsync(int userId) =>
            (byte)await _context.Tasks
                .Where(task => task.UserId == userId &&
                    task.DueDate == DateOnly.FromDateTime(DateTime.Today))
                .CountAsync();

        public async Task<int> UserUrgentTasksTodayCountAsync(int userId) =>
            await _context.Tasks.Where(task => task.UserId == userId &&
                    task.DueDate == DateOnly.FromDateTime(DateTime.Today) &&
                    task.TaskCategoryId == 3)
                .CountAsync();

        public async Task<bool?> UpdateTaskAsync(int taskId, Data.Entities.Task newTask)
        {
            Data.Entities.Task task = await _context.Tasks.FindAsync(taskId);

            if (task == null) return null; // Task not found

            task.TaskCategoryId = newTask.TaskCategoryId;
            task.Title = newTask.Title;
            task.DueDate = newTask.DueDate;
            task.DueTime = newTask.DueTime;
            task.IsDone = newTask.IsDone;
            task.IsReminderSent = newTask.IsReminderSent;

            return await _context.SaveChangesAsync() >= 0;
        }

        public async Task<bool?> DeleteTaskAsync(int taskId)
        {
            Data.Entities.Task task = await _context.Tasks.FindAsync(taskId);
            if (task == null) return null;
            _context.Tasks.Remove(task);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<byte> UserCompletedTasksTodayCount(int userId) =>
             (byte)await _context.Tasks
                .Where(task => task.UserId == userId && task.IsDone && task.DueDate == DateOnly.FromDateTime(DateTime.Today))
                .CountAsync();

        public async Task<byte> UserPendingTasksTodayCount(int userId) =>
             (byte)await _context.Tasks
                .Where(task => task.UserId == userId && !task.IsDone && task.DueDate == DateOnly.FromDateTime(DateTime.Today))
                .CountAsync();

        public async Task<byte> UserUrgentTasksTodayCount(int userId) =>
            (byte)await _context.Tasks
                .Where(task => task.UserId == userId 
                && task.DueDate == DateOnly.FromDateTime(DateTime.Today)
                && task.TaskCategoryId == 3)
                .CountAsync();

        public async Task<TaskDto> GetTaskByIdAsync(int taskId) =>
            await _context.Tasks
            .Select(task => new TaskDto
            {
                TaskId = task.TaskId,
                TaskCategoryTitle = task.TaskCategory.Title,
                Title = task.Title,
                IsDone = task.IsDone
            })
            .FirstOrDefaultAsync(task => task.TaskId == taskId);

        public async Task<bool?> MarkTaskAsCompletedAsync(int taskId)
        {
            Data.Entities.Task task = await _context.Tasks.FindAsync(taskId);

            if (task == null) return null; // Task not found

            task.IsDone = true;
            return await _context.SaveChangesAsync() >= 0;
        }

        public async Task<bool?> MarkTaskAsUncompletedAsync(int taskId)
        {
            Data.Entities.Task task = await _context.Tasks.FindAsync(taskId);

            if (task == null) return null; // Task not found

            task.IsDone = false;
            return await _context.SaveChangesAsync() >= 0;
        }

        public async Task<bool> IsTaskOwner(int userId, int taskId) =>
            await _context.Tasks.AnyAsync(t => t.UserId == userId && t.TaskId == taskId);

        public async Task<int> UserTasksCountAsync(int userId) =>
            await _context.Tasks
                .Where(t => t.UserId == userId)
                .CountAsync();

        public async Task<byte> UserCompletedTasksCount(int userId) =>
            (byte)await _context.Tasks
                .Where(t => t.UserId == userId && t.IsDone)
                .CountAsync();

        public async Task<byte> UserPendingTasksCount(int userId) =>
            (byte)await _context.Tasks
                .Where(t => t.UserId == userId && !t.IsDone)
                .CountAsync();

        public async Task<List<TaskDto>> GetTasksByPrayerAsync(int userId, byte prayerNumber, DateOnly dueDate)
        {
            List<Data.Entities.Task> tasks =
             await _context.Tasks
             .Include(t => t.TaskCategory)
             .Where(t => t.UserId == userId && t.PrayerNumber == prayerNumber && t.DueDate == dueDate)
             .ToListAsync();

            List<TaskDto> taskDtos = new List<TaskDto>();

            foreach(Data.Entities.Task task in tasks) {
                taskDtos.Add(new TaskDto
                {
                    TaskId = task.TaskId,
                    TaskCategoryTitle = task.TaskCategory.Title,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    DueDate = task.DueDate,
                    DueTime = task.DueTime
                });
            }
            return taskDtos;
        }

        public async Task<List<TaskDto>> GetTasksWithoutPrayerAsync(int userId, DateOnly dueDate)
        {
            List<Data.Entities.Task> tasks =
             await _context.Tasks
             .Include(t => t.TaskCategory)
             .Where(t => t.UserId == userId && t.PrayerNumber == null && t.DueDate == dueDate)
             .ToListAsync();

            List<TaskDto> taskDtos = new List<TaskDto>();

            foreach (Data.Entities.Task task in tasks)
            {
                taskDtos.Add(new TaskDto
                {
                    TaskId = task.TaskId,
                    TaskCategoryTitle = task.TaskCategory.Title,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    DueDate = task.DueDate,
                    DueTime = task.DueTime
                });
            }
            return taskDtos;
        }

    }
}
