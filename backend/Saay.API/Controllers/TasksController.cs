using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Infrastructure.DTOs.CategoryDTOs;
using Saay.Infrastructure.DTOs.TaskDTOs;
using Saay.Infrastructure.DTOs.UserDTOs;
using Saay.Services.Interfaces;
using System.Security.Claims;

namespace Saay.API.Controllers
{
    [Route("api/saay/tasks")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly ITaskCategoryService _taskCategoryService;
        private readonly IOwnershipAuthorizationService _ownershipAuthorizationService;
        private readonly ILogger<TasksController> _logger;

        public TasksController(ITaskService taskService, ITaskCategoryService taskCategoryService,
            IOwnershipAuthorizationService ownershipAuthorizationService, ILogger<TasksController> logger)
        {
            _taskService = taskService;
            _taskCategoryService = taskCategoryService;
            _ownershipAuthorizationService = ownershipAuthorizationService;
            _logger = logger;
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> AddTaskAsync(AddTaskDto addTaskDto)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, addTaskDto.UserId))
            {
                _logger.LogWarning("User {UserId} attmpted to add a task without ownership.",
                   addTaskDto.UserId);
                return Forbid();
            }

            bool? result = await _taskService.AddTaskAsync(addTaskDto);

            if (result == null)
                return NotFound("User with the specified ID does not exist.");

            return Ok(result);
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("today/{userId}/{pageNumber}/{pageSize}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<ICollection<TaskDto>>> GetUserTasksTodayAsync(int userId, int pageNumber = 1, int pageSize = 10)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to get a task without ownership.",
                   userId);
                return Forbid();
            }

            List<TaskDto> tasks = await _taskService.GetUserTasksTodayAsync(userId, pageNumber, pageSize);

            if (tasks == null)
                return NotFound("User with the specified ID does not exist.");

            return Ok(tasks);
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("tomorrow/{userId}/{pageNumber}/{pageSize}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<ICollection<TaskDto>>> GetUserTasksTomorrowAsync(int userId, int pageNumber = 1, int pageSize = 10)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to get a task without ownership.",
                   userId);
                return Forbid();
            }

            List<TaskDto> tasks = await _taskService.GetUserTasksTomorrowAsync(userId, pageNumber, pageSize);

            if (tasks == null)
                return NotFound("User with the specified ID does not exist.");

            return Ok(tasks);
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("week/{userId}/{pageNumber}/{pageSize}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<ICollection<TaskDto>>> GetUserTasksForWeekAsync(int userId, int pageNumber = 1, int pageSize = 10)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to get a task without ownership.",
                   userId);
                return Forbid();
            }

            List<TaskDto> tasks = await _taskService.GetUserTasksForWeekAsync(userId, pageNumber, pageSize);

            if (tasks == null)
                return NotFound("User with the specified ID does not exist.");

            return Ok(tasks);
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> UpdateTask(UpdateTaskDto updateTaskDto)
        {
            int userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!await _ownershipAuthorizationService.IsTaskOwner(User, updateTaskDto.TaskId))
            {
                _logger.LogWarning("User {userId} attmpted to update a task without ownership.",
                   userId);
                return Forbid();
            }

            bool? result = await _taskService.UpdateTaskAsync(updateTaskDto);
            if (result == null)
                return NotFound("Task with the specified ID does not exist.");

            if (result == false)
                return StatusCode(500, "An error occurred while updating the task.");

            return Ok(result);
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpDelete("{taskId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            int userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!await _ownershipAuthorizationService.IsTaskOwner(User, taskId))
            {
                _logger.LogWarning("User {userId} attmpted to delete a task without ownership.",
                   userId);
                return Forbid();
            }

            bool? result = await _taskService.DeleteTaskAsync(taskId);
            if (result == null)
                return NotFound("Task with the specified ID does not exist.");
            if (result == false)
                return StatusCode(500, "An error occurred while deleting the task.");
            return Ok(result);
        }
        
        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("{taskId}", Name = "GetTaskById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<TaskDto>> GetTaskByIdAsync(int taskId)
        {
            int userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!await _ownershipAuthorizationService.IsTaskOwner(User, taskId))
            {
                _logger.LogWarning("User {userId} attmpted to get a task without ownership.",
                   userId);
                return Forbid();
            }

            TaskDto task = await _taskService.GetTaskByIdAsync(taskId);
            if (task == null)
                return NotFound("Task with the specified ID does not exist.");
            return Ok(task);
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [HttpGet("categories")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<ICollection<TaskCategoryDto>>> GetAllTasksCategoriesAsync()
        {
            List<TaskCategoryDto> tasksCategories = await _taskCategoryService.GetAllTasksCategoriesAsync();

            if (tasksCategories == null)
                return NotFound("No categories found.");

            return Ok(tasksCategories);
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpPut("mark-completed/{taskId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> MarkTaskAsCompleted(int taskId)
        {
            int userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!await _ownershipAuthorizationService.IsTaskOwner(User, taskId))
            {
                _logger.LogWarning("User {userId} attmpted to update a task without ownership.",
                   userId);
                return Forbid();
            }

            bool? result = await _taskService.MarkTaskAsCompletedAsync(taskId);
            if (result == null)
                return NotFound("Task with the specified ID does not exist.");

            if (result == false)
                return StatusCode(500, "An error occurred while updating the task.");

            return Ok(result);
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("{userId}/{latitude}/{longitude}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<TasksByPrayersDto>> GetTasksByPrayersAsync(int userId, string latitude, string longitude)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to gete tasks by prayer without ownership.",
                   userId);
                return Forbid();
            }

            TasksByPrayersDto result = await _taskService.GetTasksByPrayersAsync(userId, latitude, longitude);

            if (result == null)
                return NotFound("User not found");

            return Ok(result);
        }
    }
}
