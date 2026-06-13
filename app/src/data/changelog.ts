// Changelog do app — NÃO hardcoded. Lê o CHANGELOG.md que o release-please mantém
// (app/src/CHANGELOG.md, via changelog-path no release-please-config.json) e parseia.
// Assim as versões/datas estão SEMPRE corretas, sem editar isso na mão.
import raw from '../CHANGELOG.md?raw';

export interface ChangelogEntry {
  version: string;
  date: string; // AAAA-MM-DD
  added?: string[];   // ✨ Novidades (Features/Performance)
  fixed?: string[];   // 🛠️ Correções (Bug Fixes/Reverts)
  removed?: string[]; // 🗑️ Removido (release-please não gera; fica vazio)
}

function clean(line: string): string {
  return line
    .replace(/^\s*[*-]\s+/, '')                        // bullet
    .replace(/\s*\(\[[0-9a-f]+\]\([^)]*\)\)\s*$/i, '')  // ([hash](url)) no fim
    .replace(/\*\*[^*]+:\*\*\s*/, '')                   // **escopo:**
    .replace(/[`*]/g, '')
    .trim();
}

function parse(md: string): ChangelogEntry[] {
  const out: ChangelogEntry[] = [];
  let cur: ChangelogEntry | null = null;
  let bucket: 'added' | 'fixed' | null = null;
  for (const ln of md.split('\n')) {
    const v = ln.match(/^##\s+\[?v?([0-9]+\.[0-9]+\.[0-9]+)\]?.*?\((\d{4}-\d{2}-\d{2})\)/);
    if (v) { cur = { version: v[1], date: v[2], added: [], fixed: [] }; out.push(cur); bucket = null; continue; }
    if (!cur) continue;
    const sec = ln.match(/^###\s+(.+)/);
    if (sec) {
      const t = sec[1].toLowerCase();
      if (t.includes('feature') || t.includes('performance')) bucket = 'added';
      else if (t.includes('fix') || t.includes('bug') || t.includes('revert')) bucket = 'fixed';
      else bucket = null; // chores/docs internos → não aparecem pro usuário
      continue;
    }
    if (bucket && /^\s*[*-]\s+/.test(ln)) {
      const txt = clean(ln);
      if (txt) cur[bucket]!.push(txt);
    }
  }
  return out.filter((e) => (e.added!.length + e.fixed!.length) > 0);
}

export const CHANGELOG: ChangelogEntry[] = parse(raw);
