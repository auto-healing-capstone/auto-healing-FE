import { RouterProvider } from "react-router";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { router } from "../routes";
import { RouteLoadingScreen } from "../shared/ui/state-blocks";

export default function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} fallbackElement={<RouteLoadingScreen />} />
    </AppErrorBoundary>
  );
}
