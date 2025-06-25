import myAxios from "../utils/my-axios";

export async function updatePushToken(token: string) {
  try {
    const res = await myAxios.post("/auth/deviceToken", {
      token: token,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function removePushToken(token: string) {
  try {
    const res = await myAxios.delete("/auth/deviceToken", {
      params: {
        token: token,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
}
