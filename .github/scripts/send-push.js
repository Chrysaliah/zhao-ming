// ntfy 推送脚本
// 通过 GitHub Actions cron 触发，向手机弹系统通知
const https = require('https');

const TOPIC = 'ruozhao-reminders-2026';
const HOUR = process.env.PUSH_HOUR || '0';

let title, body;
if (HOUR === '8') {
  title = '📚 学习计划时间到了';
  body = '8:00 学习计划该推了，去拾光看看今天的安排\n\nhttps://chrysaliah.github.io/zhao-ming/';
} else if (HOUR === '22') {
  title = '📝 该写今日复盘了';
  body = '22:30 学习复盘时间，去拾光写今天的复盘\n\nhttps://chrysaliah.github.io/zhao-ming/';
} else {
  title = '拾光提醒';
  body = '去看看今天的打卡和计划\n\nhttps://chrysaliah.github.io/zhao-ming/';
}

const postData = title + '\n' + body;

const options = {
  hostname: 'ntfy.sh',
  path: `/${TOPIC}`,
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Title': title,
    'Tags': 'bell',
    'Click': 'https://chrysaliah.github.io/zhao-ming/',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log('✅ ntfy推送成功');
    } else {
      console.log('❌ 推送失败');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('推送请求出错:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();
