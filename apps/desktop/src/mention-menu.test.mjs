import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMentionMenu, matchSlashTrigger, MENTION_MENU_LIMIT } from '../chat/src/components/prompt-editor/mention-menu.ts';

test("a `/` at the start of the message opens the agent's commands; anywhere else it is only a slash", () => {
  assert.deepEqual(matchSlashTrigger('/'), { leadOffset: 0, query: '', replaceableString: '/' });
  assert.deepEqual(matchSlashTrigger('  /comp'), { leadOffset: 2, query: 'comp', replaceableString: '/comp' });
  assert.equal(matchSlashTrigger('/compact now'), null, 'a space ends the command');
  assert.equal(matchSlashTrigger('make it 1/2'), null);
  assert.equal(matchSlashTrigger('assets/'), null);
  assert.equal(matchSlashTrigger('//'), null);
});

test("with no limit every command is a row, the last of 150 too; the `@` menu keeps its limit", () => {
  const command = (name) => ({ id: `command:${name}`, kind: 'file', label: `/${name}`, keywords: [name], select: () => ({ text: `/${name}` }) });
  const commands = [{ id: 'commands', groupLabel: 'Commands', items: [
    ...['plan', 'mcp', 'skills', 'review'].map(command),
    ...Array.from({ length: 146 }, (_, i) => command(`$skill-${String(i).padStart(3, '0')}`)),
  ] }];
  assert.equal(buildMentionMenu(commands, '').length, MENTION_MENU_LIMIT, 'the default, for files');
  const all = buildMentionMenu(commands, '', Infinity);
  assert.equal(all.length, 150);
  assert.equal(all.at(-1).item.label, '/$skill-145');
  assert.deepEqual(buildMentionMenu(commands, 'skill-145', Infinity).map((e) => e.item.label), ['/$skill-145'], 'typing still finds one');
});
