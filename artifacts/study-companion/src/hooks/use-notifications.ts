import { useEffect, useState } from "react";
import { useGetAssignmentsDueSoon } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  
  // Try catching the hook in case it is missing in the api-client for some reason
  let dueSoon: any[] = [];
  try {
    const query = useGetAssignmentsDueSoon();
    dueSoon = query.data || [];
  } catch (e) {
    // Graceful fallback
  }

  const { toast } = useToast();

  const requestPermission = async () => {
    if (typeof Notification !== "undefined") {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  useEffect(() => {
    if (typeof Notification !== "undefined" && permission === "default") {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (!dueSoon || dueSoon.length === 0) return;

    const notifiedStr = sessionStorage.getItem("notifiedAssignments");
    const notified = notifiedStr ? JSON.parse(notifiedStr) : [];

    dueSoon.forEach((assignment: any) => {
      if (!notified.includes(assignment.id)) {
        if (permission === "granted") {
          new Notification("Assignment Due Soon!", {
            body: `${assignment.title} is due within 24 hours.`,
          });
        }

        toast({
          title: "Upcoming Deadline",
          description: `${assignment.title} is due soon!`,
          variant: "destructive",
        });

        notified.push(assignment.id);
      }
    });

    sessionStorage.setItem("notifiedAssignments", JSON.stringify(notified));
  }, [dueSoon, permission, toast]);

  return { permission, requestPermission, dueSoon };
}
