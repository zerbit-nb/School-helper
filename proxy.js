

const http = require('http');
const https = require('https');
const fs = require('fs'); 
const path = require('path');

const PORT = 3000;


const XUNFEI_API_KEY = 'c16d58dcd0122fc8ec3425ff28c529a8';
const XUNFEI_API_SECRET = 'NzAwOTY1MDBlODY1ODc2ZDc1M2YyYmIz';

const server = http.createServer((req, res) => {
   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/xunfei/chat') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            let userRequest = JSON.parse(body);
            let userQuestion = userRequest.messages[userRequest.messages.length - 1].content;

    
            let schoolRules = "";
            try {
                const dataPath = path.join(__dirname, 'data', '校规手册.txt');
                if (fs.existsSync(dataPath)) {
                    schoolRules = fs.readFileSync(dataPath, 'utf-8');
                }
            } catch (err) {
                console.log("暂时没翻到书，正常回答就好");
            }


            const systemPrompt = `
# 人物设定
你叫“AI校园助手”，是大学的资深校园智能管家。你的性格温柔、耐心、严谨且博学。
说话语气像一位平易近人的学长，常用“同学你好”开头。

# 核心任务
请严格参考以下【参考资料】来回答【学生提问】。
1. 如果资料中明确提到了相关规定，请准确回答并给予温馨提示。
2. 如果资料中没有提到相关细节，请委婉告知并引导学生咨询辅导员或相关部门。
3. 绝对不要编造不属于该学校的规定。

# 参考资料
${schoolRules || "暂无特定资料，请礼貌回答。"}

# 学生提问
${userQuestion}
`;

      
            userRequest.messages[userRequest.messages.length - 1].content = systemPrompt;

            const options = {
                hostname: 'spark-api-open.xf-yun.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + XUNFEI_API_KEY + ':' + XUNFEI_API_SECRET
                }
            };

            const proxyReq = https.request(options, proxyRes => {
                let data = '';
                proxyRes.on('data', chunk => { data += chunk; });
                proxyRes.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                });
            });

            proxyReq.on('error', err => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });

            proxyReq.write(JSON.stringify(userRequest));
            proxyReq.end();
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log('✅ AI助手后端已成功启动！');
    console.log('ctrl + c 退出');
});