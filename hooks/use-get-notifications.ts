import { useEffect, useState } from "react";

export type DbNotification = {
  id: number;

  audience: string; 

  type: string;

  title: string;

  content: string;

  content_type: string;

  short_description: string;

  template: string;

  status: string;
};


export type NotificationsResponse = {
  [user: string]: DbNotification[];
};

type UseNotificationsResult = {
  data: NotificationsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useGetNotifications(users: string[]): UseNotificationsResult {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (): Promise<void> => {
    if (users.length === 0) {
      setData({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: Response = await fetch(
        `${'http://localhost:3000'}/notifications/get`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "59ebf96af28cda09aaaece1209d53ddf7c80561e4571d46c7e798f75320be689",
          },
          body: JSON.stringify({ users }),
        }
      );

      if (!response.ok) {
        const text: string = await response.text();
        throw new Error(text || "Failed to fetch notifications");
      }

      const json: NotificationsResponse = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(users)]); // evita loops por referencia

  return {
    data,
    loading,
    error,
    refetch: fetchNotifications,
  };
}
