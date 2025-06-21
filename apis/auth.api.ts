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
