class NotFound(Exception):
    def __init__(self, resource, id):
        self.resource = resource
        self.id = id
        super().__init__(f"{resource} {id} not found")


class InvalidTransition(Exception):
    def __init__(self, current, target):
        self.current = current
        self.target = target
        super().__init__(f"can't move from '{current}' to '{target}'")
