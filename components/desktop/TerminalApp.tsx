'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { normalizeAppPath, withBasePath } from '@/components/path-utils'
import DesktopIcon from './DesktopIcon'
import { useDesktopShell } from './DesktopShellContext'
import { focusAfterWindowChange } from './focus-desktop'
import useDraggableWindow from './useDraggableWindow'
import WindowControlGlyph from './WindowControlGlyph'
import WindowResizeHandles from './WindowResizeHandles'
import WindowSystemMenu, { type WindowSystemMenuHandle } from './WindowSystemMenu'
import {
  runTerminalCommand,
  type TerminalAction,
  type TerminalCwd,
  type TerminalLine,
} from './terminal-core'

type RenderedLine = TerminalLine & {
  id: number
}

const COMPLETIONS = [
  'HELP',
  'DIR',
  'DIR POSTS',
  'DIR NOTES',
  'DIR LOGS',
  'DIR ABOUT',
  'CD ABOUT',
  'CD POSTS',
  'CD NOTES',
  'CD LOGS',
  'CD PROJECTS',
  'TYPE ABOUT.TXT',
  'START POSTS',
  'START NOTES',
  'START LOGS',
  'START PROJECTS',
  'START HITSUJI.PAGE',
  'START EXPLORER',
  'START FIND.EXE',
  'START ABOUT\\FRIEREN.CPP',
  'FIND ',
  'BCC32 FRIEREN.CPP',
  'FRIEREN.EXE',
  'TASKS',
  'VER',
  'DATE',
  'TIME',
  'CLS',
  'EXIT',
] as const

const initialLines: TerminalLine[] = [
  { text: 'Microsoft(R) Windows 98', tone: 'normal' },
  { text: '   (C)Copyright Microsoft Corp 1981-1998.', tone: 'normal' },
  { text: '', tone: 'normal' },
  { text: 'Type HELP for a list of commands.', tone: 'muted' },
  { text: '', tone: 'normal' },
]

const initialBuildLines: TerminalLine[] = [
  { text: 'Microsoft(R) Windows 98', tone: 'normal' },
  { text: '   (C)Copyright Microsoft Corp 1981-1998.', tone: 'normal' },
  { text: '', tone: 'normal' },
  { text: 'C:\\HITSUJI.PAGE>cd ABOUT', tone: 'normal' },
  { text: '', tone: 'normal' },
]

function promptPath(cwd: TerminalCwd) {
  return cwd === 'ROOT' ? 'C:\\HITSUJI.PAGE>' : `C:\\HITSUJI.PAGE\\${cwd}>`
}

export default function TerminalApp() {
  const {
    activeAppId,
    activateApp,
    compileAndRunFrieren,
    documents,
    finishFrierenBuild,
    frierenBuild,
    frierenCompiled,
    markFrierenCompiled,
    openBrowser,
    openExplorer,
    openFind,
    openFrierenExecutable,
    setAppMode,
    windows,
  } = useDesktopShell()
  const router = useRouter()
  const terminal = windows.terminal
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [cwd, setCwd] = useState<TerminalCwd>('ROOT')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [input, setInput] = useState('')
  const nextLineId = useRef(1)
  const [lines, setLines] = useState<RenderedLine[]>(() =>
    (frierenBuild ? initialBuildLines : initialLines).map((line) => ({
      ...line,
      id: nextLineId.current++,
    }))
  )
  const historyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const systemMenuRef = useRef<WindowSystemMenuHandle>(null)
  const windowRef = useRef<HTMLElement>(null)
  const pointerActivation = useRef(false)
  const previousActivation = useRef(terminal.activation)

  const isVisible = terminal.mode === 'normal' || terminal.mode === 'maximized'
  const isActive = activeAppId === 'terminal' && isVisible
  const { positioned, positionStyle, resizeHandleProps, sized, titleBarProps, wasDraggedRecently } =
    useDraggableWindow({
      appId: 'terminal',
      minHeight: 240,
      minWidth: 384,
      mode: terminal.mode,
      resizable: true,
      windowRef,
    })

  const openApps = useMemo(
    () =>
      Object.values(windows).map((app) => ({
        ...app,
        id: {
          browser: 'WEBBROWSER.EXE',
          explorer: 'EXPLORER.EXE',
          terminal: 'COMMAND.COM',
          frieren: 'FRIEREN.EXE',
          find: 'FIND.EXE',
        }[app.id],
      })),
    [windows]
  )

  const appendLines = useCallback((nextLines: TerminalLine[]) => {
    if (nextLines.length === 0) return
    setLines((current) => [
      ...current,
      ...nextLines.map((line) => ({ ...line, id: nextLineId.current++ })),
    ])
  }, [])

  const resetSession = useCallback(() => {
    setCommandHistory([])
    setCwd('ROOT')
    setHistoryIndex(-1)
    setInput('')
    setLines(initialLines.map((line) => ({ ...line, id: nextLineId.current++ })))
  }, [])

  const navigate = useCallback(
    (href: string) => {
      if (href.endsWith('.xml')) {
        window.open(withBasePath(href), '_blank', 'noopener,noreferrer')
        return
      }

      router.push(normalizeAppPath(href))
      openBrowser()
    },
    [openBrowser, router]
  )

  const performAction = useCallback(
    (action?: TerminalAction) => {
      if (!action) return

      switch (action.type) {
        case 'clear':
          setLines([])
          break
        case 'close':
          setAppMode('terminal', 'closed')
          focusAfterWindowChange('terminal', 'closed')
          break
        case 'compile-frieren-source':
          compileAndRunFrieren()
          break
        case 'mark-frieren-compiled':
          markFrierenCompiled()
          break
        case 'launch-frieren-exe':
          openFrierenExecutable()
          break
        case 'launch-browser':
          openBrowser()
          break
        case 'launch-explorer':
          openExplorer()
          break
        case 'launch-find':
          openFind()
          break
        case 'navigate':
          navigate(action.href)
          break
      }
    },
    [
      compileAndRunFrieren,
      markFrierenCompiled,
      navigate,
      openBrowser,
      openExplorer,
      openFind,
      openFrierenExecutable,
      setAppMode,
    ]
  )

  const execute = useCallback(
    (rawInput: string) => {
      const command = rawInput.trim()
      if (!command) return

      const result = runTerminalCommand(command, {
        cwd,
        documents,
        frierenCompiled,
        openApps,
      })
      const echo: TerminalLine = {
        text: `${promptPath(cwd)}${command}`,
        tone: 'normal',
      }

      setCommandHistory((current) => [...current, command])
      setHistoryIndex(-1)
      setInput('')

      if (result.action?.type !== 'clear' && result.action?.type !== 'close') {
        appendLines([echo, ...result.lines, { text: '', tone: 'normal' }])
      }

      setCwd(result.cwd)
      performAction(result.action)
    },
    [appendLines, cwd, documents, frierenCompiled, openApps, performAction]
  )

  useEffect(() => {
    if (!frierenBuild) return

    const renderLines = (nextLines: TerminalLine[]) =>
      nextLines.map((line) => ({ ...line, id: nextLineId.current++ }))

    setCommandHistory([])
    setHistoryIndex(-1)
    setInput('')
    setCwd('ROOT')
    setLines(renderLines(initialBuildLines))

    const timers = [
      window.setTimeout(() => {
        setCwd('ABOUT')
        appendLines([
          { text: 'C:\\HITSUJI.PAGE\\ABOUT>bcc32 frieren.cpp', tone: 'normal' },
          { text: 'Borland C++ 5.5 for Win32', tone: 'normal' },
          { text: 'Compiling frieren.cpp:', tone: 'normal' },
        ])
      }, 140),
      window.setTimeout(() => {
        appendLines([
          { text: 'Linking frieren.exe:', tone: 'normal' },
          { text: '0 errors, 0 warnings', tone: 'success' },
          { text: '', tone: 'normal' },
        ])
      }, 380),
      window.setTimeout(() => {
        appendLines([{ text: 'C:\\HITSUJI.PAGE\\ABOUT>frieren.exe', tone: 'normal' }])
      }, 650),
      window.setTimeout(() => finishFrierenBuild(frierenBuild.id), 900),
    ]

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [appendLines, finishFrierenBuild, frierenBuild])

  useEffect(() => {
    if (!isVisible || previousActivation.current === terminal.activation) return
    previousActivation.current = terminal.activation
    if (frierenBuild) return
    if (pointerActivation.current) {
      pointerActivation.current = false
      return
    }
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [frierenBuild, isVisible, terminal.activation])

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight })
  }, [lines])

  useEffect(() => {
    if (terminal.mode === 'closed') resetSession()
  }, [resetSession, terminal.mode])

  if (!isVisible) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    execute(input)
  }

  const statusText = lines.at(-2)?.text || lines.at(-1)?.text || ''

  const minimizeTerminal = () => {
    setAppMode('terminal', 'minimized')
    focusAfterWindowChange('terminal', 'minimized')
  }

  const toggleTerminalMaximize = () => {
    setAppMode('terminal', terminal.mode === 'maximized' ? 'normal' : 'maximized')
  }

  const closeTerminal = () => {
    setAppMode('terminal', 'closed')
    focusAfterWindowChange('terminal', 'closed')
  }

  return (
    <div className="retro98 retro98--contents">
      <section
        ref={windowRef}
        className="desktop-terminal window"
        data-active={isActive ? 'true' : 'false'}
        data-window-positioned={positioned ? 'true' : undefined}
        data-window-sized={sized ? 'true' : undefined}
        data-window-state={terminal.mode}
        role="dialog"
        aria-label="MS-DOS Prompt"
        style={positionStyle}
        onPointerDown={() => {
          if (!isActive) {
            pointerActivation.current = true
            activateApp('terminal')
          }
        }}
        onFocusCapture={() => {
          if (!isActive) activateApp('terminal')
        }}
      >
        <div
          className={['desktop-terminal__titlebar title-bar', isActive ? null : 'inactive']
            .filter(Boolean)
            .join(' ')}
          title={terminal.mode === 'normal' ? 'Drag to move; double-click to maximize' : undefined}
          {...titleBarProps}
          onContextMenu={(event) => {
            if ((event.target as HTMLElement).closest('.desktop-terminal__controls')) return
            event.preventDefault()
            systemMenuRef.current?.open()
          }}
          onDoubleClick={(event) => {
            if ((event.target as HTMLElement).closest('button') || wasDraggedRecently()) return
            toggleTerminalMaximize()
          }}
        >
          <WindowSystemMenu
            ref={systemMenuRef}
            active={isActive}
            appTitle="MS-DOS Prompt"
            icon={<DesktopIcon variant="terminal" size={16} />}
            maximized={terminal.mode === 'maximized'}
            onClose={closeTerminal}
            onMinimize={minimizeTerminal}
            onToggleMaximize={toggleTerminalMaximize}
          />
          <span className="desktop-terminal__title title-bar-text">MS-DOS Prompt</span>

          <span
            className="desktop-terminal__controls title-bar-controls"
            role="group"
            aria-label="Window controls"
          >
            <button
              type="button"
              className="desktop-terminal__control minimize"
              aria-label="Minimize MS-DOS Prompt"
              title="Minimize"
              onClick={minimizeTerminal}
            >
              <WindowControlGlyph variant="minimize" />
            </button>
            <button
              type="button"
              className={`desktop-terminal__control ${
                terminal.mode === 'maximized' ? 'restore' : 'maximize'
              }`}
              aria-label={
                terminal.mode === 'maximized' ? 'Restore MS-DOS Prompt' : 'Maximize MS-DOS Prompt'
              }
              aria-pressed={terminal.mode === 'maximized'}
              title={terminal.mode === 'maximized' ? 'Restore' : 'Maximize'}
              onClick={toggleTerminalMaximize}
            >
              <WindowControlGlyph
                variant={terminal.mode === 'maximized' ? 'restore' : 'maximize'}
              />
            </button>
            <button
              type="button"
              className="desktop-terminal__control close"
              aria-label="Close MS-DOS Prompt"
              title="Close"
              onClick={closeTerminal}
            >
              <WindowControlGlyph variant="close" />
            </button>
          </span>
        </div>

        <div className="desktop-terminal__console" aria-busy={frierenBuild ? 'true' : undefined}>
          <div
            ref={historyRef}
            className="desktop-terminal__history"
            aria-label="Command history"
            aria-live={frierenBuild ? 'polite' : undefined}
          >
            {lines.map((line) => (
              <p key={line.id} className="desktop-terminal__line" data-tone={line.tone}>
                {line.href ? (
                  <button type="button" onClick={() => navigate(line.href!)}>
                    {line.text}
                  </button>
                ) : (
                  line.text || '\u00a0'
                )}
              </p>
            ))}
          </div>

          {!frierenBuild && (
            <form className="desktop-terminal__input-row" onSubmit={handleSubmit}>
              <label htmlFor="desktop-terminal-input" className="desktop-terminal__prompt">
                {promptPath(cwd)}
              </label>
              <input
                ref={inputRef}
                id="desktop-terminal-input"
                className="desktop-terminal__input"
                value={input}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Command"
                onChange={(event) => {
                  setInput(event.target.value)
                  setHistoryIndex(-1)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    if (commandHistory.length === 0) return
                    const nextIndex =
                      historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
                    setHistoryIndex(nextIndex)
                    setInput(commandHistory[nextIndex])
                    return
                  }

                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    if (historyIndex < 0) return
                    const nextIndex = historyIndex + 1
                    if (nextIndex >= commandHistory.length) {
                      setHistoryIndex(-1)
                      setInput('')
                    } else {
                      setHistoryIndex(nextIndex)
                      setInput(commandHistory[nextIndex])
                    }
                    return
                  }

                  if (event.key === 'Tab') {
                    const completion = COMPLETIONS.find((candidate) =>
                      candidate.startsWith(input.toUpperCase())
                    )
                    if (!completion) return
                    event.preventDefault()
                    setInput(completion)
                    return
                  }
                }}
              />
            </form>
          )}
        </div>

        <span className="sr-only" role="status">
          {statusText}
        </span>

        {terminal.mode === 'normal' && (
          <WindowResizeHandles
            accessibleName="Resize MS-DOS Prompt with the pointer or arrow keys"
            handleProps={resizeHandleProps}
          />
        )}
      </section>
    </div>
  )
}
