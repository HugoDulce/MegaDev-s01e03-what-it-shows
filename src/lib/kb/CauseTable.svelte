<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, ticketCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // `filed` names the ticket a cause was split into, once it has one.
  let { ticket, filed = {} }: { ticket: number; filed?: Record<string, { label: string; href: string }> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const owner = $derived(ticketCause(groups, ticket));
  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'cause' : 'causes'}
</p>

<table>
  <thead>
    <tr><th>cause</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th></th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      <tr class:wrong={g.cause !== owner && !filed[g.cause]}>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        {#if filed[g.cause]}
          <td><a href={filed[g.cause].href}>{filed[g.cause].label}</a></td>
        {:else}
          <td>{g.cause === owner ? `#${ticket}` : 'not this ticket — no ticket of its own'}</td>
        {/if}
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.cause)}
  {@const moved = readAs(g, notes.oneDayMove)}
  {#if moved}
    <p class="note">{moved} reports read as a one-day move; filed under <code>{g.cause}</code> by tenant.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .wrong td { background: var(--warn-bg); }
  .wrong td:last-child { color: var(--warn); font-weight: 600; }
</style>
