const webpush = require("web-push");

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SB_URL = process.env.SB_URL;
const SB_ANON = process.env.SB_ANON_KEY;

webpush.setVapidDetails(
  "mailto:chrysaliah@users.noreply.github.com",
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

// Determine message based on UTC hour
// 0:00 UTC = 08:00 Beijing, 14:30 UTC = 22:30 Beijing
const h = new Date().getUTCHours();
let title, body;
if (h < 2) {
  title = "📚 学习计划时间到了";
  body = "8:00了，去拾光看看今天的计划";
} else {
  title = "📝 该写复盘了";
  body = "22:30了，今天的复盘还没写";
}

async function main() {
  const url = `${SB_URL}/rest/v1/longming_messages?sender=eq.push_sub&order=ts.desc&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
  });
  const rows = await res.json();
  if (!rows || rows.length === 0) {
    console.log("No push subscription found, skipping.");
    return;
  }
  const subscription = JSON.parse(rows[0].text);
  const payload = JSON.stringify({
    title,
    body,
    url: "https://chrysaliah.github.io/zhao-ming/"
  });
  try {
    await webpush.sendNotification(subscription, payload);
    console.log(`Push sent: ${title} - ${body}`);
  } catch (err) {
    console.error("Push failed:", err.statusCode, err.message);
  }
}

main();
