import { palette } from './palette'

/** Inlined on the access page so the gate renders when static assets are still locked. */
export function accessCss(): string {
  return `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: ${palette.graphite};
      color: ${palette.ink};
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .access {
      width: min(460px, calc(100% - 32px));
      margin: 0 auto;
      min-height: auto;
      padding: 36px;
      background: ${palette.sheet};
      border-radius: 28px;
      box-shadow: 0 28px 80px rgba(0,0,0,.28);
    }
    body { min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; padding: 24px 0; }
    h1 { font-size: 2rem; font-weight: 650; letter-spacing: -0.05em; margin: 0 0 12px; }
    p { margin: 0 0 16px; line-height: 1.45; color: ${palette.muted}; }
    label { display: block; font-size: 0.875rem; margin-bottom: 8px; }
    input {
      width: 100%;
      min-height: 48px;
      border: 1px solid ${palette.line};
      border-radius: 14px;
      padding: 0 12px;
      font-size: 16px;
      background: #fff;
      color: ${palette.ink};
    }
    button {
      margin-top: 16px;
      min-height: 48px;
      width: 100%;
      border: 0;
      border-radius: 14px;
      background: ${palette.graphite};
      color: ${palette.inverse};
      font-size: 1rem;
    }
    .error { color: #8c2f2f; background: #f8dddd; border-radius: 12px; padding: 10px 12px; }
    :focus-visible { outline: 3px solid #f0c52f; outline-offset: 3px; }
    @media (max-width: 480px) { .access { padding: 28px 20px; border-radius: 22px; } }
  `
}
