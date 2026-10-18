import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/signin.tsx"),

  route("signup", "routes/signup.tsx"),
  route("confirm", "routes/confirm.tsx"),
  route("notConfirmed", "routes/notConfirmed.tsx"),
  route("reset-password", "routes/forgetPassword.tsx"),

  route("dashboard", "routes/dashboard.tsx", [
    index("routes/home.tsx"),
    route("goals", "routes/goals.tsx"),
    route("tasks", "routes/tasks.tsx"),
    route("habits", "routes/habits.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
