# AIContext — Reference Documents for AI Agents

This directory contains authoritative reference guides for the Planner, Generator, and Healer agents working on the **MyAccount UI** Playwright test suite.

## Files

| File | Purpose | Who uses it |
|------|---------|------------|
| `PlaywrightFrameworkGuidelines.md` | Complete framework architecture, patterns, POM standards, locator priority, waiting rules | All agents |
| `StandardBusinessRules.md` | MyAccount application flows, PrimeNG component patterns, data-autoid convention | Planner, Generator |
| `StandardTestDataRules.md` | MongoDB schema, credential loading, idempotent insert rules, anti-patterns | Generator, Healer |

## How to Use

Every agent should read these files **before** starting work:

```
1. Planner agent  → PlaywrightFrameworkGuidelines.md + StandardBusinessRules.md
2. Generator agent → ALL three files
3. Healer agent    → PlaywrightFrameworkGuidelines.md + StandardTestDataRules.md
```

The `CLAUDE.md` at project root contains the mandatory workflow rules. These AIContext docs provide the supporting detail.
