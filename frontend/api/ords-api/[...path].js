export default async function handler(req, res) {
  const forwardPath = req.url.replace(/^\/ords-api/, "");
  const targetUrl = `https://iacademy.oracle.com/ords/id_b633_sql_s35/api${forwardPath}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      const bodyStr =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      if (bodyStr && bodyStr !== "{}") {
        fetchOptions.body = bodyStr;
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();

    res.status(response.status);
    res.setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Gagal menghubungi Oracle ORDS", detail: error.message });
  }
}
