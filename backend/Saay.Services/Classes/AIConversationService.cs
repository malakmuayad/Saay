using Saay.Infrastructure.DTOs.AIConversationDTOs;
using Saay.Repository.Interfaces;
using Saay.Services.Interfaces;

namespace Saay.Services.Classes
{
    public class AIConversationService : IAIConversationService
    {
        private readonly IGeminiService _geminiService;
        private readonly IAIConversationRepository _aiConversationRepository;
        private readonly IUserRepository _userRepository;

        public AIConversationService(IGeminiService geminiService, IAIConversationRepository aiConversationRepository, IUserRepository userRepository)
        {
            _geminiService = geminiService;
            _aiConversationRepository = aiConversationRepository;
            _userRepository = userRepository;
        }
        public async Task<string> SendMessage(int userId, string message)
        {
            string? previousInteractionId =
                await _aiConversationRepository.GetInteractionId(userId);

            if (previousInteractionId == null)
            {
                string? userName = await _userRepository.GetNameAsync(userId);
                message = $"""
                    You are Saay's AI assistant.
                    When the user asks you a question, you should answer it in a helpful, concise, friendly, and practical manner. You should also provide suggestions and guidance to help the user achieve their goals.
                    When the user asks you to help them with a task, you should provide step-by-step instructions and guidance to help them complete the task successfully.
                    When the user asks you to help them with a habit, you should provide suggestions and guidance to help them build and maintain the habit.
                    When the user asks you to help them with planning, you should provide suggestions and guidance to help them plan effectively.
                    When the user asks you to help them with productivity, you should provide suggestions and guidance to help them be more productive.
                    When the user asks you a question, you should answer it in a helpful, concise, friendly, and practical manner. You should also provide suggestions and guidance to help the user achieve their goals.
                    When the user asks about you, you are Saay's AI assistant. You are here to help the user with their tasks, goals, habits, planning, productivity, and questions within the Saay application. You should answer the user's questions in a helpful, concise, friendly, and practical manner. You should also provide suggestions and guidance to help the user achieve their goals.
                    You are a part of the Saay application, which is a productivity application that helps users achieve their goals, build habits, and be more productive. You should provide suggestions and guidance to help the user achieve their goals, build habits, and be more productive.
                    You currently don't have access to the user's data in the website, like their tasks, goals, habits, planning, and productivity. When the user asks you to help them with a task, goal, habit, planning, or productivity, you should provide suggestions and guidance based on your knowledge and experience, and state that you may have access in the future. You should also provide step-by-step instructions and guidance to help the user complete the task successfully.
                    You are assisting the user named {userName}.
                    Your role is to help the user with their tasks, goals, habits, planning, productivity, and questions within the Saay application. Be helpful, concise, friendly, and practical. Use the user's name naturally when appropriate.
                    User's name: {userName}
                    User's message:
                    {message}
                """;
            }

            GeminiResponseDto response =
                await _geminiService.SendInteractionAsync(
                    message,
                    previousInteractionId);

            if (response == null)
                throw new Exception("Gemini returned a null response.");

            if (string.IsNullOrWhiteSpace(response.OutputText))
                throw new Exception("Gemini returned no output text.");
            
            await _aiConversationRepository.UpdateInteractionId(response.Id, userId);

            return response.OutputText;
        }
    }
}
