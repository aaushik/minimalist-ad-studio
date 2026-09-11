# Raw Codex transcript inventory

Every `.jsonl` file in this directory is an unedited, byte-for-byte copy of a
Codex session file from 11 September 2026. Original filenames are retained.
Together they cover the assignment planning, evidence research, implementation,
reviews and final submission packaging, including failed commands and course
corrections.

[`SHA256SUMS`](SHA256SUMS) records the checksum of each exported file so its
contents can be verified after download.

The larger primary sessions are:

| File start time (UTC) | Contents |
| --- | --- |
| `06-18-42` | Initial assignment planning and scoping |
| `06-29-27` | Main brand, policy, ad-corpus and scoring-rule research |
| `09-33-57` | Main generator, deployment, scorer, UI and submission build session |
| `09-49-11` | Assignment-brief capture session |

The remaining files are supporting research and code-review agent sessions.
They are included rather than curated out so the build record remains complete.

JSONL is machine-readable plain text. Each line is one timestamped session
event. A reviewer can search it directly or format individual lines with a JSON
viewer. The files may include user-provided identifiers already present in the
conversation; no API key value or repository credential is intentionally
included.
