namespace Saay.Services.Interfaces
{
    public interface IPasswordHasher : IHashService
    {
        //public string HashPassword(string password);
        public bool VerifyPassword(string password, string hashedPassword);
    }
}
