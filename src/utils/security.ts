/**
 * Security & Anti-Inspection Shield
 * Protects portfolio integrity, neutralizes tech footprint, and prevents unauthorized inspection.
 */

export function initSecurityShield() {
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click (Context Menu)
  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    { capture: true }
  );

  // 2. Intercept DevTools & Source Inspection Shortcuts
  document.addEventListener(
    'keydown',
    (e) => {
      // ALLOW the secret Admin shortcut: Ctrl + Alt + D (or Cmd + Alt + D)
      const isAdminShortcut = (e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'd' || e.key === 'D' || e.code === 'KeyD');
      if (isAdminShortcut) {
        return;
      }

      // Block F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect/Console/Select Element)
      // Block Cmd+Option+I, Cmd+Option+J, Cmd+Option+C (Mac equivalents)
      // Block Ctrl+U, Cmd+U (View Source)
      // Block Ctrl+S, Cmd+S (Save Page Source)
      const hasModifier = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (hasModifier) {
        // View Source: Ctrl+U
        if (key === 'u') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        // Save Page: Ctrl+S
        if (key === 's') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        // Inspection combinations with Shift or Alt
        if (e.shiftKey || e.altKey) {
          if (['i', 'j', 'c', 'k'].includes(key)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      }
    },
    { capture: true }
  );

  // 3. Prevent Dragging Images or Assets
  document.addEventListener(
    'dragstart',
    (e) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.tagName === 'A' || target.tagName === 'SVG')) {
        e.preventDefault();
        return false;
      }
    },
    { capture: true }
  );

  // 4. Disable React DevTools Global Hook to prevent component tree inspection
  try {
    const win = window as any;
    if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      win.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => {};
      win.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers = new Map();
    }
  } catch (e) {}

  // 5. Silence and sanitize console calls to prevent leaking any technology information
  try {
    const noop = () => {};
    const methods: (keyof Console)[] = [
      'log',
      'debug',
      'info',
      'warn',
      'error',
      'table',
      'trace',
      'dir',
      'dirxml',
      'group',
      'groupCollapsed',
      'groupEnd',
      'time',
      'timeEnd',
      'timeLog',
      'assert'
    ];

    methods.forEach((method) => {
      try {
        (window.console as any)[method] = noop;
      } catch (err) {}
    });

    // Clear console initially
    try {
      window.console.clear();
    } catch (err) {}
  } catch (e) {}
}
