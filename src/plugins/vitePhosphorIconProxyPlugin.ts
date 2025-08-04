import { Plugin } from 'vite';

/**
 * Replacement for @github/spark/vitePhosphorIconProxyPlugin
 * This plugin handles Phosphor icon imports
 */
export default function createIconImportProxy(): Plugin {
  return {
    name: 'phosphor-icon-proxy',
    // Since the project already uses @phosphor-icons/react directly,
    // this plugin may not be needed, but we'll provide it for compatibility
  };
}
