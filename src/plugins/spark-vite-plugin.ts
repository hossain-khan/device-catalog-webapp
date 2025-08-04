import { Plugin } from 'vite';

/**
 * Replacement for @github/spark/spark-vite-plugin
 * This is a minimal plugin that does nothing but provides the interface
 */
export default function sparkPlugin(): Plugin {
  return {
    name: 'spark-replacement',
    // Empty plugin - just provides the interface without breaking the build
  };
}
