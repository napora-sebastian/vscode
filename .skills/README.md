# .skills/ Directory
# Phase 6: Skill Extraction & Verification

This directory stores learned skills extracted by the Hermes post-mortem loop.

After every successful agent task, the agent is asked: *"What did we learn?"*
The extracted patterns and logic are saved here as reusable skills for future tasks.

## Structure

```
.skills/
├── README.md           # This file
├── skill-001.json      # Auto-extracted skill from successful task
├── skill-002.json      # ...
└── ...
```

## Skill Format

Each skill is a JSON file with the following structure:

```json
{
  "id": "skill-001",
  "name": "Fix common import errors",
  "description": "When import errors occur in TypeScript, check tsconfig paths...",
  "extracted_from": "task-2024-001",
  "agent": "open-swe",
  "patterns": ["import error", "module not found", "tsconfig"],
  "steps": [
    "Check tsconfig.json paths configuration",
    "Verify node_modules installation",
    "Ensure correct relative import paths"
  ],
  "confidence": 0.92,
  "created_at": "2024-01-15T10:30:00Z",
  "times_used": 5
}
```

## Verification

Skills are verified before being used by running automated tests:
- `pytest` on every agent-generated fix (via Docker container or Modal.com)
- Endpoint testing through the Playground tab
- JSON output validation against the IDE's internal state
