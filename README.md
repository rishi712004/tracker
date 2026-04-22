# Trackr

A small issue tracker I built for this assessment. Projects contain issues, issues have a status lifecycle enforced by a state machine, and issues can have comments.

---

## Running it

```bash
# backend
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

FLASK_APP=app:create_app flask db init
FLASK_APP=app:create_app flask db migrate -m "initial"
FLASK_APP=app:create_app flask db upgrade

python3 -m pytest -q              # 29 tests
FLASK_APP=app:create_app flask run --port 5000

# frontend (separate terminal)
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

> On some setups `flask` isn't on PATH even inside the venv. Use `python3 -m flask` instead.

---

## Structure

```
backend/
  app/
    models/       — SQLAlchemy table definitions
    schemas/      — Pydantic request validation
    repositories/ — all DB queries
    services/     — business rules
    routes/       — HTTP layer
    transitions.py — the state machine
    errors.py      — NotFound, InvalidTransition
  tests/
frontend/
  src/
    api/          — axios client
    components/   — StatusBadge, PriorityBadge, Layout
    pages/        — Projects, ProjectDetail, IssueDetail
```

The layering is strict on purpose. Routes don't touch the DB. Services don't build HTTP responses. Repositories don't know about business rules. Adding a feature means touching one layer, maybe two — not rewriting half the app.

---

## The state machine

This is the main domain rule. Issues can only move between statuses in specific ways:

```
open → in_progress → resolved → closed
open → closed                           (skip straight to closed)
in_progress → open                      (unassign / send back)
resolved → open                         (reopen if something's still wrong)
```

Everything else is rejected with a 422. The map lives in `app/transitions.py` and is the single source of truth — routes and services both defer to it.

I kept it as a plain dict + two functions rather than a class because there's no state to hold. It's easier to read and easier to test.

---

## Why these tech choices

**Pydantic for request validation** — I wanted validation errors to happen before any service or DB code runs. Pydantic gives a clear place for that and the error messages are readable.

**SQLite** — zero setup, works fine for a project this size. The only change needed to switch to Postgres is the `SQLALCHEMY_DATABASE_URI` in config.

**No auth** — out of scope for this assessment but it would be the first real thing to add. The service layer is where you'd put ownership checks once users exist.

**Flask-Migrate** — even for a small project, having migration history matters. If I add a column later I don't want to wipe the DB to do it.

---

## Known weaknesses

**No pagination** — listing issues returns everything. Fine now, would need cursor-based pagination if projects got large.

**No optimistic locking** — two people transitioning the same issue at the same time could produce a race condition. A `version` column would fix it.

**Frontend error handling is minimal** — errors show as plain text. A real app would want something more structured.

**SQLite won't handle concurrent writes** — for anything beyond local use, Postgres is necessary.

---

## Extending it

Adding a new transition: update `VALID_TRANSITIONS` in `transitions.py`, update `VALID_STATUSES` in `schemas/issue.py`, add tests.

Adding assignees: new `User` model, `assignee_id` FK on `Issue`, update the schema and `to_dict`. Service layer stays mostly the same.

Adding auth: Flask-Login or JWT, `current_user` passed into service calls so ownership can be checked before mutations.
