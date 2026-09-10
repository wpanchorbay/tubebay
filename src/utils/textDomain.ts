/**
 * The plugin text domain for JS-side translatable strings.
 *
 * Free and Pro compile from the same src/ tree — the parity check in
 * tubebaypro/bin/check-src-parity.sh enforces that — so the domain cannot be
 * hard-coded at each call site. This file is the single permitted difference:
 * it reads "tubebay" here and "tubebaypro" in the Pro copy, which keeps every
 * other file byte-identical between the two trees.
 */
export const TEXT_DOMAIN = "tubebay";
