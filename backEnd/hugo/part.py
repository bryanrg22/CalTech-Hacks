class Part:
    def __init__(self, part_id, min_stock, reorder_quantity, reorder_interval_days,
                part_name, part_type, used_in_models, weight, location, quantity, blocked=False, comments="", successor_part=None
                ):
        self.part_id = part_id
        self.min_stock = min_stock
        self.reorder_quantity = reorder_quantity
        self.reorder_interval_days = reorder_interval_days
        self.part_name = part_name
        self.part_type = part_type
        self.used_in_models = used_in_models.split(';') if isinstance(used_in_models, str) else []
        self.weight = float(weight)
        self.location = location
        self.quantity = quantity
        self.blocked = blocked
        self.comments = comments
        self.successor_part = successor_part
        self.stock_level = 0

    def needs_reorder(self):
        """Check if stock level is below minimum stock level."""
        return self.stock_level < self.min_stock and not self.blocked

    def block_part(self, reason=""):
        """Block the part and optionally update comments."""
        self.blocked = True
        if reason:
            self.comments = reason

    def unblock_part(self):
        """Unblock the part."""
        self.blocked = False

    def update_stock(self, amount):
        """Increase or decrease the stock by a certain amount."""
        self.stock_level += amount

    def __str__(self):
        return f"Part({self.part_id}, {self.part_name}, Stock: {self.stock_level}, Blocked: {self.blocked})"

    def info(self):
        """Get detailed info about the part."""
        return {
            "ID": self.part_id,
            "Name": self.part_name,
            "Type": self.part_type,
            "Used In Models": self.used_in_models,
            "Weight (kg)": self.weight,
            "Location": self.location,
            "Quantity": self.quantity,
            "Blocked": self.blocked,
            "Comments": self.comments,
            "Successor Part": self.successor_part,
            "Min Stock": self.min_stock,
            "Reorder Quantity": self.reorder_quantity,
            "Reorder Interval (Days)": self.reorder_interval_days,
            "Current Stock": self.stock_level
        }