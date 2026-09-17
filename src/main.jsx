import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Does this browser's scrollbar take up width, or float over the content?
 *
 * A classic scrollbar makes an `overflow: scroll` box's client area narrower
 * than its border box; an overlay one leaves them equal. The probe is off
 * screen and removed straight away, and it runs BEFORE render so no frame is
 * ever painted at the wrong width.
 *
 * See `.has-classic-scrollbars` in `index.css` for why the gutter has to be
 * conditional: reserving it unconditionally puts the whole page 7.5px off
 * centre wherever the scrollbar is an overlay one, which is the Windows 11
 * default. This is measured rather than sniffed because it is a per-OS, per-
 * setting, per-device-type property that no user-agent string reports.
 */
const probe = document.createElement('div')
probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll'
document.body.appendChild(probe)
if (probe.offsetWidth - probe.clientWidth > 0) {
  document.documentElement.classList.add('has-classic-scrollbars')
}
probe.remove()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
