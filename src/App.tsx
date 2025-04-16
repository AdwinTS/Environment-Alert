import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "./components/ui/toaster";
import { AlertList } from "./components/AlertList";
import { CreateAlertForm } from "./components/CreateAlertForm";
import { useEffect } from "react";
import { useToast } from "./hooks/use-toast";

export default function App() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Environmental Alert System</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold accent-text mb-4">Environmental Alert System</h1>
        <Authenticated>
          <p className="text-xl text-slate-600">Welcome, {loggedInUser?.email}</p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to access alerts</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <NotificationHandler />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Create Alert</h2>
            <CreateAlertForm />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Active Alerts</h2>
            <AlertList />
          </div>
        </div>
      </Authenticated>
    </div>
  );
}

function NotificationHandler() {
  const unreadAlerts = useQuery(api.alerts.getUnreadNotifications);

  useEffect(() => {
    if (unreadAlerts?.length) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          unreadAlerts.forEach((alert) => {
            if (alert) {
              new Notification(alert.title, {
                body: alert.description,
              });
            }
          });
        }
      });
    }
  }, [unreadAlerts]);

  return null;
}
