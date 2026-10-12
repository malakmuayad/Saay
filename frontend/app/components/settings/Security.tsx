import { useState } from "react";
import { useNavigate } from "react-router";
import { Modal } from "../ui/modal/Modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Alert from "../ui/Alert";
import { updatePassword } from "~/services/api/users";
import { useAuth } from "~/context/AuthContext";
import { removeRefreshToken } from "~/services/localStorage/auth";
import { removeAccessToken } from "~/services/sessionStorage/auth";
import { EyeCloseIcon, EyeIcon } from "~/assets/icons";
import { removeCurrentUser } from "~/services/localStorage/users";
import { PASSWORD_REGEX } from "~/validation";

export default function Security() {
  const currentUserId = useAuth()?.currentUserId;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordValid, setPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  function validateFields() {
    const passwordIsValid = PASSWORD_REGEX.test(password);

    const confirmPasswordIsValid =
      PASSWORD_REGEX.test(password) &&
      confirmPassword !== "" &&
      confirmPassword === password;

    setPasswordValid(passwordIsValid);
    setConfirmPasswordValid(confirmPasswordIsValid);

    return passwordIsValid && confirmPasswordIsValid;
  }

  function resetForm() {
    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    setPasswordValid(true);
    setConfirmPasswordValid(true);

    setError(null);
    setSuccess(false);
  }

  function handleClose() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (currentUserId === undefined || currentUserId === null) {
      return;
    }

    if (!validateFields()) {
      return;
    }

    setSaving(true);
    setError(null);

    const response = await updatePassword(currentUserId, password);

    if (typeof response === "string" || response === false) {
      setError(
        typeof response === "string"
          ? response
          : "Failed to update your password.",
      );

      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);

    setTimeout(() => {
      removeRefreshToken();
      removeAccessToken();
      removeCurrentUser();

      setModalOpen(false);
      resetForm();

      navigate("/");
    }, 1500);
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-100">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
        Security
      </h4>

      <div>
        <div className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-end">
          <div>
            <span className="mb-1 block text-base font-medium text-gray-800 dark:text-white/90">
              Change Password
            </span>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your password to keep your account secure.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="shadow-theme-xs flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-3.5 text-sm font-medium text-gray-200 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M12.3861 5.08087L14.9182 7.61296M15.6437 3.5917L16.408 4.35603C16.8962 4.84419 16.8962 5.63564 16.408 6.1238L7.83547 14.6963C7.69039 14.8414 7.51182 14.9486 7.31554 15.0083L3.97461 16.0251L4.99141 12.6842C5.05115 12.4879 5.15829 12.3093 5.30337 12.1642L13.8759 3.5917C14.3641 3.10355 15.1555 3.10355 15.6437 3.5917Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Change Password
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleClose}
        className="max-h-[90vh] w-full max-w-[700px]"
      >
        <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="px-6 pt-6 pr-14 lg:px-8 lg:pt-8">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>

            <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
              Enter a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 pb-3 lg:px-8">
              {/* Error */}
              {error && (
                <div className="mb-6">
                  <Alert variant="error" title="Error" message={error} />
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-6">
                  <Alert
                    variant="success"
                    title="Success"
                    message="Your password was updated successfully. You will be redirected to sign in."
                  />
                </div>
              )}

              {/* Password fields */}
              <div className="grid grid-cols-1 gap-5">
                {/* New Password */}
                <div className="relative">
                  <Label htmlFor="password">New Password</Label>

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    disabled={saving}
                    onChange={(e) => {
                      const value = e.target.value;

                      setPassword(value);

                      setPasswordValid(PASSWORD_REGEX.test(value));

                      if (confirmPassword !== "") {
                        setConfirmPasswordValid(
                          PASSWORD_REGEX.test(value) &&
                            value === confirmPassword,
                        );
                      }
                    }}
                    onBlur={() =>
                      setPasswordValid(PASSWORD_REGEX.test(password))
                    }
                    hint={
                      !passwordValid
                        ? "Password must be at least 8 characters, contain a small, capital, special, and numeric characters."
                        : undefined
                    }
                    error={!passwordValid}
                  />

                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute inset-e-4 ${
                      passwordValid ? "top-[70%]" : "top-[55%]"
                    } z-30 -translate-y-1/2 cursor-pointer`}
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>

                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    disabled={saving}
                    onChange={(e) => {
                      const value = e.target.value;

                      setConfirmPassword(value);

                      setConfirmPasswordValid(
                        PASSWORD_REGEX.test(password) &&
                          value !== "" &&
                          value === password,
                      );
                    }}
                    onBlur={() =>
                      setConfirmPasswordValid(
                        PASSWORD_REGEX.test(password) &&
                          confirmPassword !== "" &&
                          confirmPassword === password,
                      )
                    }
                    hint={
                      !confirmPasswordValid
                        ? "Passwords do not match"
                        : undefined
                    }
                    error={!confirmPasswordValid}
                  />

                  <span
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className={`absolute inset-e-4 ${
                      confirmPasswordValid ? "top-[70%]" : "top-[55%]"
                    } z-30 -translate-y-1/2 cursor-pointer`}
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-gray-200 px-6 py-4 dark:border-gray-100 lg:px-8">
              <div className="flex items-center justify-end gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                >
                  Close
                </Button>

                <Button size="sm" disabled={saving}>
                  {saving ? "Saving..." : "Change Password"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
