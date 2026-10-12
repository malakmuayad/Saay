using Azure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Saay.Repository.Classes;
using Saay.Repository.Interfaces;
using Saay.Services.Authorization.Handlers;
using Saay.Services.Authorization.Requirements;
using Saay.Services.Classes;
using Saay.Services.Interfaces;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

namespace Saay.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IConfiguration AddAzureKeyVaultIfConfigured(this IConfiguration config)
        {
            var keyVaultUrl = config["KeyVault:Url"];
            if (!string.IsNullOrWhiteSpace(keyVaultUrl))
            {
                if (config is ConfigurationManager mgr)
                {
                    mgr.AddAzureKeyVault(new Uri(keyVaultUrl), new DefaultAzureCredential());
                    return mgr;
                }

                var builder = new ConfigurationBuilder()
                    .AddConfiguration(config)
                    .AddAzureKeyVault(new Uri(keyVaultUrl), new DefaultAzureCredential());
                return builder.Build();
            }
            return config;
        }

        public static IServiceCollection AddSaayPersistence(this IServiceCollection services, IConfiguration configuration)
        {
            var connSecret = configuration["ConnectionString"];
            var connectionString = !string.IsNullOrWhiteSpace(connSecret)
                ? connSecret
                : configuration.GetConnectionString("SaayDB");

            services.AddDbContext<Saay.Data.SaayContext>(opt =>
                opt.UseSqlServer(connectionString));
            return services;
        }

        public static IServiceCollection AddSaayServices(this IServiceCollection services)
        {
            services.AddScoped<IEmailService, GmailService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ITaskCategoryService, TaskCategoryService>();
            services.AddScoped<IPasswordHasher, ArgonPasswordHasher>();
            services.AddScoped<ITaskService, TaskService>();
            services.AddScoped<IGoalCategoryService, GoalCategoryService>();
            services.AddScoped<IGoalService, GoalService>();
            services.AddScoped<IHabitLogService, HabitLogService>();
            services.AddScoped<IHabitService, HabitService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IUserTokenService, UserTokenService>();
            services.AddScoped<IOwnershipAuthorizationService, OwnershipAuthorizationService>();
            services.AddScoped<IDashboardNumbersService, DashbaordNumbersService>();
            services.AddScoped<IAIConversationService, AIConversationService>();
            services.AddScoped<IGeminiService, GeminiService>();
            services.AddHttpClient<GeminiService>();

            return services;
        }

        public static IServiceCollection AddSaayRepositories(this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ITaskCategoryRepository, TaskCategoryRepository>();
            services.AddScoped<ITaskRepository, TaskRepository>();
            services.AddScoped<IGoalCategoryRepository, GoalCategoryRepository>();
            services.AddScoped<IGoalRepository, GoalRepository>();
            services.AddScoped<IHabitLogRepository, HabitLogRepository>();
            services.AddScoped<IHabitRepository, HabitRepository>();
            services.AddScoped<IUserTokenRepository, UserTokenRpository>();
            services.AddScoped<IAIConversationRepository, AIConversationRepository>();
            services.AddScoped<IEmailConfirmationRepository, EmailConfirmationRepository>();

            return services;
        }

        public static IServiceCollection AddSaayCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("SaayCorsPolicy", policy =>
                {
                    policy
                        .WithOrigins(
                            "http://127.0.0.1:5500",
                            "http://localhost:5109",
                            "http://localhost:5173",
                            "https://saay.vercel.app"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            return services;
        }

        public static IServiceCollection AddSaayAuth(this IServiceCollection services, IConfiguration config)
        {
            // JWT
            var secretKey = config["JwtSigningKey"];

            if (string.IsNullOrWhiteSpace(secretKey))
                throw new Exception(
                    "JWT Signing Key is not found in configuration.");

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = "SaayAPI",
                        ValidAudience = "SaayAPIUsers",

                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(secretKey)),

                        RoleClaimType = ClaimTypes.Role,
                        NameClaimType = ClaimTypes.NameIdentifier
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            context.Token =
                                context.Request.Cookies["accessToken"];

                            return Task.CompletedTask;
                        }
                    };
                });

            return services;
        }

        public static IServiceCollection AddSaayPolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("UserOwner", policy =>
                    policy.Requirements.Add(new UserOwnerRequirement()));
            });
            services.AddScoped<IAuthorizationHandler, UserOwnerHandler>();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("GoalOwner", policy =>
                    policy.Requirements.Add(new GoalOwnerRequirement()));
            });
            services.AddScoped<IAuthorizationHandler, GoalOwnerHandler>();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("HabitOwner", policy =>
                    policy.Requirements.Add(new HabitOwnerRequirement()));
            });
            services.AddScoped<IAuthorizationHandler, HabitOwnerHandler>();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("TaskOwner", policy =>
                    policy.Requirements.Add(new TaskOwnerRequirement()));
            });
            services.AddScoped<IAuthorizationHandler, TaskOwnerHandler>();

            return services;
        }

        public static IServiceCollection AddSaayRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy("AuthLimiter", ctx =>
                {
                    var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 });
                });

                options.AddPolicy("CriticalOpsLimiter", ctx =>
                {
                    string? uid = ctx.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
                    return RateLimitPartition.GetFixedWindowLimiter(uid, _ => new FixedWindowRateLimiterOptions { PermitLimit = 30, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 });
                });

                options.AddPolicy("LightOpsLimiter", ctx =>
                {
                    string? uid = ctx.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
                    return RateLimitPartition.GetFixedWindowLimiter(uid, _ => new FixedWindowRateLimiterOptions { PermitLimit = 70, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 });
                });
            });
            return services;
        }
    }
}
