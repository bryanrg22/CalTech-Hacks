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
import os
from dotenv import load_dotenv


class Hugo:

  def __init__(self, parts: List[Part], suppliers: List[Supplier], orders: List[Order], sales: List[Sales]) -> None:
    
    load_dotenv()

    # KEY
    self._key = os.getenv("opeanAI_key")

    # PARTS CLASS
    self.parts = parts

    # SUPPLIER CLASS
    self.suppliers = suppliers

    # ORDERS CLASS
    self.orders = orders

    # SALES CLASS
    self.sales = sales

    # CLIENT
    self.client = openai.OpenAI(api_key=self._key)
  
  # === INIT HELPERS ===
  def _init_parts(self, parts: List[Part]) -> List[Part]:
      return parts

  def _init_suppliers(self, suppliers: List[Supplier]) -> List[Supplier]:
      return suppliers

  def _init_orders(self, orders: List[Order]) -> List[Order]:
      return orders

  def _init_sales(self, sales: List[Sales]) -> List[Sales]:
      return sales

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

    # Handle multipart and plain text
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