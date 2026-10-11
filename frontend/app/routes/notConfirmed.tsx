import Alert from "~/components/ui/Alert";

const NotConfirmed: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-lg">
        <Alert
          variant="warning"
          title="Account Not Confirmed"
          message="Your account has not been confirmed yet. Please check your email inbox for the confirmation email and follow the instructions to verify your account."
        />
      </div>
    </div>
  );
};

export default NotConfirmed;
