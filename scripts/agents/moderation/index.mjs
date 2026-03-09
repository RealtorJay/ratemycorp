import { supabase } from '../lib/supabase.mjs'
import { createRun, completeRun } from '../lib/logger.mjs'
import { CONFIG } from '../config.mjs'
import { scoreContent } from './scorer.mjs'

const BATCH_SIZE = 10

/**
 * Moderation Agent — scores pending forum posts and comments with AI,
 * auto-approves or auto-rejects based on configurable thresholds.
 */
export async function runModerationAgent() {
  const runId = await createRun('moderation')
  const stats = { processed: 0, updated: 0, failed: 0, errors: [] }
  const thresholds = CONFIG.moderation || { autoApproveMax: 30, autoRejectMin: 80 }

  try {
    // ── Fetch pending forum posts ──────────────────────────────────────────
    const { data: posts, error: postsErr } = await supabase
      .from('forum_posts')
      .select('id, title, body, company_id, companies(name)')
      .eq('status', 'pending')
      .is('moderated_at', null)
      .limit(50)

    if (postsErr) throw new Error(`Failed to fetch posts: ${postsErr.message}`)

    // ── Fetch pending forum comments ───────────────────────────────────────
    const { data: comments, error: commentsErr } = await supabase
      .from('forum_comments')
      .select('id, body, post_id, forum_posts(company_id, companies(name))')
      .eq('status', 'pending')
      .is('moderated_at', null)
      .limit(50)

    if (commentsErr) throw new Error(`Failed to fetch comments: ${commentsErr.message}`)

    console.log(`[moderation] Found ${posts.length} posts, ${comments.length} comments to moderate`)

    // ── Process posts in batches ───────────────────────────────────────────
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE)
      const items = batch.map(p => ({
        id: p.id,
        title: p.title,
        body: p.body,
        company_name: p.companies?.name || 'Unknown',
      }))

      try {
        const scores = await scoreContent(items)
        for (let j = 0; j < batch.length; j++) {
          stats.processed++
          await applyModeration('forum_posts', batch[j].id, scores[j], thresholds, stats)
        }
      } catch (err) {
        stats.failed += batch.length
        stats.errors.push({ entity: `post_batch_${i}`, error: err.message, timestamp: new Date().toISOString() })
        console.error(`[moderation] Post batch error:`, err.message)
      }
    }

    // ── Process comments in batches ────────────────────────────────────────
    for (let i = 0; i < comments.length; i += BATCH_SIZE) {
      const batch = comments.slice(i, i + BATCH_SIZE)
      const items = batch.map(c => ({
        id: c.id,
        body: c.body,
        company_name: c.forum_posts?.companies?.name || 'Unknown',
      }))

      try {
        const scores = await scoreContent(items)
        for (let j = 0; j < batch.length; j++) {
          stats.processed++
          await applyModeration('forum_comments', batch[j].id, scores[j], thresholds, stats)
        }
      } catch (err) {
        stats.failed += batch.length
        stats.errors.push({ entity: `comment_batch_${i}`, error: err.message, timestamp: new Date().toISOString() })
        console.error(`[moderation] Comment batch error:`, err.message)
      }
    }

    await completeRun(runId, stats.failed > 0 ? 'partial' : 'completed', stats)
  } catch (err) {
    stats.errors.push({ entity: 'agent', error: err.message, timestamp: new Date().toISOString() })
    await completeRun(runId, 'failed', stats)
    throw err
  }

  return stats
}

/**
 * Apply moderation decision to a single item.
 */
async function applyModeration(table, id, scores, thresholds, stats) {
  const maxScore = Math.max(scores.spam, scores.off_topic, scores.harassment, scores.misinformation)
  const allLow = maxScore < thresholds.autoApproveMax

  let newStatus, moderatedBy
  if (allLow) {
    newStatus = 'approved'
    moderatedBy = 'ai_auto'
  } else if (maxScore >= thresholds.autoRejectMin) {
    newStatus = 'rejected'
    moderatedBy = 'ai_auto'
  } else {
    // Leave as pending, flag for manual review
    newStatus = 'pending'
    moderatedBy = 'ai_flagged'
  }

  const update = {
    moderation_scores: scores,
    moderated_at: new Date().toISOString(),
    moderated_by: moderatedBy,
  }
  if (newStatus !== 'pending') {
    update.status = newStatus
  }

  const { error } = await supabase
    .from(table)
    .update(update)
    .eq('id', id)

  if (error) {
    stats.failed++
    stats.errors.push({ entity: `${table}:${id}`, error: error.message, timestamp: new Date().toISOString() })
    console.error(`[moderation] Failed to update ${table}:${id}:`, error.message)
  } else {
    if (newStatus !== 'pending') stats.updated++
    console.log(`[moderation] ${table}:${id} → ${newStatus} (max_score: ${maxScore}, by: ${moderatedBy})`)
  }
}
