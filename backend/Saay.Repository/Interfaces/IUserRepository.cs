using Saay.Data.Entities;

namespace Saay.Repository.Interfaces
{
    public interface IUserRepository
    {
        public Task<int?> AddUserAsync(User user);
        public Task<bool> DoesEmailExist(string email);
        public Task<bool> IsEmailUsedByAnotherUser(int userId, string email);
        public Task<bool?> DeleteUserAsync(int userId);
        public Task<bool?> UpdateMissionAsync(int userId, string newMission);
        public Task<bool?> UpdateUserAsync(int userId, User newUser);
        public Task<bool> DoesUserExist(int userId);
        public Task<bool?> UpdatePasswordAsync(int userId, string newPasswordHash);
        public Task<User?> GetUserByIdAsync(int userId);
        public Task<User?> GetUserByEmailAsync(string email);
        public Task<bool> IsEmailOwner(int userId, string email);
        public Task<string?> GetUserMission(int userId);
        public Task<string?> GetNameAsync(int userId);
        public Task<bool?> UpdateConfirmation(int userId, bool isConfirmed);
        public Task<string?> GetUserEmailAsync(int userId);
        public Task<bool?> UpdateConfirmationStatusAsync(string token);
        public System.Threading.Tasks.Task BeginTransactionAsync();
        public System.Threading.Tasks.Task CommitTransactionAsync();
        public System.Threading.Tasks.Task RollbackTransactionAsync();
        public Task<bool?> IsConfirmedAsync(int userId);
        public Task<int> GetUserIdByEmailAsync(string email);
        public Task<string?> GetNameAsync(string email);
        public Task<bool?> UpdateProfilePictureAsync(int userId, string? newProfilePicture);

        public Task<bool?> DeleteProfilePictureAsync(int userId);
    }
}
