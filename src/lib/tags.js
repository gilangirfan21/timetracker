// The tag that marks couple time (Phase 5 stats). Matched case-insensitively.
export const COUPLE_TAG = 'with istri'

export const TAG_SUGGESTIONS = [COUPLE_TAG]

export function hasTag(record, tag) {
  return (record.tags ?? []).some((t) => t.toLowerCase() === tag.toLowerCase())
}
