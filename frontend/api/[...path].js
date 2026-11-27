export default async function handler(req, res) {
  const { path = [] } = req.query;
  const endpoint = Array.isArray(path) ? path.join("/") : path;
  // Pertahankan trailing slash karena ORDS membutuhkannya
  const hasTrailingSlash = req.url.split("?")[0].endsWith("/");
  const targetUrl = `https://iacademy.oracle.com/ords/id_b633_sql_s35/api/${endpoint}${hasTrailingSlash ? "/" : ""}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
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
