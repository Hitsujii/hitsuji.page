import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { createServer } from 'node:net'

const mode = process.argv[2] ?? 'desktop'
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const getFreePort = () => {
  return new Promise((resolve, reject) => {
    const server = createServer()

    server.listen(0, () => {
      const address = server.address()

      if (!address || typeof address === 'string') {
        server.close()
        reject(new Error('Could not determine free port'))
        return
      }

      const { port } = address

      server.close(() => {
        resolve(port)
      })
    })

    server.on('error', reject)
  })
}

const waitForServer = async (url, server, timeoutMs = 30_000) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`Next server exited before becoming ready with code ${server.exitCode}`)
    }

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

const run = (command, args, env = process.env) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
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

const port = await getFreePort()
const targetUrl = `http://localhost:${port}`
const outputPath =
  mode === 'mobile' ? '/tmp/hitsuji-lighthouse-mobile.json' : '/tmp/hitsuji-lighthouse.json'

const server = spawn(npmCommand, ['exec', '--', 'next', 'start', '-p', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
})

server.stdout.on('data', (chunk) => {
  process.stdout.write(chunk)
})

server.stderr.on('data', (chunk) => {
  process.stderr.write(chunk)
})

const lighthouseArgs =
  mode === 'mobile'
    ? [
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
        'lighthouse',
        targetUrl,
        '--only-categories=performance',
        '--preset=desktop',
        '--chrome-flags=--headless',
        '--output=json',
        `--output-path=${outputPath}`,
      ]

try {
  await waitForServer(targetUrl, server)
  await run(npmCommand, ['exec', '--yes', '--', ...lighthouseArgs])
  await printReport(outputPath)
} finally {
  server.kill('SIGTERM')
}
