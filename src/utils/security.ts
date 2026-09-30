/**
 * Security & Anti-Inspection Shield
 * Protects portfolio integrity, neutralizes tech footprint, and prevents unauthorized inspection.
 */

export function initSecurityShield() {
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click (Context Menu) on both window & document
  const blockContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  window.addEventListener('contextmenu', blockContextMenu, true);
  document.addEventListener('contextmenu', blockContextMenu, true);

  // Block right-click on mousedown/mouseup
  const blockRightMouse = (e: MouseEvent) => {
    if (e.button === 2 || e.which === 3) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };
  window.addEventListener('mousedown', blockRightMouse, true);
  document.addEventListener('mousedown', blockRightMouse, true);

  // 2. Intercept DevTools & Source Inspection Shortcuts
  const blockShortcuts = (e: KeyboardEvent) => {
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

    const hasModifier = e.ctrlKey || e.metaKey;
    const key = (e.key || '').toLowerCase();

    if (hasModifier) {
      // View Source: Ctrl+U
      if (key === 'u' || e.keyCode === 85) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Save Page: Ctrl+S
      if (key === 's' || e.keyCode === 83) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Inspection combinations with Shift or Alt (I, J, C, K)
      if (e.shiftKey || e.altKey) {
        if (['i', 'j', 'c', 'k'].includes(key) || [73, 74, 67, 75].includes(e.keyCode)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }
  };

  window.addEventListener('keydown', blockShortcuts, true);
  document.addEventListener('keydown', blockShortcuts, true);

  // 3. Prevent Dragging Images or Assets
  const preventDrag = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'IMG' || target.tagName === 'A' || target.tagName === 'SVG')) {
      e.preventDefault();
      return false;
    }
  };
  window.addEventListener('dragstart', preventDrag, true);
  document.addEventListener('dragstart', preventDrag, true);

  // 4. Disable React DevTools Global Hook to prevent component tree inspection
  try {
    const win = window as any;
    if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      win.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => {};
      win.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers = new Map();
      win.__REACT_DEVTOOLS_GLOBAL_HOOK__.supportsFiber = true;
    }
  } catch (e) {}

  // 5. Silence and sanitize console calls
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

    try {
      window.console.clear();
    } catch (err) {}
  } catch (e) {}
}
