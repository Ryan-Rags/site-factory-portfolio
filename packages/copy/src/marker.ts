


















export const VERIFY_MARKER = '[verify with client]';

/**
 * The marker plus what it is standing in for, e.g.
 * `Certifications — [verify with client]`.
 *
 * Always prefer this to the bare marker. A reader who meets a naked
 * `[verify with client]` mid-paragraph knows something is missing but not
 * what; a reader who meets `Weekend hours — [verify with client]` knows what
 * question to ask the owner, which is the entire point of the mechanism.
 */
export function marked(subject: string): string {
  return `${subject} — ${VERIFY_MARKER}`;
}
