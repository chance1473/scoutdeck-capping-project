# Getting help with ScoutDeck

## Where to file a request

All requests go through [GitHub Issues](https://github.com/chance1473/scoutdeck-capping-project/issues/new/choose) on this repository:

- **Bug report:** something in ScoutDeck is broken or wrong.
- **Support request:** you need help using or running ScoutDeck, or want a change.

**Security problems are never filed as public issues.** Use [Report a vulnerability](https://github.com/chance1473/scoutdeck-capping-project/security/advisories/new) on the Security tab, which reaches the owner privately.

## Who owns requests

The repository owner, GitHub `chance1473`, owns every issue: triage, labels, assignment and closing. There are no other maintainers.

## Escalation

1. Add a comment explaining the impact (for example, scouting work is blocked or a release is waiting).
2. The owner applies the `urgent` label and assigns the issue to themselves.
3. Security reports are urgent by default and stay in the private advisory until fixed.

## From request to release

1. The issue describes the problem and gets a `bug`, `support` or `security` label.
2. The fix is made on a `version/<release>/feat/<slug>` branch. Its commit or pull request says `Fixes #<issue>`.
3. CI must pass on the branch. The change is merged to `main`.
4. The owner closes the issue with a link to the merged commit and the passing CI run.
