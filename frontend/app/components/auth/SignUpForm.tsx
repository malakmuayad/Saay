import Label from "../form/Label";
import Input from "../form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "../../assets/icons";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EMAIL_REGEX, PASSWORD_REGEX } from "~/validation";
import { addUser } from "~/services/api/users";
import type AddUserDto from "~/types/users/AddUserDto";
import Alert from "../ui/Alert";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState<string>("");
  const [firstNameValid, setFirstNameValid] = useState<boolean>(true);

  const [lastName, setLastName] = useState<string>("");
  const [lastNameValid, setLastNameValid] = useState<boolean>(true);

  const [email, setEmail] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean>(true);

  const [password, setPassword] = useState<string>("");
  const [passwordValid, setPasswordValid] = useState<boolean>(true);

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [confirmPasswordValid, setConfirmPasswordValid] =
    useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [signingUp, setSigningUp] = useState<boolean>(false);
  const navigator = useNavigate();

  function validateFields(): boolean {
    return (
      firstName.trim() !== "" &&
      firstName.trim().length <= 50 &&
      lastName.trim() !== "" &&
      lastName.trim().length <= 50 &&
      EMAIL_REGEX.test(email.trim()) &&
      PASSWORD_REGEX.test(password) &&
      confirmPassword !== "" &&
      confirmPassword === password
    );
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateFields()) return;

    setSigningUp(true);

    const result = await addUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      profilePictureURL: null,
    } satisfies AddUserDto);

    setError(null);
    setSigningUp(false);

    if (typeof result === "string") {
      setError(result);
      return;
    }
    // Clear fields
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    // Reset valiation
    setFirstNameValid(true);
    setLastNameValid(true);
    setEmailValid(true);
    setPasswordValid(true);
    setConfirmPasswordValid(true);

    setError(null);
    setSuccess(true);
    setTimeout(() => navigator("/"), 4000);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-y-auto px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
        </div>
        {error && <Alert variant="error" title="Error" message={error} />}
        {success && (
          <Alert
            variant="success"
            title="Success"
            message={
              "Account is created. Check your email to confirm your account!"
            }
          />
        )}
        <form onSubmit={handleSignUp}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* <!-- First Name --> */}
              <div className="sm:col-span-1">
                <Label htmlFor="fname">
                  First Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="fname"
                  name="fname"
                  value={firstName}
                  placeholder="Enter your first name"
                  hint={
                    !firstNameValid
                      ? "First Name is required and should not exceed 50 characters."
                      : undefined
                  }
                  error={!firstNameValid}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() =>
                    setFirstNameValid(
                      firstName !== "" && firstName.length <= 50,
                    )
                  }
                />
              </div>
              {/* <!-- Last Name --> */}
              <div className="sm:col-span-1">
                <Label htmlFor="lname">
                  Last Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="lname"
                  name="lname"
                  value={lastName}
                  placeholder="Enter your last name"
                  hint={
                    !lastNameValid
                      ? "Last Name is required and should not exceed 50 characters."
                      : undefined
                  }
                  error={!lastNameValid}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() =>
                    setLastNameValid(lastName !== "" && lastName.length <= 50)
                  }
                />
              </div>
            </div>
            {/* <!-- Email --> */}
            <div>
              <Label htmlFor="email">
                Email<span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                hint={!emailValid ? "Enter a valid email" : undefined}
                error={!emailValid}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailValid(EMAIL_REGEX.test(email))}
              />
            </div>
            {/* <!-- Password --> */}
            <div>
              <Label htmlFor="password">
                Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  hint={
                    !passwordValid
                      ? "Password must be at least 8 characters, contain a small, capital, special, and numeric characters."
                      : undefined
                  }
                  error={!passwordValid}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordValid(PASSWORD_REGEX.test(password))}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-e-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>
            {/* <!-- Confirm Password --> */}
            <div>
              <Label htmlFor="confirmPassword">
                Confirm Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  type={showPassword ? "text" : "password"}
                  hint={
                    !confirmPasswordValid ? "Passwords must match" : undefined
                  }
                  error={!confirmPasswordValid}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() =>
                    setConfirmPasswordValid(
                      confirmPassword !== "" && confirmPassword === password,
                    )
                  }
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-e-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>
            {/* <!-- Button --> */}
            <div>
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
                disabled={signingUp}
              >
                {signingUp === true ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-5">
          <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
