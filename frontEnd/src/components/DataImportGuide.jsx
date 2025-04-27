import { FileText, AlertCircle } from "lucide-react"

export default function DataImportGuide() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Data Import Guide</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-emerald-500 mb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            parts.json
          </h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <pre className="text-xs text-gray-300 overflow-auto">
              {`{
  "P340": {
    "blocked": false,
    "comments": "",
    "location": "WH1",
    "min_stock": 50,
    "part_name": "S1 V1 500W Brushless Motor",
    "part_type": "assembly",
    "quantity": 158,
    "reorder_interval_days": 18,
    "reorder_quantity": 79,
    "stock_level": 0,
    "successor_part": "P341",
    "used_in_models": ["S1_V1"],
    "weight": 2.10
  },
  ...
}`}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-blue-500 mb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            orders.json
          </h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <pre className="text-xs text-gray-300 overflow-auto">
              {`{
  "05900": {
    "order_date": "2025-03-05",
    "expected_delivery_date": "2025-03-18",
    "actual_delivered_at": "2025-03-19",
    "part_id": "P340",
    "quantity_ordered": 120,
    "status": "delivered",
    "supplier_id": "SupA"
  },
  ...
}`}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-purple-500 mb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            sales.json
          </h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <pre className="text-xs text-gray-300 overflow-auto">
              {`{
  "S0700": {
    "created_at": "2025-01-03",
    "requested_date": "2025-02-01",
    "accepted_request_date": "2025-02-03",
    "model": "S1",
    "order_type": "webshop",
    "quantity": 12,
    "version": "V1"
  },
  ...
}`}
            </pre>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-300 mb-1">Data Processing Logic</h4>
              <p className="text-xs text-blue-200/80">When you upload these files, the system will:</p>
              <ol className="text-xs text-blue-200/80 list-decimal pl-5 mt-2 space-y-1">
                <li>
                  Upload parts data to <code className="bg-blue-800/30 px-1 rounded">parts/{"{part_id}"}</code>
                </li>
                <li>
                  Upload orders data to <code className="bg-blue-800/30 px-1 rounded">orders/{"{order_id}"}</code>
                </li>
                <li>
                  Upload sales data to <code className="bg-blue-800/30 px-1 rounded">sales/{"{sale_id}"}</code>
                </li>
                <li>For each order, find the corresponding part and its used_in_models</li>
                <li>
                  Update <code className="bg-blue-800/30 px-1 rounded">specs/{"{model}"}/quantity</code> for each model
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
