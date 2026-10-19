import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../hooks/useModal";
import { PencilIcon } from "~/assets/icons";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal/Modal";
import Alert from "../ui/Alert";
import { EMAIL_REGEX } from "~/validation";
import { updateProfilePicture, updateUser } from "~/services/api/users";
import type { UpdateUserDto } from "~/types/users/UpdateUserDto";
import { useAuth } from "~/context/AuthContext";

type UserMetaCardProps = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | undefined;
  onDataUpdated: () => void;
};

export default function UserMetaCard({
  userId,
  firstName,
  lastName,
  email,
  profilePictureUrl,
  onDataUpdated,
}: UserMetaCardProps) {
  const { t } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();

  const [editedFirstName, setEditedFirstName] = useState(firstName);
  const [editedLastName, setEditedLastName] = useState(lastName);
  const [editedEmail, setEditedEmail] = useState(email);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [editedProfilePictureUrl, setEditedProfilePictureUrl] = useState<
    string | undefined
  >(profilePictureUrl);

  const [firstNameValid, setFirstNameValid] = useState(true);
  const [lastNameValid, setLastNameValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const refreshUserData = useAuth()?.refreshUserData;

  useEffect(() => {
    if (!isOpen) return;

    setEditedFirstName(firstName);
    setEditedLastName(lastName);
    setEditedEmail(email);
    setEditedProfilePictureUrl(profilePictureUrl);
    setNewProfilePicture(null);

    setFirstNameValid(true);
    setLastNameValid(true);
    setEmailValid(true);

    setError(null);
    setSuccess(false);
  }, [isOpen]);

  function validateFields() {
    const firstNameIsValid = editedFirstName.trim() !== "";
    const lastNameIsValid = editedLastName.trim() !== "";
    const emailIsValid =
      editedEmail.trim() !== "" && EMAIL_REGEX.test(editedEmail.trim());

    setFirstNameValid(firstNameIsValid);
    setLastNameValid(lastNameIsValid);
    setEmailValid(emailIsValid);

    return firstNameIsValid && lastNameIsValid && emailIsValid;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateFields()) return;

    setSaving(true);
    setError(null);

    const response = await updateUser({
      userId,
      firstName: editedFirstName.trim(),
      lastName: editedLastName.trim(),
      email: editedEmail.trim(),
    } satisfies UpdateUserDto);

    if (typeof response === "string" || response === false) {
      setError(
        typeof response === "string"
          ? response
          : t("profile.errors.updateFailed"),
      );
      setSaving(false);
      return;
    }

    if (newProfilePicture !== null) {
      const pictureUpdateResult = await updateProfilePicture(
        userId,
        newProfilePicture,
      );

      if (pictureUpdateResult !== true) {
        setError(
          typeof pictureUpdateResult === "string"
            ? pictureUpdateResult
            : t("profile.errors.pictureUpdateFailed"),
        );
        setSaving(false);
        return;
      }
    }

    if (typeof refreshUserData !== "undefined") {
      refreshUserData();
    }

    setSaving(false);
    setSuccess(true);

    onDataUpdated();

    setTimeout(() => {
      closeModal();
      setSuccess(false);
    }, 1500);
  }

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-100">
        <div className="flex flex-col gap-5 sm:flex-row xl:gap-10">
          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-5 sm:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="overflow-hidden rounded-full border border-gray-200 dark:border-gray-100">
                  <img
                    src={
                      editedProfilePictureUrl ??
                      "/assets/profile-picture-placeholder.png"
                    }
                    className="size-20"
                    alt={t("profile.profilePictureAlt")}
                  />
                </div>

                <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {`${firstName} ${lastName}`}
                </h4>
              </div>
            </div>

            <div className="relative grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-11 xl:gap-y-7">
              <div className="w-full">
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.fields.firstName")}
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {firstName}
                </p>
              </div>

              <div className="w-full">
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.fields.lastName")}
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {lastName}
                </p>
              </div>

              <div className="hidden xl:block" />
              <div className="hidden xl:block" />

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.fields.email")}
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {email}
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={openModal}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
            >
              <PencilIcon className="size-4.5" />
              {t("profile.edit")}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-h-[90vh] w-full max-w-[700px]"
      >
        <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="shrink-0 px-6 pt-6 pr-14 lg:px-10 lg:pt-8">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t("profile.editPersonalInfo")}
            </h4>

            <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
              {t("profile.updateDescription")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Scrollable content */}
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-3 lg:px-10">
              {/* Error */}
              {error && (
                <div className="mb-6">
                  <Alert
                    variant="error"
                    title={t("profile.errors.title")}
                    message={error}
                  />
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-6">
                  <Alert
                    variant="success"
                    title={t("common.success")}
                    message={t("profile.success")}
                  />
                </div>
              )}

              {/* Profile Picture */}
              <div>
                <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                  {t("profile.changeProfilePicture")}
                </h4>

                <div className="mb-6 flex max-w-sm items-center gap-6 lg:pr-5">
                  <div className="relative size-20 shrink-0 rounded-full sm:size-25">
                    <img
                      src={
                        editedProfilePictureUrl ??
                        "/assets/profile-picture-placeholder.png"
                      }
                      alt={t("profile.profilePictureAlt")}
                      className="size-20 rounded-full object-cover sm:size-25"
                    />

                    <label
                      htmlFor="file-upload"
                      className="absolute right-0 bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 dark:border-gray-100 dark:bg-gray-900 dark:text-gray-400"
                    >
                      <input
                        type="file"
                        name="file-upload"
                        id="file-upload"
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (!file) return;

                          setNewProfilePicture(file);
                          setEditedProfilePictureUrl(URL.createObjectURL(file));
                        }}
                      />

                      <PencilIcon />
                    </label>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("profile.uploadImageHint")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="my-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                  {t("profile.personalInfo")}
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="firstName">
                      {t("profile.fields.firstName")}
                    </Label>

                    <Input
                      id="firstName"
                      type="text"
                      value={editedFirstName}
                      onChange={(e) => {
                        setEditedFirstName(e.target.value);
                        setFirstNameValid(e.target.value.trim() !== "");
                      }}
                      onBlur={() =>
                        setFirstNameValid(editedFirstName.trim() !== "")
                      }
                      hint={
                        !firstNameValid
                          ? t("profile.errors.required")
                          : undefined
                      }
                      error={!firstNameValid}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="lastName">
                      {t("profile.fields.lastName")}
                    </Label>

                    <Input
                      id="lastName"
                      type="text"
                      value={editedLastName}
                      onChange={(e) => {
                        setEditedLastName(e.target.value);
                        setLastNameValid(e.target.value.trim() !== "");
                      }}
                      onBlur={() =>
                        setLastNameValid(editedLastName.trim() !== "")
                      }
                      hint={
                        !lastNameValid
                          ? t("profile.errors.required")
                          : undefined
                      }
                      error={!lastNameValid}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">{t("profile.fields.email")}</Label>

                    <Input
                      id="email"
                      type="email"
                      value={editedEmail}
                      onChange={(e) => {
                        setEditedEmail(e.target.value);
                        setEmailValid(
                          e.target.value.trim() !== "" &&
                            EMAIL_REGEX.test(e.target.value.trim()),
                        );
                      }}
                      onBlur={() =>
                        setEmailValid(
                          editedEmail.trim() !== "" &&
                            EMAIL_REGEX.test(editedEmail.trim()),
                        )
                      }
                      hint={
                        !emailValid
                          ? t("profile.errors.invalidEmail")
                          : undefined
                      }
                      error={!emailValid}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed footer */}
            <div className="shrink-0 border-t border-gray-200 px-6 py-4 dark:border-gray-100 lg:px-10">
              <div className="flex items-center justify-end gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeModal}
                  disabled={saving}
                >
                  {t("profile.actions.close")}
                </Button>

                <Button size="sm" disabled={saving}>
                  {saving
                    ? t("profile.actions.saving")
                    : t("profile.actions.save")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
