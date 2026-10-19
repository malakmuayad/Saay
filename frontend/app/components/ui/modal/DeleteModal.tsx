import { Modal } from "~/components/ui/modal/Modal";
import Button from "~/components/ui/button/Button";
import Alert from "~/components/ui/Alert";
import { t } from "i18next";

type DeleteModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSave: () => void;
  title: string;
  description?: string;
  error: string | null;
  success: boolean;
  successMessage: string;
};

export function DeleteModal({
  isOpen,
  onCancel,
  onSave,
  title,
  description,
  error,
  success,
  successMessage,
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="w-[calc(100%-2rem)] max-w-[450px] sm:w-[450px]"
    >
      <div className="p-6">
        {/* Alert */}
        {error && (
          <div className="mb-4">
            <Alert variant="error" title="Error" message={error} />
          </div>
        )}

        {success && (
          <div className="mb-4">
            <Alert
              variant="success"
              title={t("signUp.successTitle")}
              message={successMessage}
            />
          </div>
        )}

        {/* Content */}
        <div className="mb-6 -mt-2">
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>

          <Button size="sm" className="flex-1" onClick={onSave}>
            {t("common.delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
