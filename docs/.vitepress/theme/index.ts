import { h, nextTick, watch } from "vue"
import type { Theme } from "vitepress"
import DefaultTheme from "vitepress/theme"
import { useData } from "vitepress"
import { createMermaidRenderer } from "vitepress-mermaid-renderer"

// your theme CSS (important for mermaid responsiveness)
import "./index.css"

// catppuccin (optional but you had it)
import "@catppuccin/vitepress/theme/mocha/sapphire.css"

export default {
  extends: DefaultTheme,

  Layout: () => {
    const { isDark } = useData()

    const initMermaid = () => {
      createMermaidRenderer({
        // identical behavior to vitepress-plugin-mermaid
        theme: isDark.value ? "dark" : "default",

        flowchart: {
          useMaxWidth: true,   // important: matches old plugin behavior
          htmlLabels: true
        }
      })
    }

    // initial render
    nextTick(() => initMermaid())

    // re-render when theme changes
    watch(() => isDark.value, () => initMermaid())

    return h(DefaultTheme.Layout)
  }
} satisfies Theme
