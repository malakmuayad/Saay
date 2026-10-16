using Saay.Infrastructure.DTOs.UserDTOs;

namespace Saay.Services.Interfaces
{
    public interface IUserService
    {
        public Task<int?> AddUserAsync(AddUserDto addUserDto);
        public Task<bool?> DeleteUserAsync(int userId);
        public Task<bool?> UpdateMissionAsync(UpdateMissionDto updateMissionDto);
        public Task<bool?> UpdateUserAsync(UpdateUserDto updateUserDto);
        public Task<bool?> UpdatePasswordAsync(UpdatePasswordDto updatePasswordDto);
        public Task<GetUserDto?> GetUserByIdAsync(int userId);
        public Task<GetUserDto?> GetUserByEmailAsync(string email);
        public Task<LoginUserDto?> FindUserByEmailAsync(string email);
        public Task<LoginUserDto?> FindUserByIdAsync(int userId);
        public Task<bool> IsEmailOwner(int userId, string email);
        public Task<string?> GetUserMissionAsync(int userId);
        public Task<string?> GetUserEmailAsync(int userId);
        public Task<bool?> UpdateConfirmationStatusAsync(string token);
        public Task<bool?> IsConfirmedAsync(int userId);
        public Task<bool> DoesEmailExist(string email);
        public Task<int?> GetUserIdByEmailAsync(string email);
        public Task<string?> GetNameAsync(string email);
        public Task<bool?> ResendConfirmationEmailAsync(string email);
        public Task<string?> GetNameAsync(int userId);
        public Task<bool?> UpdateProfilePictureAsync(UpdateProfilePictureDto updateProfilePictureDto);
        public Task<bool?> DeleteProfilePictureAsync(int userId);
    }
}
