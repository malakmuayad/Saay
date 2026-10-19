import { Modal } from "~/components/ui/modal/Modal";
import Label from "~/components/form/Label";
import Input from "~/components/form/input/InputField";
import Select from "~/components/form/input/Select";
import { useEffect, useState } from "react";
import Button from "~/components/ui/button/Button";
import { useAuth } from "~/context/AuthContext";
import Alert from "~/components/ui/Alert";
import { addHabit } from "~/services/api/habits";
import { t } from "i18next";

type AddHabitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
};

export function AddHabitModal({
  isOpen,
  onClose,
  onHabitAdded,
}: AddHabitModalProps) {
  const currentUserId = useAuth()?.currentUserId;

  const [title, setTitle] = useState("");
  const [titleValid, setTitleValid] = useState(true);

  const [reasonForHabit, setReasonForHabit] = useState("");
  const [reasonForHabitValid, setReasonForHabitValid] = useState(true);

  const [steps, setSteps] = useState("");
  const [stepsValid, setStepsValid] = useState(true);

  const [targetDuration, setTargetDuration] = useState("");
  const [targetDurationValid, setTargetDurationValid] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const targetDurationOptions = [
    {
      value: "0",
      label: t("habits.targetDuration.oneMonth"),
    },
    {
      value: "1",
      label: t("habits.targetDuration.twoMonths"),
    },
    {
      value: "2",
      label: t("habits.targetDuration.threeMonths"),
    },
  ];

  /*
   * Reset the form whenever the modal opens.
   */
  useEffect(() => {
    if (!isOpen) return;

    resetForm();
    setError(null);
    setSuccess(false);
  }, [isOpen]);

  function resetForm() {
    setTitle("");
    setReasonForHabit("");
    setSteps("");
    setTargetDuration("");

    setTitleValid(true);
    setReasonForHabitValid(true);
    setStepsValid(true);
    setTargetDurationValid(true);
  }

  function validateFields() {
    return (
      title.trim() !== "" &&
      reasonForHabit.trim() !== "" &&
      steps.trim() !== "" &&
      targetDuration !== ""
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const titleIsValid = title.trim() !== "";
    const reasonIsValid = reasonForHabit.trim() !== "";
    const stepsIsValid = steps.trim() !== "";
    const durationIsValid = targetDuration !== "";

    setTitleValid(titleIsValid);
    setReasonForHabitValid(reasonIsValid);
    setStepsValid(stepsIsValid);
    setTargetDurationValid(durationIsValid);

    if (!validateFields()) {
      return;
    }

    if (currentUserId == null) {
      setError(String(t("habits.errors.userInfoUnavailable")));
      return;
    }

    setSaving(true);
    setError(null);

    const result = await addHabit({
      userId: currentUserId,
      title: title.trim(),
      reasonForHabit: reasonForHabit.trim(),
      steps: steps.trim(),
      targetDuration: Number(targetDuration),
    });

    if (typeof result === "string") {
      setError(result);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);

    onHabitAdded();

    setTimeout(() => {
      resetForm();
      onClose();
      setSuccess(false);
    }, 1500);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[calc(100%-2rem)] max-w-[500px] sm:w-[500px]"
    >
      <div className="p-6">
        {/* Error Alert */}
        {error && (
          <div className="mt-6 mb-4">
            <Alert
              variant="error"
              title={String(t("common.error"))}
              message={error}
            />
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mt-6 mb-4">
            <Alert
              variant="success"
              title={String(t("common.success"))}
              message={String(t("habits.success.added"))}
            />
          </div>
        )}

        <h3 className="mb-6 text-lg font-semibold  dark:text-white">
          {t("habits.addNewHabit")}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Habit Title */}
            <div>
              <Label htmlFor="habitTitle">{t("habits.fields.title")}</Label>

              <Input
                id="habitTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                hint={!titleValid ? String(t("common.required")) : undefined}
                onBlur={() => setTitleValid(title.trim() !== "")}
                error={!titleValid}
              />
            </div>

            {/* Reason For Habit */}
            <div>
              <Label htmlFor="reasonForHabit">
                {t("habits.fields.reasonForHabit")}
              </Label>

              <Input
                id="reasonForHabit"
                value={reasonForHabit}
                onChange={(e) => setReasonForHabit(e.target.value)}
                hint={
                  !reasonForHabitValid
                    ? String(t("common.required"))
                    : undefined
                }
                onBlur={() =>
                  setReasonForHabitValid(reasonForHabit.trim() !== "")
                }
                error={!reasonForHabitValid}
              />
            </div>

            {/* Steps */}
            <div>
              <Label htmlFor="habitSteps">{t("habits.fields.steps")}</Label>

              <Input
                id="habitSteps"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                hint={!stepsValid ? String(t("common.required")) : undefined}
                onBlur={() => setStepsValid(steps.trim() !== "")}
                error={!stepsValid}
              />
            </div>

            {/* Target Duration */}
            <div>
              <Label>{t("habits.fields.targetDuration")}</Label>

              <Select
                options={targetDurationOptions}
                value={targetDuration}
                placeholder={String(
                  t("habits.fields.targetDurationPlaceholder"),
                )}
                onChange={(value) => {
                  setTargetDuration(value);
                  setTargetDurationValid(value !== "");
                }}
              />

              {!targetDurationValid && (
                <p className="mt-1.5 text-sm text-error-500">
                  {t("common.required")}
                </p>
              )}
            </div>
          </div>

          <Button className="mt-6 w-full" size="md" disabled={saving}>
            {saving ? t("habits.adding") : t("habits.add")}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
