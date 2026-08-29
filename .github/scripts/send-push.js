// ntfy 推送脚本
// 通过 GitHub Actions cron 触发，向手机弹系统通知（带提示音+展开内容）
const https = require('https');

const TOPIC = process.env.NTFY_TOPIC || 'ruozhao-reminders-2026';
const HOUR = process.env.PUSH_HOUR || '0';

function getStudyPlanWeek() {
  const now = new Date();
  const start = new Date('2026-09-05T00:00:00');
  const diff = Math.floor((now - start) / 86400000);
  if (diff < 0) return { week: 0, label: '未启动', tasks: ['复读计划尚未开始，9月5日启动'] };
  if (diff < 7) return {
    week: 1, label: '第1周 · 开步',
    tasks: [
      '📐 数学 · 逆向法：找初二函数代表题，试5min→答案找缺口→补教材概念',
      '📐 数学 · 函数断口修补：变量关系→函数定义→图像理解',
      '📖 英语 · 词汇：词根词缀法，每天20词，3次默写过关',
      '📖 英语 · 听力：听→读→做题，每天15min'
    ],
    tip: '数学动作：代表题→试5min→答案找缺口→教材补概念→回来解→双练巩固'
  };
  if (diff < 14) return {
    week: 2, label: '第2周 · 加码',
    tasks: [
      '📐 数学 · 继续函数修补 + 选择填空专项训练',
      '📖 英语 · 词汇积累继续 + 阅读/写作隔天轮换',
      '⚡ 物理 · 力学基础：黄夫人视频对应章节，画画面可',
      '⚡ 物理 · 公式是画面的数学翻译，先理解再记公式'
    ],
    tip: '物理动作：代表题→画画面→卡→黄夫人对应讲→回来画→解'
  };
  return { week: 3, label: '第3周+', tasks: ['启动期已过，查看拾光司辰页面的完整计划'], tip: '' };
}

function sendPush(title, body) {
  const query = `?title=${encodeURIComponent(title)}&tags=bell&priority=high`;
  const path = `/${TOPIC}${query}`;

  const options = {
    hostname: 'ntfy.sh',
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status: ' + res.statusCode);
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log('ntfy推送成功: ' + title);
      } else {
        console.log('推送失败');
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error('推送请求出错: ' + e.message);
    process.exit(1);
  });

  req.write(body);
  req.end();
}

let title, body;

if (HOUR === '8') {
  // 早上8点：学习计划 + 今日任务
  const plan = getStudyPlanWeek();
  if (plan.week > 0 && plan.week <= 2) {
    title = '📨 今日学习计划 · ' + plan.label;
    body = '今日任务：\n\n' +
      plan.tasks.join('\n') + '\n\n' +
      plan.tip + '\n\n' +
      '💡 5分钟启动：不想学只承诺"看5分钟" · 完成>完美';
  } else {
    title = '学习计划时间到了';
    body = '8:00 学习计划该推了，去拾光看看今天的安排';
  }
} else if (HOUR === '22') {
  title = '该写今日复盘了';
  body = '22:30 学习复盘时间，去拾光写今天的复盘';
} else {
  title = '拾光提醒';
  body = '去看看今天的打卡和计划';
}

sendPush(title, body);