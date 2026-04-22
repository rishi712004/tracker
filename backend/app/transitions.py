from .errors import InvalidTransition

# valid moves — closed is terminal, no way out
VALID_TRANSITIONS: dict = {
    "open":        ["in_progress", "closed"],
    "in_progress": ["resolved", "open"],
    "resolved":    ["closed", "open"],
    "closed":      [],
}


def validate(current: str, next_state: str) -> None:
    allowed = VALID_TRANSITIONS.get(current, [])
    if next_state not in allowed:
        raise InvalidTransition(current, next_state)


def allowed_from(status: str) -> list:
    return VALID_TRANSITIONS.get(status, [])
