import assert from 'node:assert/strict';
import { test } from 'node:test';
import { accountModel, routeWithoutKey } from '../chat/src/lib/route-without-key.ts';

test("DeepSeek Harness's words for a model whose route has no API key are told apart from other failures", () => {
  assert.equal(routeWithoutKey('turn failed: llm-deepseek: no API key for provider route "deepseek-official"; store DEEPSEEK_API_KEY through the credentials service (the web Models page writes it), or export DEEPSEEK_API_KEY in the launching environment'), 'deepseek-official');
  for (const error of [
    'Invalid API key',
    'Not logged in · Please run /login',
    'The agent did not accept the selected model.',
    '',
    null,
  ]) assert.equal(routeWithoutKey(error), null, String(error));
});

test("the model offered in its place is the first of the person's DeepSeek account, named as the menu's button names it", () => {
  const options = [
    { id: 'model', name: 'Model', category: 'model', currentValue: '["deepseek-official","deepseek-v4-flash"]', options: [
      { value: '["deepseek-official","deepseek-v4-flash"]', name: 'deepseek-v4-flash · DeepSeek' },
      { value: '["deepseek-account","deepseek-flash"]', name: 'DeepSeek-V4.1-Flash · DeepSeek Account' },
      { value: '["deepseek-account","deepseek-v4-pro"]', name: 'DeepSeek-V4-Pro · DeepSeek Account' },
    ] },
    { id: 'reasoning_effort', name: 'Reasoning effort', category: 'thought_level', currentValue: 'high', options: [{ value: 'high', name: 'High' }] },
  ];
  assert.deepEqual(accountModel(options), { configId: 'model', value: '["deepseek-account","deepseek-flash"]', name: 'DeepSeek-V4.1-Flash' });
});

test('no account model is offered when the agent lists none, its options are not known yet, or a value is not a route', () => {
  assert.equal(accountModel([{ id: 'model', name: 'Model', category: 'model', options: [{ value: '["deepseek-official","deepseek-v4-flash"]', name: 'deepseek-v4-flash · DeepSeek' }] }]), null);
  assert.equal(accountModel([{ id: 'model', name: 'Model', category: 'model', options: [{ value: 'gpt-5', name: 'GPT-5' }, { value: 42, name: 'odd' }] }]), null);
  assert.equal(accountModel(undefined), null);
  assert.equal(accountModel([]), null);
});
