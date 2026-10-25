/**
 * 元宝搜索 (Tencent WSA SearchPro) 接口全面诊断测试脚本
 * 运行方式: node test-search.js
 */

const DEFAULT_API_KEY = process.env.YUANBAO_API_KEY || '';
const PROXY_URL = 'http://localhost:3000/api/search';
const DIRECT_URL = 'https://api.wsa.cloud.tencent.com/SearchPro';

const colors = {
  reset: '\x1b[0',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function runDiagnostics() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 腾讯云元宝搜索 (WSA SearchPro) 接口全面连通性与参数诊断');
  console.log('='.repeat(60) + '\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Direct Cloud API Connectivity
  totalTests++;
  console.log(`[测试 1] 腾讯云官方直连测试 (https://api.wsa.cloud.tencent.com/SearchPro)`);
  try {
    const t0 = Date.now();
    const res = await fetch(DIRECT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${DEFAULT_API_KEY}`,
      },
      body: JSON.stringify({
        Query: '腾讯元宝搜索',
        Cnt: 10,
      }),
    });
    const latency = Date.now() - t0;
    const data = await res.json();

    if (data.Response?.Error) {
      console.log(`❌ 腾讯云直连返回错误: [${data.Response.Error.Code}] ${data.Response.Error.Message}`);
    } else if (Array.isArray(data.Response?.Pages) && data.Response.Pages.length > 0) {
      console.log(`✅ 直连成功！HTTP ${res.status} | 耗时: ${latency}ms | 召回条数: ${data.Response.Pages.length}`);
      const first = JSON.parse(data.Response.Pages[0]);
      console.log(`   示例信源: 《${first.title || '无标题'}》- ${first.site || first.url}`);
      passedTests++;
    } else {
      console.log(`⚠️ 直连响应无信源数据: ${JSON.stringify(data).slice(0, 100)}`);
    }
  } catch (err) {
    console.log(`❌ 直连请求失败: ${err.message}`);
  }

  console.log('-'.repeat(60));

  // Test 2: Local Vite Dev Proxy
  totalTests++;
  console.log(`[测试 2] 本地 Vite 代理端点测试 (http://localhost:3000/api/search)`);
  try {
    const t0 = Date.now();
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        Query: '中国人工智能发展',
        Cnt: 10,
      }),
    });
    const latency = Date.now() - t0;
    const data = await res.json();

    if (data.Response?.Error) {
      console.log(`❌ 代理端点返回错误: [${data.Response.Error.Code}] ${data.Response.Error.Message}`);
    } else if (Array.isArray(data.Response?.Pages) && data.Response.Pages.length > 0) {
      console.log(`✅ 本地代理成功！HTTP ${res.status} | 耗时: ${latency}ms | 召回条数: ${data.Response.Pages.length}`);
      const first = JSON.parse(data.Response.Pages[0]);
      console.log(`   示例信源: 《${first.title || '无标题'}》- ${first.site || first.url}`);
      passedTests++;
    } else {
      console.log(`⚠️ 代理端点响应无信源数据: ${JSON.stringify(data).slice(0, 100)}`);
    }
  } catch (err) {
    console.log(`❌ 本地代理请求失败 (请确认 npm run dev 是否已启动): ${err.message}`);
  }

  console.log('-'.repeat(60));

  // Test 3: Parameter Cnt Auto-Correction
  totalTests++;
  console.log(`[测试 3] 参数容错性测试 (传入非 10 整数倍 Cnt: 5，验证代理层是否自动规避 illegal Cnt)`);
  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        Query: '元宝搜索',
        Cnt: 5, // Tencent WSA requires multiples of 10
      }),
    });
    const data = await res.json();

    if (data.Response?.Error?.Message === 'illegal Cnt') {
      console.log(`❌ 未自动容错 Cnt:5，仍触发 illegal Cnt`);
    } else if (Array.isArray(data.Response?.Pages)) {
      console.log(`✅ 容错修复生效！传入 Cnt:5 已被代理层自动平滑向上修正为合法参数并成功返回 ${data.Response.Pages.length} 条`);
      passedTests++;
    } else {
      console.log(`⚠️ 未知响应: ${JSON.stringify(data).slice(0, 100)}`);
    }
  } catch (err) {
    console.log(`❌ 请求失败: ${err.message}`);
  }

  console.log('-'.repeat(60));

  // Test 4: GET Health Check
  totalTests++;
  console.log(`[测试 4] GET 请求健康检查测试 (浏览器直接访问 http://localhost:3000/api/search)`);
  try {
    const res = await fetch(PROXY_URL);
    const data = await res.json();
    if (data.status === 'online') {
      console.log(`✅ GET 健康检查正常返回 JSON: ${JSON.stringify(data)}`);
      passedTests++;
    } else {
      console.log(`⚠️ GET 返回非预期 JSON: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ GET 请求失败: ${err.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 诊断总结: 共 ${totalTests} 项测试，通过: ${passedTests}/${totalTests}`);
  if (passedTests === totalTests) {
    console.log('🎉 所有测试全部通过！元宝搜索接口与代理配置完全正常！');
  } else {
    console.log('⚠️ 存在未通过的测试项，请根据上述提示排查。');
  }
  console.log('='.repeat(60) + '\n');
}

runDiagnostics();
