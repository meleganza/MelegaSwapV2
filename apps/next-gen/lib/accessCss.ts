import { palette } from './palette'

/** Inlined on the access page so the gate renders when static assets are still locked. */
export function accessCss(): string {
  return `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: ${palette.canvas};
      color: ${palette.ink};
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .access {
      width: min(440px, 100%);
      margin: 0 auto;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 32px 16px;
      background: ${palette.sheet};
    }
    h1 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 8px; }
    p { margin: 0 0 16px; line-height: 1.45; color: ${palette.muted}; }
    label { display: block; font-size: 0.875rem; margin-bottom: 8px; }
    input {
      width: 100%;
      min-height: 48px;
      border: 1px solid ${palette.line};
      border-radius: 12px;
      padding: 0 12px;
      font-size: 16px;
      background: ${palette.sheet};
      color: ${palette.ink};
    }
    button {
      margin-top: 16px;
      min-height: 48px;
      width: 100%;
      border: 0;
      border-radius: 12px;
      background: ${palette.graphite};
      color: ${palette.inverse};
      font-size: 1rem;
    }
    .error { color: ${palette.ink}; }
    :focus-visible { outline: 2px solid ${palette.ink}; outline-offset: 2px; }
  `
}
