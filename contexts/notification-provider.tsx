import { removePushToken, updatePushToken } from "@/apis/auth.api";
import { registerForPushNotificationsAsync } from "@/utils/register-for-push-notification-async";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPushToken: () => Promise<void>;
  deletePushToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  const requestPushToken = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        updatePushToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePushToken = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(null);
        await removePushToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "🔔 Notification Received while user in the app: ",
          notification
        );
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response when user interact with notification: "
        );
        // Handle the notification response here
        const data = response.notification.request.content.data;

        if (data.type && data.type === "alert") {
          router.push({
            pathname: "/notification-detail",
            params: {
              notificationId: data.id as string,
            },
          });
        }
      });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        console.log("No last notification response or component unmounted.");
        return;
      }
      console.log(
        "🔔 Last Notification Response when app was closed: ",
        response.notification
      );
      const data = response.notification.request.content.data;

      if (data.type && data.type === "alert") {
        router.push({
          pathname: "/notification-detail",
          params: {
            notificationId: data.id as string,
          },
        });
      }
    });

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken: pushToken,
        notification,
        requestPushToken,
        deletePushToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
