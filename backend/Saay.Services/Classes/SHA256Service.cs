using Saay.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Saay.Services.Classes
{
    public class SHA256Service : IHashService
    {
        public string HashToken(string token)
        {
            byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }
    }
}
