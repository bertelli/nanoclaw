import { CronExpressionParser } from 'cron-parser';
import { initDatabase, createTask } from '../src/db.js';

const TZ = process.env.TZ || 'America/New_York';
const CRON = '0 10 * * 0'; // Sunday 10am

initDatabase();
const nextRun = CronExpressionParser.parse(CRON, { tz: TZ }).next().toISOString();

createTask({
  id: 'wiki-lint-weekly',
  group_folder: 'telegram_main',
  chat_jid: 'tg:7156908895',
  prompt:
    'Run a wiki lint pass per the `wiki` container skill (Karpathy LLM Wiki pattern). Walk /workspace/group/wiki/ and check for: contradictions, stale claims superseded by later sources, orphan pages with no inbound links, recurring names in sources lacking their own entity/concept page, gaps the wiki implies but has not answered, and index drift (pages missing from index.md or index entries for deleted pages). Produce a short report as a Telegram message with counts and top 3-5 actionable items. Offer to fix issues interactively (one at a time — do not auto-fix). Append a `## [<date>] lint | health check` entry to /workspace/group/wiki/log.md.',
  script: null,
  schedule_type: 'cron',
  schedule_value: CRON,
  context_mode: 'group',
  next_run: nextRun,
  status: 'active',
  created_at: new Date().toISOString(),
});

console.log(`Wiki lint task created. Next run: ${nextRun}`);
