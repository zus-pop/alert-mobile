import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notification from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  let token: string | null = null;
  if (Platform.OS === "android") {
    Notification.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notification.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notification.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notification.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }

    try {
      token = (await Notification.getDevicePushTokenAsync()).data;
    } catch (error) {
      handleRegistrationError(`${error}`);
    }
  } else {
    handleRegistrationError("Must use physic device for push notification");
  }
  return token;
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  //   throw new Error(errorMessage);
}
