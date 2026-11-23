const SELECTOR = 'h1, h2, h3, h4, p, li, dd, dt, figcaption, blockquote'

/** Ties a block's last two words together so neither wraps alone. */
function bind(el) {
  const words = el.textContent.trim().split(/\s+/)
  if (words.length < 4) return
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let last = null
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) last = walker.currentNode
  }
  if (!last) return
  const value = last.nodeValue
  const bound = value.replace(/ (\S+\s*)$/, ' $1')
  if (bound !== value) last.nodeValue = bound
}

/** Keeps every page free of orphans, including text that renders later. */
export function watchOrphans() {
  let queued = false
  const run = () => {
    queued = false
    document.querySelectorAll(SELECTOR).forEach(bind)
  }
  const queue = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(run)
  }
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, characterData: true })
  queue()
}
