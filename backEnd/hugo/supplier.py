class Supplier:
    def __init__(self, supplier_id, part_id, price_per_unit, lead_time_days, min_order_qty, reliability_rating) -> None:
        self.supplier_id = supplier_id
        self.part_id = part_id
        self.price_per_unit = price_per_unit
        self.lead_time_days = lead_time_days
        self.min_order_qty = min_order_qty
        self.reliability_rating = reliability_rating

    def __repr__(self) -> str:
        return (f"Supplier(supplier_id={self.supplier_id}, part_id={self.part_id}, "
                f"price_per_unit={self.price_per_unit}, lead_time_days={self.lead_time_days}, "
                f"min_order_qty={self.min_order_qty}, reliability_rating={self.reliability_rating})")