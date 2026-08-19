// Server酱推送脚本
// 通过 GitHub Actions cron 触发，向微信推送提醒消息
const https = require('https');

const SENDKEY = process.env.SERVERCHAN_KEY;
const HOUR = parseInt(process.env.PUSH_HOUR || '0');

// 根据时间决定推送内容
let title, desp;
if (HOUR === 8) {
  title = '学习计划时间到了';
  desp = '## 早安\n\n8:00 学习计划该推了，去拾光看看今天的安排\n\n[点开拾光](https://chrysaliah.github.io/zhao-ming/)';
} else if (HOUR === 22) {
  title = '该写今日复盘了';
  desp = '## 晚安前\n\n22:30 学习复盘时间，去拾光写今天的复盘\n\n[点开拾光](https://chrysaliah.github.io/zhao-ming/)';
} else {
  title = '拾光提醒';
  desp = '去看看今天的打卡和计划\n\n[点开拾光](https://chrysaliah.github.io/zhao-ming/)';
}

const postData = JSON.stringify({ title, desp });

const options = {
  hostname: 'sctapi.ftqq.com',
  path: `/${SENDKEY}.send`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    if (res.statusCode === 200) {
      console.log('✅ 微信推送成功');
    } else {
      console.log('❌ 推送失败');
    }
  });
});

req.on('error', (e) => {
  console.error('推送请求出错:', e.message);
});

req.write(postData);
req.end();
