import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { RouteErrorPage } from "./RouteErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("../features/overview/OverviewPage");
          return { Component: module.OverviewPage };
        },
      },
      {
        path: "analytics",
        lazy: async () => {
          const module = await import("../features/incidents/IncidentsPage");
          return { Component: module.IncidentsPage };
        },
      },
      {
        path: "reports",
        lazy: async () => {
          const module = await import("../features/reports/ReportsPage");
          return { Component: module.ReportsPage };
        },
      },
      {
        path: "recovery",
        lazy: async () => {
          const module = await import("../features/recovery/RecoveryHistoryPage");
          return { Component: module.RecoveryHistoryPage };
        },
      },
      {
        path: "settings",
        lazy: async () => {
          const module = await import("../features/settings/SettingsPage");
          return { Component: module.SettingsPage };
        },
      },
    ],
  },
]);
