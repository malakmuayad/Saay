using Saay.Data.Entities;
using Saay.Infrastructure.DTOs.UserDTOs;
using Saay.Repository.Interfaces;
using Saay.Services.Interfaces;

namespace Saay.Services.Classes
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;
        private readonly IEmailConfirmationRepository _emailConfirmationRepository;
        private readonly ITokenService _tokenService;
        private readonly IHashService _hashService;

        public UserService(IUserRepository userRepository, IPasswordHasher passwordHasher, IEmailService emailService, IEmailConfirmationRepository emailConfirmationRepository, ITokenService tokenService, IHashService hashService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
            _emailConfirmationRepository = emailConfirmationRepository;
            _tokenService = tokenService;
            _hashService = hashService;
        }

        public async Task<int?> AddUserAsync(AddUserDto addUserDto)
        {
            if (await _userRepository.DoesEmailExist(addUserDto.Email))
                return null;

            await _userRepository.BeginTransactionAsync();

            try
            {
                User user = new User
                {
                    FirstName = addUserDto.FirstName,
                    LastName = addUserDto.LastName,
                    Email = addUserDto.Email,
                    PasswordHash = _passwordHasher.HashToken(addUserDto.Password),
                    ProfilePictureUrl = addUserDto.ProfilePictureURL,
                    IsConfirmed = false
                };

                int? result = await _userRepository.AddUserAsync(user);

                if (result is null or <= 0)
                {
                    await _userRepository.RollbackTransactionAsync();
                    return null;
                }

                // Generate a secure confirmation token.
                string token = _tokenService.GenerateEmailConfirmationToken();

                var confirmationToken = new EmailConfirmationToken
                {
                    UserId = user.UserId,
                    TokenHash = _hashService.HashToken(token),
                    ExpiresAt = DateTime.UtcNow.AddHours(24)
                };

                // Save the token hash through the repository.
                await _emailConfirmationRepository
                    .AddConfirmationTokenAsync(confirmationToken);

                // Include the raw token in the email URL.
                string confirmationUrl =
                    $"https://saay.vercel.app/confirm?token={Uri.EscapeDataString(token)}";

                bool emailSent = await _emailService.SendConfirmationEmailAsync(
                    user.Email,
                    "Confirm Your Saay Account",
                    user.FirstName,
                    confirmationUrl
                );

                if (!emailSent)
                {
                    await _userRepository.RollbackTransactionAsync();
                    return null;
                }

                await _userRepository.CommitTransactionAsync();

                return user.UserId;
            }
            catch
            {
                await _userRepository.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<bool?> ResendConfirmationEmailAsync(string email)
        {
            if (!await _userRepository.DoesEmailExist(email))
                return null;

            int? userId = await _userRepository.GetUserIdByEmailAsync(email);

            if (userId == null) return null;

            string? name = await _userRepository.GetNameAsync(email);

            if (name == null) return null;

            string token = _tokenService.GenerateEmailConfirmationToken();

            var confirmationToken = new EmailConfirmationToken
            {
                UserId = (int)userId,
                TokenHash = _hashService.HashToken(token),
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            // Save the token hash through the repository.
            await _emailConfirmationRepository
                .AddConfirmationTokenAsync(confirmationToken);

            // Include the raw token in the email URL.
            string confirmationUrl =
                $"https://saay.vercel.app/confirm?token={Uri.EscapeDataString(token)}";

            return await _emailService.SendConfirmationEmailAsync(
                email,
                "Confirm Your Saay Account",
                name,
                confirmationUrl
            );
        }
        public async Task<bool?> DeleteUserAsync(int userId) => await _userRepository.DeleteUserAsync(userId);

        public async Task<bool?> UpdateMissionAsync(UpdateMissionDto updateMissionDto) =>
            await _userRepository.UpdateMissionAsync(updateMissionDto.UserId, updateMissionDto.NewMission);
    
        public async Task<bool?> UpdateUserAsync(UpdateUserDto updateUserDto)
        {
            if (!await _userRepository.DoesUserExist(updateUserDto.UserId))
                return null; // User does not exist

            if (await _userRepository.IsEmailUsedByAnotherUser(updateUserDto.UserId, updateUserDto.Email))
                return false; // Email is already used by another user

            User user = new User
            {
                FirstName = updateUserDto.FirstName,
                LastName = updateUserDto.LastName,
                Email = updateUserDto.Email,
                ProfilePictureUrl = updateUserDto.ProfilePictureUrl
            };
            return await _userRepository.UpdateUserAsync(updateUserDto.UserId, user);
        }

        public async Task<bool?> UpdatePasswordAsync(UpdatePasswordDto updatePasswordDto)
        {
            if (!await _userRepository.DoesUserExist(updatePasswordDto.UserId))
                return null; // User does not exist

            string hashedPassword = _passwordHasher.HashToken(updatePasswordDto.NewPassword); // hash new password before storing it
            return await _userRepository.UpdatePasswordAsync(updatePasswordDto.UserId, hashedPassword);
        }

        private GetUserDto? MapUserToGetUserDto(User user)
        {
            if (user == null) return null;

            return new GetUserDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Mission = user.Mission
            };
        }

        public async Task<GetUserDto?> GetUserByIdAsync(int userId)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            return MapUserToGetUserDto(user);
        }

        public async Task<GetUserDto?> GetUserByEmailAsync(string email)
        {
            User? user = await _userRepository.GetUserByEmailAsync(email);
            return MapUserToGetUserDto(user);
        }

        public async Task<LoginUserDto?> FindUserByEmailAsync(string email)
        {
            User? user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null) return null;
            return new LoginUserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                PasswordHash = user.PasswordHash
            };
        }

        public async Task<LoginUserDto?> FindUserByIdAsync(int userId)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return null;
            return new LoginUserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                PasswordHash = user.PasswordHash
            };
        }


        public async Task<bool> IsEmailOwner(int userId, string email) =>
            await _userRepository.IsEmailOwner(userId, email);

        public async Task<string?> GetUserMissionAsync(int userId) =>
            await _userRepository.GetUserMission(userId);

        public async Task<string?> GetUserEmailAsync(int userId) =>
            await _userRepository.GetUserEmailAsync(userId);

        public async Task<bool?> UpdateConfirmationStatusAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            string tokenHash = _hashService.HashToken(token);

            return await _userRepository.UpdateConfirmationStatusAsync(tokenHash);
        }

        public Task<bool?> IsConfirmedAsync(int userId) =>
            _userRepository.IsConfirmedAsync(userId);

        public Task<bool> DoesEmailExist(string email) =>
            _userRepository.DoesEmailExist(email);

        public async Task<int?> GetUserIdByEmailAsync(string email)
        {
            if(!await _userRepository.DoesEmailExist(email))
                return null;
            return await _userRepository.GetUserIdByEmailAsync(email);
        }

        public async Task<string?> GetNameAsync(string email) =>
            await _userRepository.GetNameAsync(email);
    }
}
