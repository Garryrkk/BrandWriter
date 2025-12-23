class LeadProvider:
    def fetch(self, filters: dict, limit: int):
        raise NotImplementedError("Provider must implement fetch()")
