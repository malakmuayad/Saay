import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "../../assets/icons";
import { EMAIL_REGEX, PASSWORD_REGEX } from "~/validation";
import { addUser } from "~/services/api/users";
import type AddUserRequestDto from "~/types/users/AddUserRequestDto";
import Alert from "../ui/Alert";
import DropzoneComponent from "../form/input/DropZone";
import { useTheme } from "~/context/ThemeContext";

export const meta = () => [{ title: "Saay | Sign Up" }];

export default function SignUpForm() {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [firstNameValid, setFirstNameValid] = useState(true);

  const [lastName, setLastName] = useState("");
  const [lastNameValid, setLastNameValid] = useState(true);

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const theme = useTheme().theme;
  const navigate = useNavigate();

  function validateFields(): boolean {
    const isFirstNameValid =
      firstName.trim() !== "" && firstName.trim().length <= 50;

    const isLastNameValid =
      lastName.trim() !== "" && lastName.trim().length <= 50;

    const isEmailValid = EMAIL_REGEX.test(email.trim());
    const isPasswordValid = PASSWORD_REGEX.test(password);
    const isConfirmPasswordValid =
      confirmPassword !== "" && confirmPassword === password;

    setFirstNameValid(isFirstNameValid);
    setLastNameValid(isLastNameValid);
    setEmailValid(isEmailValid);
    setPasswordValid(isPasswordValid);
    setConfirmPasswordValid(isConfirmPasswordValid);

    return (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    );
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    if (!validateFields()) return;

    setSigningUp(true);

    try {
      const result = await addUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        profilePicture,
      } satisfies AddUserRequestDto);

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
      setProfilePicture(null);

      // Reset validation
      setFirstNameValid(true);
      setLastNameValid(true);
      setEmailValid(true);
      setPasswordValid(true);
      setConfirmPasswordValid(true);

      setSuccess(true);

      setTimeout(() => navigate("/signin"), 4000);
    } catch {
      setError(t("signUp.genericError"));
    } finally {
      setSigningUp(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2 dark:bg-gray-900">
      {/* Left section — Sign-up form */}
      <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              {t("signUp.title")}
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("signUp.subtitle")}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5">
              <Alert
                variant="error"
                title={t("signUp.errorTitle")}
                message={error}
              />
            </div>
          )}

          {success && (
            <div className="mb-5">
              <Alert
                variant="success"
                title={t("signUp.successTitle")}
                message={t("signUp.successMessage")}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignUp}>
            <div className="space-y-5">
              {/* First and last name */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fname">
                    {t("signUp.firstName")}
                    <span className="text-error-500">*</span>
                  </Label>

                  <Input
                    type="text"
                    id="fname"
                    name="fname"
                    value={firstName}
                    placeholder={t("signUp.firstNamePlaceholder")}
                    hint={
                      !firstNameValid ? t("signUp.firstNameError") : undefined
                    }
                    error={!firstNameValid}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() =>
                      setFirstNameValid(
                        firstName.trim() !== "" &&
                          firstName.trim().length <= 50,
                      )
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="lname">
                    {t("signUp.lastName")}
                    <span className="text-error-500">*</span>
                  </Label>

                  <Input
                    type="text"
                    id="lname"
                    name="lname"
                    value={lastName}
                    placeholder={t("signUp.lastNamePlaceholder")}
                    hint={
                      !lastNameValid ? t("signUp.lastNameError") : undefined
                    }
                    error={!lastNameValid}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() =>
                      setLastNameValid(
                        lastName.trim() !== "" && lastName.trim().length <= 50,
                      )
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">
                  {t("signUp.email")}
                  <span className="text-error-500">*</span>
                </Label>

                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  placeholder={t("signUp.emailPlaceholder")}
                  hint={!emailValid ? t("signUp.emailError") : undefined}
                  error={!emailValid}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailValid(EMAIL_REGEX.test(email.trim()))}
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">
                  {t("signUp.password")}
                  <span className="text-error-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    placeholder={t("signUp.passwordPlaceholder")}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    hint={
                      !passwordValid ? t("signUp.passwordError") : undefined
                    }
                    error={!passwordValid}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() =>
                      setPasswordValid(PASSWORD_REGEX.test(password))
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? t("signUp.hidePassword")
                        : t("signUp.showPassword")
                    }
                    className={`absolute inset-e-4 top-1/2 z-30  ${passwordValid ? "-translate-y-1/2" : "-translate-y-4/3"} cursor-pointer`}
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <Label htmlFor="confirmPassword">
                  {t("signUp.confirmPassword")}
                  <span className="text-error-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder={t("signUp.confirmPasswordPlaceholder")}
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    hint={
                      !confirmPasswordValid
                        ? t("signUp.confirmPasswordError")
                        : undefined
                    }
                    error={!confirmPasswordValid}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() =>
                      setConfirmPasswordValid(
                        confirmPassword !== "" && confirmPassword === password,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? t("signUp.hidePassword")
                        : t("signUp.showPassword")
                    }
                    className={`absolute inset-e-4 top-1/2 z-30  ${confirmPasswordValid ? "-translate-y-1/2" : "translate-y-[-110%]"} cursor-pointer`}
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Optional profile picture */}
              <DropzoneComponent
                title={t("signUp.profilePicture")}
                onImageChange={setProfilePicture}
              />

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={signingUp}
                  className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signingUp ? t("signUp.signingUp") : t("signUp.submit")}
                </button>
              </div>
            </div>
          </form>

          {/* Sign-in link */}
          <div className="mt-5">
            <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
              {t("signUp.existingAccount")}{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("signUp.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Right section — Branding */}
      <section className="relative flex min-h-64 flex-col items-center justify-center gap-8 overflow-hidden bg-[radial-gradient(ellipse_at_center,_#bfdbfe_0%,_#dbeafe_35%,_#ffffff_75%)] px-8 py-12 dark:bg-[radial-gradient(ellipse_at_center,_#263b68_0%,_#1f2937_45%,_#111827_100%)] md:min-h-screen lg:px-16">
        <img
          src={theme === "dark" ? "/assets/logo-dark.png" : "/assets/logo.png"}
          alt={t("signUp.logoAlt")}
          className="h-auto w-40 object-contain sm:w-48"
          loading="eager"
        />

        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl dark:text-white">
            {t("signUp.brandingTitle")}
          </h2>

          <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base dark:text-gray-300">
            {t("signUp.brandingDescription")}
          </p>
        </div>
      </section>
    </div>
  );
}
