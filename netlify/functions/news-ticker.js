const FEEDS = [
  "https://news.google.com/rss/search?q=(emergency+preparedness+OR+wildfire+OR+flooding+OR+hurricane+OR+severe+weather)&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=(survival+skills+OR+emergency+readiness+OR+disaster+response)&hl=en-US&gl=US&ceid=US:en"
];

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractTitles(xml) {
  const titles = [];
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const titleRegex = /<title>([\s\S]*?)<\/title>/i;
  const items = xml.match(itemRegex) || [];

  for (const item of items) {
    const match = item.match(titleRegex);
    if (!match) {
      continue;
    }

    const title = decodeXml(match[1])
      .replace(/\s+/g, " ")
      .replace(/ - [^-]+$/, "")
      .trim();

    if (title && !/Google News/i.test(title)) {
      titles.push({ title });
    }
  }

  return titles.slice(0, 8);
}

exports.handler = async function handler() {
  for (const url of FEEDS) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "trained-response-news-ticker"
        }
      });

      if (!response.ok) {
        continue;
      }

      const xml = await response.text();
      const headlines = extractTitles(xml);

      if (headlines.length > 0) {
        return {
          statusCode: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=900"
          },
          body: JSON.stringify({ headlines })
        };
      }
    } catch (error) {
      continue;
    }
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300"
    },
    body: JSON.stringify({ headlines: [] })
  };
};
