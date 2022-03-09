import { API_URL } from "../../../config/index";

export default async (req, res) => {
  if (req.method === "POST") {
    const { username,
      email,
      password1,
      password2,
      first_name,
      last_name
    } = req.body;

    const body = JSON.stringify({
      username,
      email,
      password1,
      password2,
      first_name,
      last_name
    });

    try {
      const apiRes = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await apiRes.json();

      if (apiRes.status === 201) {
        return res.status(201).json({ success: true });
      } else {
        return res.status(apiRes.status).json({
          data,
          error: data.error,
        });
      }
    } catch (err) {
      return res.status(500).json({
        error: "Something went wrong when registering for an account",
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
};
