/**
 * A turn DeepSeek Harness could not run because the model's route has no API key: `no API key for provider route
 * "deepseek-official"`, its words when only the person's DeepSeek account is signed in and the model picked (its
 * default) runs on the API. The chat says so in its own words and offers a model of the account instead. Read from
 * the error's words, so a turn kept from before says it too.
 */
import type { LocalAgentSessionInfo } from './desktop-bridge';

type ConfigOptions = NonNullable<LocalAgentSessionInfo['configOptions']>;

const NO_KEY = /\bno API key for provider route "([^"]+)"/i;

/** The route that has no key, or null when the turn failed for something else. */
export function routeWithoutKey(error: string | null | undefined): string | null {
  return NO_KEY.exec(String(error ?? ''))?.[1] ?? null;
}

/**
 * The first model on the person's DeepSeek account (its value is `["deepseek-account", "<model>"]`), named as the
 * menu's button names it (the part before " · DeepSeek Account"); null when the agent offers none, as when no account
 * is signed in.
 */
export function accountModel(options: ConfigOptions | undefined): { configId: string; value: string; name: string } | null {
  const option = options?.find((o) => o.category === 'model');
  for (const choice of option?.options ?? []) {
    if (!choice || !('value' in choice) || typeof choice.value !== 'string') continue;
    let route: unknown;
    try { route = (JSON.parse(choice.value) as unknown[])?.[0]; } catch { continue; }
    if (route === 'deepseek-account') return { configId: option!.id, value: choice.value, name: String(choice.name ?? choice.value).split(' · ')[0] };
  }
  return null;
}
