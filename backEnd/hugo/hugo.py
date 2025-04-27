import pandas as pd
import openai
import json
import ast
import re
import email
from email import policy
from email.parser import BytesParser
from typing import List
from .part     import Part
from .order    import Order
from .sales    import Sales
from .supplier import Supplier
import os
from dotenv import load_dotenv
from .upload_data import initialize_firebase

from langchain.llms.openai import OpenAI
from langchain.chains import LLMChain, SequentialChain
from langchain.prompts import PromptTemplate
from langchain.tools import Tool
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.memory import ConversationBufferMemory
from langchain.output_parsers import PydanticOutputParser

from datetime import datetime

# Paths to the JSON files
SALES_JSON_PATH = 'data/sales_orders.json'
ORDERS_JSON_PATH = 'data/orders.json'
PARTS_JSON_PATH = 'data/parts.json'
SUPPLY_JSON_PATH = 'data/supply.json'

class Hugo:

  def __init__(self) -> None:
    
    load_dotenv()

    # DATABASE
    self.db = initialize_firebase()

    # KEY
    self._key = os.getenv("OPENAI_API_KEY")

    # PARTS CLASS
    self.parts = self._init_parts()

    # SUPPLIER CLASS
    self.suppliers = self._init_suppliers()

    # ORDERS CLASS
    self.orders = self._init_orders()

    # SALES CLASS
    self.sales = self._init_sales()

    # CLIENT
    self.client = openai.OpenAI(api_key=self._key)
  
  # === INIT HELPERS ===
  def _init_parts(self) -> List[Part]:
    parts_ref = self.db.collection('parts') 
    docs = parts_ref.stream()

    parts = []
    for doc in docs:
        data = doc.to_dict()
        part = Part(
            part_id=data.get('part_id'),
            min_stock=data.get('min_stock'),
            reorder_quantity=data.get('reorder_quantity'),
            reorder_interval_days=data.get('reorder_interval_days'),
            part_name=data.get('part_name'),
            part_type=data.get('part_type'),
            used_in_models=data.get('used_in_models', ''),
            weight=0,
            location=data.get('location'),
            quantity=data.get('quantity'),
            blocked=data.get('blocked', False),
            comments=data.get('comments', ""),
            successor_part=data.get('successor_part', None)
        )
        parts.append(part)
    
    return parts

  def _init_suppliers(self) -> List[Supplier]:
    orders_ref = self.db.collection('orders')  # 'orders' collection
    docs = orders_ref.stream()

    orders = []
    for doc in docs:
        data = doc.to_dict()
        order = Order(
            order_id=data.get('order_id'),
            part_id=data.get('part_id'),
            quantity_ordered=data.get('quantity_ordered'),
            order_date=data.get('order_date'),
            expected_delivery_date=data.get('expected_delivery_date'),
            supplier_id=data.get('supplier_id'),
            status=data.get('status'),
            actual_delivered_at=data.get('actual_delivered_at')
        )
        orders.append(order)

    return orders

  def _init_orders(self) -> List[Order]:
    sales_ref = self.db.collection('sales')
    docs = sales_ref.stream()
    
    sales_list = []
    for doc in docs:
        data = doc.to_dict()
        sales = Sales(
            sales_order_id=data.get('sales_order_id'),
            model=data.get('model'),
            version=data.get('version'),
            quantity=data.get('quantity'),
            order_type=data.get('order_type'),
            requested_date=data.get('requested_date'),
            created_at=data.get('created_at'),
            accepted_request_date=data.get('accepted_request_date')
        )
        sales_list.append(sales)
    return sales_list

  def _init_sales(self) -> List[Sales]:
    supply_ref = self.db.collection('supply')
    docs = supply_ref.stream()
    
    suppliers_list = []
    for doc in docs:
        data = doc.to_dict()
        supplier = Supplier(
            supplier_id=data.get('supplier_id'),
            part_id=data.get('part_id'),
            price_per_unit=data.get('price_per_unit'),
            lead_time_days=data.get('lead_time_days'),
            min_order_qty=data.get('min_order_qty'),
            reliability_rating=data.get('reliability_rating')
        )
        suppliers_list.append(supplier)
    return suppliers_list
    
  def create_data_context(self):
        parts_data = [vars(part) for part in self.parts]
        suppliers_data = [vars(supplier) for supplier in self.suppliers]
        orders_data = [vars(order) for order in self.orders]
        sales_data = [vars(sale) for sale in self.sales]
        
        return {
            "parts": parts_data,
            "suppliers": suppliers_data,
            "orders": orders_data, 
            "sales": sales_data
        }

  # === TOOL HELPERS ===
  def get_inventory_data(self):
    return json.dumps(self.create_data_context(), indent=2)
  
  def search_parts(self, other):
    return json.dumps([vars(p) for p in self.parts if other.lower() in p.part_name.lower() or other.lower() in p.part_id.lower()], indent=2)
  
  def check_low_stocks(self):
    return json.dumps([vars(p) for p in self.parts if p.quantity <= p.min_stock], indent=2)
  
  def find_supplier_for_part(self, part_id):
    return json.dumps([vars(s) for s in self.suppliers if s.part_id == part_id], indent=2)
  
  def check_pending_orders(self):
    return json.dumps([vars(o) for o in self.orders if o.status == "ordered" or o.status == "delivered"], indent=2)
  
  def get_sales_by_model(self, model):
    return json.dumps([vars(s) for s in self.sales if model.lower() in s.model.lower()], indent=2)
  
  def create_relationship(self):
    pass
  
  # Parsing Action
  def parse_pdf_to_parts_and_requirements(self,pdf_path):
      # Upload file
      file = self.client.files.create(
          file=open(pdf_path, "rb"),
          purpose="user_data"
      )

      # Send parsing instructions
      response = self.client.responses.create(
          model="gpt-4.1",
          input=[
              {
                  "role": "user",
                  "content": [
                      {"type": "input_file", "file_id": file.id},
                      {
                          "type": "input_text",
                          "text": """Parse the Bill of Materials into a table and Assembly Requirement instructions.
  Make the output in dictionary for the Bill of materials.
  Put the Assembly Requirement in an array of strings for each requirement.

  Make the output like this:
  {
      "Bill_of_Materials": [
          {"Part_ID": "", "Part_Name": "", "Qty": , "Notes": ""},
          ...
      ],
      "Assembly_Requirements": [
          "",
          ...
      ]
  }"""
                      },
                  ],
              }
          ]
      )

      # Clean response text if it's in markdown/json format
      output = response.output_text.strip()
      cleaned_output = re.sub(r"^```json|^```|```$", "", output, flags=re.MULTILINE)

      # Parse JSON
      try:
          parsed_output = json.loads(cleaned_output)
      except json.JSONDecodeError as e:
          raise ValueError("❌ Failed to decode JSON from OpenAI response.") from e

      # Return structured result
      return parsed_output["Bill_of_Materials"], parsed_output["Assembly_Requirements"]

  # Extracting the Email
  def extract_email_body(self, file_path):
    with open(file_path, 'rb') as f:
        msg = BytesParser(policy=policy.default).parse(f)

    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == 'text/plain':
                return part.get_payload(decode=True).decode(errors='ignore')
    else:
        return msg.get_payload(decode=True).decode(errors='ignore')

    return None

  # Analysis Action
  def analyze_email_with_openai(self, email_body):
      response = self.client.responses.create(
          model="gpt-4",
          input=[
              {"role": "system", "content": "You are a helpful assistant that extracts and analyzes email contents."},
              {"role": "user", "content": f"Analyze this email:\n\n{email_body}"}
          ]
      )
      return response.output_text
    
  def chat(self, prompt: str | None = None):
    # Initialize LangChain components
    llm = OpenAI(api_key=self._key, temperature=0.2)
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    
    # Define system message template
    system_template = """
    You are Hugo, an inventory management assistant for a scooter manufacturing company.
    You have access to the following data:
    - Parts inventory: details about all parts, including quantities, locations, and which models they're used in
    - Suppliers: information about suppliers, prices, lead times, and reliability ratings
    - Orders: purchase orders for parts, including quantities and delivery dates
    - Sales: sales orders for different scooter models
    
    Answer questions about inventory, production capacity, supply chain, and forecasting.
    Be precise, data-driven, and helpful. If you don't know something, say so clearly.
    Do not include the tool names in your response.
    
    Available parts data: {parts_count} parts
    Available suppliers data: {suppliers_count} supplier relationships
    Available orders data: {orders_count} orders
    Available sales data: {sales_count} sales orders
    
    Today's date: {current_date}
    """
    tools = [
        # 0-argument helpers wrapped so LangChain can still pass the prompt
        Tool(
            name="get_inventory_data",
            func=lambda _prompt: self.get_inventory_data(),
            description="Get all inventory data including parts, suppliers, orders and sales"
        ),
        Tool(
            name="check_low_stock",
            func=lambda _prompt: self.check_low_stocks(),
            description="Find parts that are currently at or below minimum stock levels"
        ),
        Tool(
            name="check_pending_orders",
            func=lambda _prompt: self.check_pending_orders(),
            description="Check all pending or processing orders"
        ),

        # Helpers that **need** the user’s prompt left as-is
        Tool(
            name="search_parts",
            func=self.search_parts,
            description="Search for parts by name or ID"
        ),
        Tool(
            name="find_suppliers_for_part",
            func=self.find_supplier_for_part,
            description="Find all suppliers for a specific part ID"
        ),
        Tool(
            name="get_sales_by_model",
            func=self.get_sales_by_model,
            description="Get sales orders for a specific scooter model"
        )
    ]
    
    agent = initialize_agent(
        tools,
        llm,
        agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=True,
        memory=memory,
        handle_parsing_errors=True
    )
    
    system_message = system_template.format(
        parts_count=len(self.parts),
        suppliers_count=len(self.suppliers),
        orders_count=len(self.orders),
        sales_count=len(self.sales),
        current_date=datetime.now().strftime("%Y-%m-%d")
    )
    
    # Set the system message
    agent.agent.llm_chain.prompt.messages[0].prompt.template = system_message
    
    print("Welcome to Hugo, your inventory management assistant.")
    print("Ask me anything about parts, suppliers, orders, or production capacity.")
    print("Type 'exit' to quit.")
    
     # === single-shot API mode ==========================================
    if prompt is not None:
        return agent.run(prompt)
    # ===================================================================

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["exit", "quit", "bye"]:
            print("Goodbye!")
            break
        
        try:
            response = agent.run(input=user_input)
            print(f"\nHugo: {response}")
        except Exception as e:
            print(f"\nHugo: I encountered an error while processing your request: {str(e)}")
    
    
if __name__ == "__main__":
  hugo = Hugo()
  hugo.chat()
  