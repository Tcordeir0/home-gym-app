/* Teste em browser real: serve a app, carrega no Chromium headless (viewport mobile),
   falha se houver erro de runtime (loop, TDZ, null) ou se a app não renderizar. */
const http = require('http')
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const PORT = 8099
const TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  if (p === '/') p = '/index.html'
  const fp = path.join(process.cwd(), p)
  fs.readFile(fp, (e, d) => {
    if (e) {
      res.writeHead(404)
      res.end()
      return
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp)] || 'application/octet-stream' })
    res.end(d)
  })
})

;(async () => {
  await new Promise((r) => server.listen(PORT, r))
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const heading = await page.evaluate(() => (document.querySelector('header h1') || {}).textContent || '')
  const rootLen = await page.evaluate(() => document.body.innerHTML.length)
  await browser.close()
  server.close()

  if (errors.length) {
    console.error('❌ Erros de runtime:\n  ' + errors.join('\n  '))
    process.exit(1)
  }
  if (!/HOME/i.test(heading) || rootLen < 5000) {
    console.error('❌ App não renderizou (header vazio / DOM pequeno)')
    process.exit(1)
  }
  console.log('✅ Runtime OK — app renderiza, sem erros (mobile 390px)')
})().catch((e) => {
  console.error('❌ Falha no teste:', e.message)
  process.exit(1)
})
