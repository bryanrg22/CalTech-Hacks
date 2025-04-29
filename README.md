# Swerve - 1st Place @ HackTech 2025

1st Place in Dryft AI Challenge @ HackTech (Caltech's hackathon) 

Swerve - Voltway Procurement Management System - Agentic AI co-pilot that enhances industrial procurement operations.

A comprehensive inventory management system for Voltway electric scooters. This application helps manage parts inventory, track orders, analyze sales data, and monitor supplier reliability.

## Tech Stack

### Frontend

- **React.js** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **MapLibre GL** - Interactive maps

### Backend

- **Python** - Backend language
- **Flask** - Web framework
- **Firebase Admin SDK** - Database interaction

### Database

- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage

### AI Integration

- **Hugo AI** - Custom AI assistant for procurement insights
- **Slack Integration** - Automated notifications

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Python (v3.8+)
- Firebase account

### Frontend Setup

1. Clone the repository

    ```sh
    git clone https://github.com/your-username/voltway-procurement.git
    cd voltway-procurement
    ```

2. Install dependencies

    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory with your Firebase configuration

    ```dotenv
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

### Backend Setup

1. Navigate to the backend directory

    ```sh
    cd backend
    ```

2. Create a virtual environment

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. Install dependencies

    ```sh
    pip install -r requirements.txt
    ```

4. Create a `firebase-credentials.json` file with your Firebase service account credentials

## Running the Application

### Frontend

```sh
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Backend

```sh
python app.py
```

The backend API will be available at [http://localhost:5000](http://localhost:5000).

## Firebase Database Schema

```plaintext
firestore/
├── orders/{order_id}                # e.g. orders/O5001
│   ├── {order_id}
│   │   ├── order_date: string
│   │   ├── expected_delivery_date: string
│   │   ├── actual_delivered_at: string
│   │   ├── part_id: string             # FK → parts/{part_id}
│   │   ├── supplier_id: string         # FK → supply/{supply_id}
│   │   ├── quantity_ordered: number
│   │   └── status: string              # "pending" | "ordered" | "delivered"
│
├── parts/{part_id}                  # e.g. parts/P301
│   ├── {part_id}
│   │   ├── part_name: string
│   │   ├── part_type: string           # "assembly" | "component"
│   │   ├── location: string
│   │   ├── stock_level: number
│   │   ├── min_stock: number
│   │   ├── blocked: boolean
│   │   ├── comments: string
│   │   ├── weight: number | null
│   │   ├── successor_part: string | null
│   │   ├── used_in_models: string[]    # e.g. ["S1_V1","S2_V1"]
│   │   ├── reorder_interval_days: number
│   │   ├── reorder_quantity: number
│   │   ├── bill_of_materials: array    # list of maps
│   │   │   ├── [0]
│   │   │   │   ├── Part_ID: string
│   │   │   │   ├── Part_Name: string
│   │   │   │   ├── Qty: number
│   │   │   │   └── Notes: string
│   │   │   ├── [1] { … }
│   │   │   └── …
│   │   └── requirements: string[]      # e.g. ["Torque motor mounting …", "Run battery BMS …"]
│
├── sales/{sale_id}                  # e.g. sales/S6000
│   ├── {sale_id}
│   │   ├── created_at: string
│   │   ├── accepted_request_date: string
│   │   ├── requested_date: string
│   │   ├── model: string
│   │   ├── version: string
│   │   ├── order_type: string          # "webshop" | "retail"
│   │   └── quantity: number
│
└── supply/{supply_id}               # e.g. supply/SupA_P301
    ├── {supply_id}
    │   ├── price_per_unit: number
    │   ├── lead_time_days: number
    │   ├── min_order_qty: number
    │   └── reliability_rating: number
```

## Features

### Dashboard

- Overview of key metrics
- Low stock alerts
- Inventory status visualization
- Sales charts
- Supplier reliability analysis
- Recent orders table

### Products

- View scooter models and their components
- Track parts inventory for each model
- Monitor stock levels and restock urgency

### Parts Management

- Track individual parts inventory
- View part details and specifications
- Monitor stock levels

### Orders

- Track purchase orders
- Monitor delivery status
- View order history

### Supply Chain Map

- Interactive global map
- Visualize suppliers and warehouses
- Track shipment routes

### Hugo AI Assistant

- AI-powered procurement assistant
- Get insights on inventory status
- Analyze supply chain data
- Optimize procurement processes

### Data Import

- Import parts, orders, and sales data
- Automatic database updates
- AI-powered analysis after import

### Notifications

- AI-generated parts status updates
- Low stock alerts
- Integration with Slack for team notifications

## Project Structure

```plaintext
voltway-procurement/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API and service functions
│   ├── hooks/            # Custom React hooks
│   ├── firebase.js       # Firebase configuration
│   └── App.jsx           # Main application component
├── backend/
│   ├── app.py            # Flask application
│   ├── routes/           # API routes
│   └── services/         # Backend services
└── public/               # Static assets
```

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m 'Add some amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request  

## License

This project is licensed under the MIT License - see the LICENSE file for details.
