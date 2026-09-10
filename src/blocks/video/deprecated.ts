/**
 * Deprecated versions of this block's save() output.
 *
 * Intentionally empty on first release — the wiring exists so that the FIRST
 * markup change is a one-file append rather than a refactor under pressure.
 *
 * THE RULE: never edit save.tsx without first pushing the *current* save(),
 * together with the attributes and supports that were in effect alongside it,
 * into this array (newest first). These are static blocks: post content holds
 * frozen HTML, and changing save() without a deprecation invalidates every
 * block already published, showing readers "this block contains unexpected or
 * invalid content".
 *
 * Prefer changing CSS over changing markup. Class names and data-* hooks in
 * saved HTML are inert strings to the validator, so restyling costs nothing;
 * adding or removing an element or attribute costs a deprecation entry.
 *
 * Still empty after 1.3.2, which DID change save(): the play badge stopped
 * emitting an inline <svg> and the thumbnail lost decoding="async" (both were
 * stripped by wp_kses_post() for authors without unfiltered_html, which is the
 * bug that forced the change). No entry is owed because 1.3.0 and 1.3.1 were
 * built but never published — WordPress.org went 1.2.0 -> 1.3.2 — so no post
 * anywhere holds the superseded markup. Any future save() change will not have
 * that excuse.
 */

const deprecated: any[] = [];

export default deprecated;
