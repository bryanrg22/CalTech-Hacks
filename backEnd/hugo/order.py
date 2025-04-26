class Order:
    def __init__(self, order_id, part_id, quantity_ordered, order_date,
                expected_delivery_date, supplier_id, status, actual_delivered_at):
        self.order_id = order_id
        self.part_id = part_id
        self.quantity_ordered = quantity_ordered
        self.order_date = order_date
        self.expected_delivery_date = expected_delivery_date
        self.supplier_id = supplier_id
        self.status = status
        self.actual_delivered_at = actual_delivered_at

    def __repr__(self):
        return f"Order({self.order_id}, {self.part_id}, {self.quantity_ordered})"