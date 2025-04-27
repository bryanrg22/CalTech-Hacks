import pandas as pd
import openai
import json
import ast
import re
import email
from email import policy
from email.parser import BytesParser
from typing import List
from part import Part
from supplier import Supplier
from order import Order
from sales import Sales
from graph import create_graph
import os
from dotenv import load_dotenv
from upload_data import initialize_firebase, upload_specs

from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain, SequentialChain
from langchain.prompts import PromptTemplate
from langchain.tools import Tool
from langchain.agents import tool
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.agents import AgentExecutor
from langchain.memory import ConversationBufferMemory
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage

from datetime import datetime

# Paths to the JSON files
SALES_JSON_PATH = 'data/sales_orders.json'
ORDERS_JSON_PATH = 'data/orders.json'
PARTS_JSON_PATH = 'data/parts.json'
SUPPLY_JSON_PATH = 'data/supply.json'

global full
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

        # SUMMARY TABLE
        self.table = create_graph(self.db)
        
        data_dict = self.table.to_dict()
        
        # Now let's properly format the data
        self.summary_data = []
        for key in data_dict['part_id']:
            summary_entry = {
                'part_id': data_dict['part_id'][key],
                'part_name': data_dict['part_name'][key],
                'quantity': data_dict['quantity'][key],
                'min_stock': data_dict['min_stock'][key],
                'stock_status': data_dict['stock_status'][key],
                'status_category': data_dict['status_category'][key],
                'usage_count': data_dict['usage_count'][key],
                'blocked': data_dict['blocked'][key],
                'comments': data_dict['comments'][key],
            }
            self.summary_data.append(summary_entry)

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

    def _init_orders(self) -> List[Order]:
        orders_ref = self.db.collection('orders')
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

    def _init_sales(self) -> List[Sales]:
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
    
    def create_data_context(self):
        parts_data = [vars(part) for part in self.parts]
        suppliers_data = [vars(supplier) for supplier in self.suppliers]
        orders_data = [vars(order) for order in self.orders]
        sales_data = [vars(sale) for sale in self.sales]
        summary_data = [entry for entry in self.summary_data]
        
        global full 
        full = {
            "parts": parts_data,
            "suppliers": suppliers_data,
            "orders": orders_data, 
            "sales": sales_data,
            "relationships_table": summary_data
        }

        return {
            "parts": parts_data,
            "suppliers": suppliers_data,
            "orders": orders_data, 
            "sales": sales_data,
            "relationships_table": summary_data
        } 

    # === TOOL HELPERS ===
    # @tool
    # def search_parts(self, search_term: str) -> dict:
    #     """Search inventory data from the database the part"""
    #     print(f"search_parts tool used with term: {search_term}")
    #     matching_parts = [vars(p) for p in self.parts if search_term.lower() in p.part_name.lower() or search_term.lower() in p.part_id.lower()]
    #     return {
    #         "tool_name": "InventoryTool",
    #         "response_type": "part_search_results",
    #         "search_term": search_term,
    #         "matching_parts": matching_parts
    #     }

    @tool
    def check_low_stocks(self, stock="") -> dict:
        """Find which parts are low in stock and return them"""
        print("check_low_stocks tool used")
        low_stock_parts = [p for p in self.parts if p.quantity <= p.min_stock]
        return {
            "tool_name": "InventoryTool",
            "response_type": "low_stock_alerts",
            "low_stock_parts": low_stock_parts
        }
        return "Done"

    @tool
    def find_supplier_for_part(part_id: str) -> dict:
        """Find the supplier of a specific part."""
        print(f"find_supplier_for_part tool used with part_id: {part_id}")
        global full
        print(full["suppliers"])
        suppliers_for_part = [vars(s) for s in full["suppliers"] if s["part_id"] == part_id]
        return {
            "tool_name": "InventoryTool",
            "response_type": "supplier_info",
            "part_id": part_id,
            "suppliers": suppliers_for_part
        }

    @tool
    def check_pending_orders() -> dict:
        """Find out which parts are ordered."""
        print("check_pending_orders tool used")
        global full
        pending_orders = [o for o in full["orders"] if o["status"] == "ordered"]
        return {
            "tool_name": "InventoryTool",
            "response_type": "pending_orders",
            "pending_orders": pending_orders
        }
        
    @tool
    def relationship_evaluation( question: str) -> str:
        """Find the relationship between the parts to everything else in the data uses the summary data relationship"""
        print(f"relationship_evaluation tool used with question: {question}")
        global full
        prompt = (
            f"Here is a relationship of parts and specs data:\n{full['relationships_table']}\n\n"
            f"Question: {question}\n"
            f"Answer:"
        )

        load_dotenv()

        _key = os.getenv("OPENAI_API_KEY")
        
        client = openai.OpenAI(api_key=_key)

        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant analyzing data relationships and providing recommendation on what the user should do next."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=700)

            answer = response.choices[0].message.content.strip()
            return answer

        except Exception as e:
            print(f"Error during OpenAI API call: {e}")
            return "Error: Could not evaluate relationships due to API issue."
        
    @tool
    def inventory_alerts(alert="") -> dict:
        """Find the inventory alerts in the data which can be from delays, blocks, and low stock"""
        print("inventory_alerts tool used")
        # global full
        prompt = (
            f"Here is a table of parts and specs in JSON format:\n{full['relationships_table']}\n\n"
            "Please analyze the data and list any parts that should be on alert. Look for issues like:\n"
            "- Low stock levels\n"
            "- Blocked parts\n"
            "- High usage counts\n\n"
            "Return the result in JSON format like {\"part_id\": \"reason\", ...}. "
            "If there are no alerts, return {\"status\": \"No alerts found\"}."
        )
        
        load_dotenv()

        _key = os.getenv("OPENAI_API_KEY")
        
        client = openai.OpenAI(api_key=_key)

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant analyzing inventory data for potential alerts."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=700,
                response_format={"type": "json_object"}
            )

            answer = response.choices[0].message.content.strip()
            print("Raw response:\n", answer)

            try:
                alerts = json.loads(answer)
            except json.JSONDecodeError:
                print("Warning: Failed to parse JSON properly. Returning raw text instead.")
                alerts = {"raw_response": answer}

            return alerts

        except Exception as e:
            print(f"Error during OpenAI API call: {e}")
            return {"error": "Could not retrieve inventory alerts."}

    def chat(self):
        # Initialize LangChain components
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        
        context_data = self.create_data_context()

        # Define system message template
        system_template = ChatPromptTemplate.from_messages([
            ("system", f"""
            You are Hugo, an inventory management assistant for a scooter manufacturing company.
            You have access to the following data:
            - Parts inventory: details about all parts, including quantities, locations, and which models they're used in
            - Suppliers: information about suppliers, prices, lead times, and reliability ratings
            - Orders: purchase orders for parts, including quantities and delivery dates
            - Sales: sales orders for different scooter models
            - Relationships: Tells you how parts relate to other objects
            
            Answer questions about inventory, production capacity, supply chain, and forecasting.
            Be precise, data-driven, and helpful. If you don't know something, say so clearly.
            Do not include the tool names in your response.
            
            Available parts data: {len(context_data['parts'])} parts
            Available suppliers data: {len(context_data['suppliers'])} supplier relationships
            Available orders data: {len(context_data['orders'])} orders
            Available sales data: {len(context_data['sales'])} sales orders
            Relationship between specs and parts: {len(context_data['relationships_table'])} relationships

            Today's date: {datetime.now().strftime('%Y-%m-%d')}
            """),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")                                            
        ])
        
        
        
        # Define all tools
        tools = [
            Tool.from_function(
                func=self.check_low_stocks,
                name="check_low_stocks",
                description="Search for parts by name or ID"
            ),
            Tool.from_function(
                func=self.find_supplier_for_part,
                name="find_supplier_for_part",
                description="Find all suppliers for a specific part ID"
            ),
            Tool.from_function(
                func=self.check_pending_orders,
                name="check_pending_orders",
                description="Check all pending or processing orders"
            ),
            Tool.from_function(
                func=self.relationship_evaluation,
                name="relationship_evaluation",
                description="Analyze relationships between parts and specs"
            ),
            Tool.from_function(
                func=self.inventory_alerts,
                name="inventory_alerts",
                description="Check for inventory alerts including low stock, blocked parts, etc."
            )
        ]
        
        llm_with_tools = llm.bind_tools(tools)
        
        agent = (
            {
                "agent_scratchpad": lambda x: format_to_openai_tool_messages(
                    x["intermediate_steps"]
                ),
                "input": lambda x: x["input"],
                "chat_history": lambda x: x["chat_history"],
            }
            | system_template
            | llm_with_tools
            | OpenAIToolsAgentOutputParser()
        )

        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=memory,
            verbose=True,
            handle_parsing_errors=True
        )

        print("Welcome to Hugo, your inventory management assistant.")
        print("Ask me anything about parts, suppliers, orders, or production capacity.")
        print("Type 'exit' to quit.")

        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit", "bye"]:
                print("Goodbye!")
                break
            
            try:
                result = agent_executor.invoke({"input": user_input})
                print("\nHugo:", result["output"])
            except Exception as e:
                print(f"\nI encountered an error while processing your request: {str(e)}")


if __name__ == "__main__":
    hugo = Hugo()
    hugo.chat()