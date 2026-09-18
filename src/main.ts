/**
 * Entry point.
 *
 * `index.html` loads this file; it only wires the stylesheet and the UI module,
 * so the engine/storage layers stay importable from tests without touching the DOM.
 */
import './styles.css';
import './ui/main.ts';
