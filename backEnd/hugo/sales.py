class Sales:
    def __init__(self, sales_order_id, model, version, quantity, order_type, requested_date, created_at, accepted_request_date):
        self.sales_order_id = sales_order_id
        self.model = model
        self.version = version
        self.quantity = quantity
        self.order_type = order_type
        self.requested_date = requested_date
        self.created_at = created_at
        self.accepted_request_date = accepted_request_date

    def __repr__(self):
        return f"SalesOrder({self.sales_order_id}, {self.model}, {self.version}, Qty: {self.quantity})"