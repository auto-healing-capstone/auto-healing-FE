import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { OverviewPage } from "../features/overview/OverviewPage";
import { IncidentsPage } from "../features/incidents/IncidentsPage";
import { ReportsPage } from "../features/reports/ReportsPage";
import { SettingsPage } from "../features/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: OverviewPage },
      { path: "analytics", Component: IncidentsPage },
      { path: "reports", Component: ReportsPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
