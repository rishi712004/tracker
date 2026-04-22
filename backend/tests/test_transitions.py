import pytest
from app.transitions import validate, allowed_from
from app.errors import InvalidTransition


def test_open_to_in_progress():
    validate("open", "in_progress")


def test_open_to_closed():
    validate("open", "closed")


def test_in_progress_to_resolved():
    validate("in_progress", "resolved")


def test_in_progress_back_to_open():
    validate("in_progress", "open")


def test_resolved_to_closed():
    validate("resolved", "closed")


def test_resolved_back_to_open():
    validate("resolved", "open")


def test_closed_is_terminal():
    with pytest.raises(InvalidTransition):
        validate("closed", "open")


def test_cant_skip_from_open_to_resolved():
    with pytest.raises(InvalidTransition):
        validate("open", "resolved")


def test_cant_jump_from_in_progress_to_closed():
    # must go through resolved first
    with pytest.raises(InvalidTransition):
        validate("in_progress", "closed")


def test_unknown_status_raises():
    with pytest.raises(InvalidTransition):
        validate("whatever", "open")


def test_allowed_from_open():
    assert set(allowed_from("open")) == {"in_progress", "closed"}


def test_allowed_from_closed_is_empty():
    assert allowed_from("closed") == []
