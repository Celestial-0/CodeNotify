/**
 * Bun Compatibility Polyfills
 * Fixes node:v8 startupSnapshot.isBuildingSnapshot missing in Bun on Windows
 */

try {
  const v8 = (process as unknown as { getBuiltinModule?: (id: string) => { startupSnapshot?: { isBuildingSnapshot?: () => boolean } } }).getBuiltinModule?.('v8');
  if (v8?.startupSnapshot) {
    v8.startupSnapshot.isBuildingSnapshot = () => false;
  }
} catch {
  // Ignore
}
