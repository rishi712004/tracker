# claude.md

Instructions for AI agents working on this codebase. Read before touching anything.

---

## What this is

A lightweight issue tracker. Three domain objects: Projects, Issues, Comments. The most important rule in the system is the issue status state machine — most of the interesting logic flows from that.

---

## Architecture

Three layers, strict separation:

**Routes** (`app/routes/`) — HTTP only. Parse request, call a service, return JSON. Nothing else.

**Services** (`app/services/`) — business rules. Things like "you can't transition a closed issue" or "the project must exist before you add an issue to it". Raises domain errors, doesn't build HTTP responses.

**Repositories** (`app/repositories/`) — all DB access. Services call these. Nothing outside this layer touches SQLAlchemy directly.

If you're adding something new:
- new DB query → repository
- new rule → service
- new endpoint → route

Don't collapse layers. A route doing `db.session.query(...)` is wrong. A service returning `jsonify(...)` is wrong.

---

## The state machine

`app/transitions.py` is the only place the transition rules live.

```
open        → in_progress, closed
in_progress → resolved, open
resolved    → closed, open
closed      → (nothing — terminal)
```

`validate()` raises `InvalidTransition` if the move isn't allowed. Don't add transitions without thinking about whether they match the intended workflow. `open → resolved` is intentionally not allowed — it skips in_progress.

When writing tests involving status changes, always test both directions: a valid transition and a rejected one.

---

## Validation

Pydantic v2, schemas in `app/schemas/`. Validation happens before any service code runs.

- `name` and `title` must not be blank after stripping whitespace
- `priority` must be one of: `low`, `medium`, `high`, `critical`
- `status` in a transition request must be one of the four valid statuses

If you need to validate a new field, add a validator in the schema. Don't add `if not field` checks in services.

---

## Errors

Two types in `app/errors.py`:

- `NotFound(resource, id)` — record doesn't exist, routes return 404
- `InvalidTransition(current, target)` — bad status move, routes return 422

Don't use `abort()`. Don't return error responses from services. Raise the right error and let the route handle it.

---

## Tests

One file per domain area, plus a dedicated file for the state machine.

Tests must be independent — `conftest.py` cleans the DB between each one. Don't write tests that depend on run order.

Minimum coverage for a new endpoint: happy path, invalid input (422), not found (404).

If you change the transition map, update `test_transitions.py`. Those tests are the contract for the state machine.

---

## Style

- Short variable names are fine (`iss`, `proj`, `c`) — don't over-verbose everything
- No comments explaining what obvious code does
- Keep functions short — if a service function is getting long, it's probably doing too much
- Don't use `**kwargs` to forward unknown fields into models

---

## Off limits

- No auth (out of scope)
- No soft deletes (hard delete only)
- No raw SQL via `db.session.execute()`
- Don't change what `to_dict()` returns without a reason — it's the public API shape

## How AI is used

AI is used for:
- generating boilerplate (routes, schemas, tests)
- suggesting edge cases and test scenarios
- scaffolding new features

AI is NOT trusted blindly:
- all generated code is reviewed manually
- logic-heavy parts (state machine, services) are verified before use
- tests are written or extended to validate behavior after AI changes

AI is treated as a productivity tool, not a source of truth.

## Observability

- Services should raise explicit errors (NotFound, InvalidTransition)
- Routes must return clear error messages
- Avoid silent failures
- If adding complex logic, include logging at the service level

## Change safety

- Changes should be localized to a single layer where possible
- Avoid modifying multiple layers unless necessary
- If modifying transitions, update tests immediately