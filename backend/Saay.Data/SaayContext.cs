using Microsoft.EntityFrameworkCore;
using Saay.Data.Entities;

namespace Saay.Data;

public partial class SaayContext : DbContext
{
    public SaayContext()
    {
    }

    public SaayContext(DbContextOptions<SaayContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TaskCategory> TasksCategories { get; set; }

    public virtual DbSet<Goal> Goals { get; set; }

    public virtual DbSet<GoalCategory> GoalsCategories { get; set; }

    public virtual DbSet<Habit> Habits { get; set; }

    public DbSet<HabitLog> HabitsLogs { get; set; }

    public virtual DbSet<Saay.Data.Entities.Task> Tasks { get; set; }

    public virtual DbSet<Token> Tokens { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<AIConversation> AIConversations { get; set; }

    public DbSet<EmailConfirmationToken> EmailConfirmationTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskCategory>(entity =>
        {
            entity.Property(e => e.TaskCategoryId).HasColumnName("TaskCategoryID");
            entity.Property(e => e.Title).HasMaxLength(255);
        });

        modelBuilder.Entity<Goal>(entity =>
        {
            entity.Property(e => e.GoalId).HasColumnName("GoalID");
            entity.Property(e => e.GoalCategoryId).HasColumnName("GoalCategoryID");
            entity.Property(e => e.TimeFrame).HasComment("0- Monthly, 1- Quarterly, 2- Biannual, 3- Annually");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.GoalCategory).WithMany(p => p.Goals)
                .HasForeignKey(d => d.GoalCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Goals_Categories");

            entity.HasOne(d => d.User).WithMany(p => p.Goals)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Goals_Users");
        });

        modelBuilder.Entity<GoalCategory>(entity =>
        {
            entity.ToTable("GoalsCategories");

            entity.Property(e => e.GoalCategoryId)
                .HasColumnName("GoalCategoryID");

            entity.Property(e => e.Title)
                .HasMaxLength(255);
        });

        modelBuilder.Entity<Habit>(entity =>
        {
            entity.Property(e => e.HabitId).HasColumnName("HabitID");
            entity.Property(e => e.ReasonForHabit).HasMaxLength(255);
            entity.Property(e => e.Steps).HasMaxLength(255);
            entity.Property(e => e.TargetDuration).HasComment("0- 30 days, 1- 60 days, 2- 90 days");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.HabitStartDate)
            .HasColumnType("date")
            .HasDefaultValueSql("CONVERT([date], GETDATE())")
            .ValueGeneratedOnAdd();

            entity.HasOne(d => d.User).WithMany(p => p.Habits)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Habits_Users");
        });

        modelBuilder.Entity<HabitLog>(entity =>
        {
            entity.ToTable("HabitsLogs");

            entity.HasKey(log => log.HabitLogId);

            entity.Property(log => log.HabitLogId)
                .ValueGeneratedOnAdd();

            entity.HasOne(log => log.Habit)
                .WithMany(habit => habit.HabitLogs)
                .HasForeignKey(log => log.HabitId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Saay.Data.Entities.Task>(entity =>
        {
            entity.Property(e => e.TaskId).HasColumnName("TaskID");
            entity.Property(e => e.TaskCategoryId).HasColumnName("TaskCategoryID");
            entity.Property(e => e.DueDate).HasDefaultValueSql("(CONVERT([date],getdate()))");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.TaskCategory).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.TaskCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tasks_Categories");

            entity.HasOne(d => d.User).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Tasks_Users");
        });

        modelBuilder.Entity<Token>(entity =>
        {
            entity.Property(e => e.TokenId).HasColumnName("TokenID");
            entity.Property(e => e.ExpiresAt).HasColumnType("datetime");
            entity.Property(e => e.RefreshTokenHash)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.RevokedAt).HasColumnType("datetime");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Tokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Tokens_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email, "UQ_Users_Email").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Mission).HasMaxLength(255);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.ProfilePictureUrl)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("ProfilePictureURL");
            entity.Property(u => u.IsConfirmed)
                .HasDefaultValue(false);
        });

        modelBuilder.Entity<AIConversation>(entity =>
        {
            entity.ToTable("AIConversations");

            entity.HasKey(e => e.ConversationId);

            entity.Property(e => e.ConversationId)
                .HasColumnName("ConversationID")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .HasColumnName("UserID");

            entity.Property(e => e.PreviousInteractionId)
                .HasMaxLength(200)
                .IsUnicode(false);

            entity.HasOne(e => e.User)
                .WithMany(u => u.AIConversations)
                .HasForeignKey(e => e.UserId)
                .HasConstraintName("FK_AIConversations_Users")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EmailConfirmationToken>(entity =>
        {
            entity.HasKey(e => e.EmailConfirmationTokenId);

            entity.Property(e => e.TokenHash)
                .IsRequired()
                .HasMaxLength(64)
                .IsUnicode(false);

            entity.HasIndex(e => e.TokenHash)
                .IsUnique();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.ExpiresAt)
                .IsRequired();

            entity.Property(e => e.UsedAt)
                .IsRequired(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
