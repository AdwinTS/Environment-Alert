import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AlertList() {
  const alerts = useQuery(api.alerts.listAlerts, { status: "active" });
  const markRead = useMutation(api.alerts.markNotificationRead);

  if (!alerts) {
    return <div>Loading...</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert._id}
          className="p-4 rounded-lg border shadow-sm"
          onClick={() => markRead({ alertId: alert._id })}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{alert.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-sm ${getSeverityColor(
                alert.severity
              )}`}
            >
              {alert.severity}
            </span>
          </div>
          <p className="text-gray-600">{alert.description}</p>
          <p className="text-sm text-gray-500 mt-2">Location: {alert.location}</p>
        </div>
      ))}
      {alerts.length === 0 && (
        <p className="text-center text-gray-500">No active alerts</p>
      )}
    </div>
  );
}
