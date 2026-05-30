import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const findChromePath = () => {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH

  const candidates = [
    'google-chrome-stable',
    'google-chrome',
    'chromium-browser',
    'chromium',
    'brave-browser',
  ]

  for (const candidate of candidates) {
    try {
      const resolved = execFileSync('command', ['-v', candidate], {
        encoding: 'utf8',
        shell: true,
      }).trim()

      if (resolved && existsSync(resolved)) return resolved
    } catch {
      // Try the next candidate.
    }
  }

  return null
}

const chromePath = findChromePath()

if (chromePath) {
  process.env.CHROME_PATH = chromePath
}

const targetUrl = process.argv[2] ?? 'http://localhost:3000'
const mode = process.argv[3] ?? 'desktop'
const outputPath =
  mode === 'mobile' ? '/tmp/hitsuji-lighthouse-mobile.json' : '/tmp/hitsuji-lighthouse.json'

const startServer = () => {
  return spawn('yarn', ['next', 'start', '-p', '3000'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  })
}

const waitForServer = async (url, timeoutMs = 30_000) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)

      if (response.ok || response.status < 500) {
        return
      }
    } catch {
      // Server is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Server did not become ready at ${url}`)
}

const run = (command, args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
    })

    child.on('error', reject)

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

const printReport = async (path) => {
  const report = JSON.parse(await fs.readFile(path, 'utf8'))
  const audits = report.audits

  console.table({
    performance: Math.round(report.categories.performance.score * 100),
    FCP: audits['first-contentful-paint'].displayValue,
    LCP: audits['largest-contentful-paint'].displayValue,
    TBT: audits['total-blocking-time'].displayValue,
    CLS: audits['cumulative-layout-shift'].displayValue,
    SI: audits['speed-index'].displayValue,
  })
}

const lighthouseArgs =
  mode === 'mobile'
    ? [
        'dlx',
        'lighthouse',
        targetUrl,
        '--only-categories=performance',
        '--form-factor=mobile',
        '--screenEmulation.mobile=true',
        '--screenEmulation.width=390',
        '--screenEmulation.height=844',
        '--screenEmulation.deviceScaleFactor=3',
        '--throttling-method=simulate',
        '--chrome-flags=--headless',
        '--output=json',
        `--output-path=${outputPath}`,
      ]
    : [
        'dlx',
        'lighthouse',
        targetUrl,
        '--only-categories=performance',
        '--preset=desktop',
        '--chrome-flags=--headless',
        '--output=json',
        `--output-path=${outputPath}`,
      ]

const server = startServer()

server.stdout.on('data', (chunk) => {
  process.stdout.write(chunk)
})

server.stderr.on('data', (chunk) => {
  process.stderr.write(chunk)
})

try {
  await waitForServer(targetUrl)
  await run('yarn', lighthouseArgs)
  await printReport(outputPath)
} finally {
  server.kill('SIGTERM')
}
