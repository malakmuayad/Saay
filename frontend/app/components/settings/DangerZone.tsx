import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../ui/modal/Modal";
import Button from "../ui/button/Button";
import Alert from "../ui/Alert";
import { useAuth } from "~/context/AuthContext";
import { deleteUser } from "~/services/api/users";
import { removeCurrentUser } from "~/services/localStorage/users";
import { removeRefreshToken } from "~/services/localStorage/auth";
import { removeAccessToken } from "~/services/sessionStorage/auth";
import { useNavigate } from "react-router";

export default function DangerZone() {
  const { t } = useTranslation();
  const currentUserId = useAuth()?.currentUserId;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  function handleOpen() {
    setError(null);
    setSuccess(false);
    setModalOpen(true);
  }

  function handleClose() {
    if (deleting) return;

    setModalOpen(false);
    setError(null);
    setSuccess(false);
  }

  async function handleDeleteAccount() {
    if (currentUserId === null || currentUserId === undefined) {
      setError(t("dangerZone.errors.identifyAccount"));
      return;
    }

    setDeleting(true);
    setError(null);

    const result = await deleteUser(currentUserId);

    if (typeof result === "string" || result === false) {
      setError(
        typeof result === "string"
          ? result
          : t("dangerZone.errors.deleteFailed"),
      );

      setDeleting(false);
      return;
    }

    setDeleting(false);
    setSuccess(true);

    setTimeout(() => {
      removeCurrentUser();
      removeRefreshToken();
      removeAccessToken();

      setModalOpen(false);
      navigate("/signup");
    }, 3000);
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-100">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
        {t("dangerZone.title")}
      </h4>

      <div>
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-end dark:border-gray-100">
          <div>
            <span className="mb-1 block text-base font-medium text-gray-800 dark:text-white/90">
              {t("dangerZone.deleteAccount")}
            </span>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("dangerZone.description")}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleOpen}
              className="border-error-500 text-error-500 hover:bg-error-100 dark:border-error-500/15 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 pr-4 pl-3.5 text-sm font-medium transition-all dark:hover:bg-red-500/15"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M4.37492 4.79199V16.4587C4.37492 17.149 4.93456 17.7087 5.62492 17.7087H14.3749C15.0653 17.7087 15.6249 17.149 15.6249 16.4587V4.79199M3.33325 4.79199H16.6658M4.37492 13.2466V8.24658M15.6249 13.2466V8.24658M8.33325 13.7503V8.75033M11.6666 13.7503V8.75033M12.7078 4.79199V3.54199C12.7078 2.85164 12.1482 2.29199 11.4578 2.29199H8.54118C7.85082 2.29199 7.29118 2.85164 7.29118 3.54199V4.79199H12.7078Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {t("dangerZone.deleteAccount")}
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
              {t("dangerZone.confirmationTitle")}
            </h4>

            <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
              {t("dangerZone.confirmationDescription")}
            </p>
          </div>

          {/* Alerts */}
          <div className="px-6 lg:px-8">
            {error && (
              <div className="mb-6">
                <Alert
                  variant="error"
                  title={t("dangerZone.errors.title")}
                  message={error}
                />
              </div>
            )}

            {success && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title={t("common.success")}
                  message={t("dangerZone.success")}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 lg:px-8">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClose}
              disabled={deleting}
            >
              {t("dangerZone.actions.cancel")}
            </Button>

            <Button size="sm" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting
                ? t("dangerZone.actions.deleting")
                : t("dangerZone.actions.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
