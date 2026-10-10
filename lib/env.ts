// Read a setting from the environment, ignoring stray spaces, quotes and line
// breaks that can sneak in when values are pasted into Vercel (for example
// from PowerShell, which adds an invisible line break).
export const env = (name: string): string =>
  (process.env[name] ?? '').replace(/^[\s"']+|[\s"']+$/g, '');

/** True only when the setting is "true" (any capitalisation). */
export const envOn = (name: string): boolean => env(name).toLowerCase() === 'true';

/** True only when the setting is "false" (any capitalisation). */
export const envOff = (name: string): boolean => env(name).toLowerCase() === 'false';
