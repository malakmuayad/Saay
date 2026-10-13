using Konscious.Security.Cryptography;
using Saay.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Saay.Services.Classes
{
    public class ArgonPasswordHasher : IPasswordHasher
    {
        private const int MemorySizeKb = 65536; // 64 MB
        private const int Iterations = 3;
        private const int DegreeOfParallelism = 4;
        private const int HashLength = 32; // 256 bits output
        private const int SaltLength = 16; // 128 bits salt

        /// <summary>
        /// Hashes a plaintext password using Argon2id.
        /// </summary>
        public string HashToken(string password)
        {
            // Generate a cryptographically secure random salt
            byte[] salt = new byte[SaltLength];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // Configure Argon2id
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            using Argon2id argon2 = new Argon2id(passwordBytes)
            {
                Salt = salt,
                DegreeOfParallelism = DegreeOfParallelism,
                MemorySize = MemorySizeKb,
                Iterations = Iterations
            };

            // Compute the hash
            byte[] hash = argon2.GetBytes(HashLength);

            // Combine Salt and Hash for database storage (e.g., Salt.Hash)
            return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        /// <summary>
        /// Verifies a plaintext password against a previously generated Argon2id hash string.
        /// </summary>
        public bool VerifyPassword(string password, string storedRecord)
        {
            // Extract the salt and hash from the stored record
            var parts = storedRecord.Split('.');
            if (parts.Length != 2) return false;

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] storedHash = Convert.FromBase64String(parts[1]);

            // Recompute hash using extracted parameters and salt
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            using var argon2 = new Argon2id(passwordBytes)
            {
                Salt = salt,
                DegreeOfParallelism = DegreeOfParallelism,
                MemorySize = MemorySizeKb,
                Iterations = Iterations
            };

            byte[] computedHash = argon2.GetBytes(HashLength);

            // Compare using constant-time comparison to prevent side-channel timing attacks
            return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
        }
    }
}
