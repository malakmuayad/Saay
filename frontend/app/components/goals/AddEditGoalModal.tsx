import { Modal } from "~/components/ui/modal/Modal";
import Label from "~/components/form/Label";
import Input from "~/components/form/input/InputField";
import Select from "~/components/form/input/Select";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "~/components/ui/button/Button";
import DatePicker from "~/components/form/input/date-picker";
import { addGoal, getCategories, updateGoal } from "~/services/api/goals";
import { useAuth } from "~/context/AuthContext";
import Alert from "~/components/ui/Alert";
import type { Goal } from "~/types/goals/Goal";
import type { GoalCategoryDto } from "~/types/goals/GoalCategoryDto";
import Checkbox from "~/components/form/input/Checkbox";

type AddEditGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoalChanged: () => void;
  goal: Goal | null;
};

const timeFrameValues = [
  { value: "0", key: "Monthly" },
  { value: "1", key: "Quarterly" },
  { value: "2", key: "Biannual" },
  { value: "3", key: "Annually" },
] as const;

function getTodayDate(): string {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

export function AddEditGoalModal({
  isOpen,
  onClose,
  onGoalChanged,
  goal,
}: AddEditGoalModalProps) {
  const { t } = useTranslation();
  const currentUserId = useAuth()?.currentUserId;

  const isEdit = goal !== null;

  const [goalTitle, setGoalTitle] = useState("");
  const [goalTitleValid, setGoalTitleValid] = useState(true);

  const [goalCategoryId, setGoalCategoryId] = useState("");
  const [goalCategoryValid, setGoalCategoryValid] = useState(true);

  const [timeFrame, setTimeFrame] = useState("");
  const [timeFrameValid, setTimeFrameValid] = useState(true);

  const [deadline, setDeadline] = useState(getTodayDate());
  const [deadlineValid, setDeadlineValid] = useState(true);

  const [isDone, setIsDone] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [categories, setCategories] = useState<GoalCategoryDto[]>([]);

  const timeFrameMap: Record<string, string> = {
    Monthly: "0",
    Quarterly: "1",
    Biannual: "2",
    Annually: "3",
  };

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      const result = await getCategories();

      if (!ignore && typeof result !== "string") {
        setCategories(result);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (goal) {
      setGoalTitle(goal.title.trim());

      const category = categories.find(
        (item) => item.title === goal.categoryTitle,
      );

      setGoalCategoryId(category ? String(category.categoryId) : "");

      setTimeFrame(timeFrameMap[goal.timeFrame] ?? "");

      setDeadline(new Date(goal.deadline).toISOString().slice(0, 10));

      setIsDone(goal.isDone);

      setGoalTitleValid(true);
      setGoalCategoryValid(!!category);
      setTimeFrameValid(true);
      setDeadlineValid(true);
    } else {
      resetForm();
    }

    setError(null);
    setSuccess(false);
  }, [isOpen, goal, categories]);

  const categoryOptions = categories.map((category) => ({
    value: String(category.categoryId),
    label: String(t(`goals.categories.${category.title}`)),
  }));

  const timeFrameOptions = [
    {
      value: "0",
      label: String(t("goals.timeFrames.Monthly")),
    },
    {
      value: "1",
      label: String(t("goals.timeFrames.Quarterly")),
    },
    {
      value: "2",
      label: String(t("goals.timeFrames.Biannual")),
    },
    {
      value: "3",
      label: String(t("goals.timeFrames.Annually")),
    },
  ];

  function resetForm() {
    setGoalTitle("");
    setGoalCategoryId("");
    setTimeFrame("");
    setDeadline(getTodayDate());
    setIsDone(false);

    setGoalTitleValid(true);
    setGoalCategoryValid(true);
    setTimeFrameValid(true);
    setDeadlineValid(true);
  }

  function validateFields() {
    return (
      goalTitle.trim() !== "" &&
      goalCategoryId !== "" &&
      timeFrame !== "" &&
      deadline !== ""
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateFields()) {
      setGoalTitleValid(goalTitle.trim() !== "");
      setGoalCategoryValid(goalCategoryId !== "");
      setTimeFrameValid(timeFrame !== "");
      setDeadlineValid(deadline !== "");
      return;
    }

    if (currentUserId == null) return;

    setSaving(true);
    setError(null);

    let result;

    if (goal) {
      result = await updateGoal({
        goalId: goal.goalId,
        goalCategoryId: Number(goalCategoryId),
        title: goalTitle.trim(),
        timeFrame: Number(timeFrame),
        deadline,
        isDone,
      });
    } else {
      result = await addGoal({
        userId: currentUserId,
        goalCategoryId: Number(goalCategoryId),
        title: goalTitle.trim(),
        timeFrame: Number(timeFrame),
        deadline,
      });
    }

    if (typeof result === "string") {
      setError(result);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);

    onGoalChanged();

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
        {error && (
          <div className="mt-6 mb-4">
            <Alert
              variant="error"
              title={t("goals.alerts.error")}
              message={error}
            />
          </div>
        )}

        {success && (
          <div className="mt-6 mb-4">
            <Alert
              variant="success"
              title={t("goals.alerts.success")}
              message={t(
                isEdit ? "goals.alerts.updated" : "goals.alerts.added",
              )}
            />
          </div>
        )}

        <h3 className="mb-6 text-lg font-semibold dark:text-white">
          {t(isEdit ? "goals.modal.editTitle" : "goals.modal.addTitle")}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Goal Title */}
            <div>
              <Label htmlFor="goalTitle">{t("goals.fields.title")}</Label>

              <Input
                id="goalTitle"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                hint={
                  !goalTitleValid ? t("goals.validation.required") : undefined
                }
                onBlur={() => setGoalTitleValid(goalTitle.trim() !== "")}
                error={!goalTitleValid}
              />
            </div>

            {/* Goal Category */}
            <div>
              <Label>{t("goals.fields.category")}</Label>

              <Select
                options={categoryOptions}
                value={goalCategoryId}
                placeholder={t("goals.placeholders.category")}
                onChange={(value) => {
                  setGoalCategoryId(value);
                  setGoalCategoryValid(value !== "");
                }}
              />

              {!goalCategoryValid && (
                <p className="mt-1.5 text-sm text-error-500">
                  {t("goals.validation.required")}
                </p>
              )}
            </div>

            {/* Time Frame */}
            <div>
              <Label>{t("goals.fields.timeFrame")}</Label>

              <Select
                options={timeFrameOptions}
                value={timeFrame}
                placeholder={t("goals.placeholders.timeFrame")}
                onChange={(value) => {
                  setTimeFrame(value);
                  setTimeFrameValid(value !== "");
                }}
              />

              {!timeFrameValid && (
                <p className="mt-1.5 text-sm text-error-500">
                  {t("goals.validation.required")}
                </p>
              )}
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="deadline">{t("goals.fields.deadline")}</Label>

              <DatePicker
                id="deadline"
                minDate={isEdit ? undefined : new Date()}
                defaultDate={deadline}
                onChange={(selectedDates) => {
                  if (selectedDates.length > 0) {
                    const date = selectedDates[0];

                    const formattedDate = [
                      date.getFullYear(),
                      String(date.getMonth() + 1).padStart(2, "0"),
                      String(date.getDate()).padStart(2, "0"),
                    ].join("-");

                    setDeadline(formattedDate);
                    setDeadlineValid(true);
                  }
                }}
              />

              {!deadlineValid && (
                <p className="mt-1.5 text-sm text-error-500">
                  {t("goals.validation.required")}
                </p>
              )}
            </div>

            {/* Completion Status */}
            {goal !== null && (
              <Checkbox
                label={t("goals.fields.markCompleted")}
                checked={isDone}
                onChange={setIsDone}
              />
            )}
          </div>

          <Button className="mt-6 w-full" size="md" disabled={saving}>
            {saving
              ? t(isEdit ? "goals.buttons.updating" : "goals.buttons.adding")
              : t(isEdit ? "goals.buttons.update" : "goals.buttons.add")}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
