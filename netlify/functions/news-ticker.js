const FEEDS = [
  {
    topic: "wildfire",
    url: "https://news.google.com/rss/search?q=wildfire+evacuation+OR+wildfire+emergency&hl=en-US&gl=US&ceid=US:en"
  },
  {
    topic: "flood",
    url: "https://news.google.com/rss/search?q=flooding+emergency+OR+flash+flood+warning&hl=en-US&gl=US&ceid=US:en"
  },
  {
    topic: "severe-weather",
    url: "https://news.google.com/rss/search?q=tornado+warning+OR+severe+weather+emergency&hl=en-US&gl=US&ceid=US:en"
  },
  {
    topic: "earthquake",
    url: "https://news.google.com/rss/search?q=earthquake+emergency+OR+earthquake+preparedness&hl=en-US&gl=US&ceid=US:en"
  },
  {
    topic: "heat",
    url: "https://news.google.com/rss/search?q=extreme+heat+emergency+OR+heat+advisory+safety&hl=en-US&gl=US&ceid=US:en"
  },
  {
    topic: "winter",
    url: "https://news.google.com/rss/search?q=winter+storm+emergency+OR+blizzard+warning&hl=en-US&gl=US&ceid=US:en"
  },
  {
    topic: "public-safety",
    url: "https://news.google.com/rss/search?q=emergency+alerts+OR+evacuation+orders+OR+disaster+response&hl=en-US&gl=US&ceid=US:en"
  }
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

function normalizeTitle(value) {
  return decodeXml(value)
    .replace(/\s+/g, " ")
    .replace(/ - [^-]+$/, "")
    .trim();
}

function extractTitles(xml, topic) {
  const titles = [];
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const titleRegex = /<title>([\s\S]*?)<\/title>/i;
  const items = xml.match(itemRegex) || [];

  for (const item of items) {
    const match = item.match(titleRegex);
    if (!match) {
      continue;
    }

    const title = normalizeTitle(match[1]);

    if (title && !/Google News/i.test(title)) {
      titles.push({ title, topic });
    }
  }

  return titles.slice(0, 4);
}

function dedupeByTitle(items) {
  const seen = new Set();
  const deduped = [];

  for (const item of items) {
    const key = item.title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

function interleaveByTopic(groups, limit) {
  const mixed = [];
  let index = 0;

  while (mixed.length < limit) {
    let added = false;

    for (const group of groups) {
      if (group[index]) {
        mixed.push(group[index]);
        added = true;

        if (mixed.length === limit) {
          break;
        }
      }
    }

    if (!added) {
      break;
    }

    index += 1;
  }

  return mixed;
}

async function fetchFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        "user-agent": "trained-response-news-ticker"
      }
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    return extractTitles(xml, feed.topic);
  } catch (error) {
    return [];
  }
}

exports.handler = async function handler() {
  const groups = await Promise.all(FEEDS.map(fetchFeed));
  const headlines = dedupeByTitle(interleaveByTopic(groups, 12)).map(({ title }) => ({ title }));

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify({ headlines })
  };
};
