import json
import networkx as nx
from networkx.readwrite import json_graph
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from collections import defaultdict
from upload_data import initialize_firebase, upload_specs

def create_graph(db):
  
  parts_ref = db.collection("parts").stream()
  specs_ref = db.collection("specs").stream()
  
  data = []
  for doc in parts_ref:
    doc_dict = doc.to_dict()
    doc_dict['part_id'] = doc.id  # Add the document ID into the dictionary
    data.append(doc_dict)
  parts_data = data
  # print(parts_json_data)
  
  data = []
  for doc in specs_ref:
    doc_dict = doc.to_dict()
    doc_dict['spec_name'] = doc.id
    data.append(doc_dict)
  specs_data = data

  # Convert parts data to a dictionary for easy lookup
  parts_dict = {part['part_id']: part for part in parts_data}

  # Create a directed graph
  G = nx.DiGraph()
  spec_nodes = [spec['spec_name'] for spec in specs_data]
  G.add_nodes_from(spec_nodes, node_type='spec')
  part_nodes = [part['part_id'] for part in parts_data]
  G.add_nodes_from(part_nodes, node_type='part')

  for spec in specs_data:
      spec_name = spec['spec_name']
      
      for part_item in spec['bill of materials']:
          part_id = part_item['Part_ID']
          qty_needed = part_item['Qty']
          
          if part_id in parts_dict:
              part_info = parts_dict[part_id]
              current_stock = part_info.get('quantity', 0)
              min_stock = part_info.get('min_stock', 0)
              blocked = part_info.get('blocked', False)
              
              if min_stock > 0:
                  stock_status = (current_stock / min_stock) * 100
              else:
                  stock_status = 100 
              
              G.add_edge(part_id, spec_name, 
                        qty_needed=qty_needed,
                        current_stock=current_stock,
                        min_stock=min_stock,
                        stock_status=stock_status,
                        blocked=blocked)

  # Function to get edge color based on stock status
  def get_edge_color(stock_status, blocked):
      if blocked:
          return 'red'
      elif stock_status < 50:
          return 'orange'
      elif stock_status < 100:
          return 'yellow'
      else:
          return 'green'

  # Function to get edge width based on quantity needed
  def get_edge_width(qty):
      return 0.5 + (qty / 5) 

  # Extract node types for coloring
  node_types = nx.get_node_attributes(G, 'node_type')
  colors = ['skyblue' if node_types[node] == 'spec' else 'lightgreen' for node in G.nodes()]
  pos = nx.spring_layout(G, k=0.5, iterations=50)


  plt.figure(figsize=(14, 10))
  nx.draw_networkx_nodes(G, pos, node_size=590, node_color=colors, alpha=0.75)

  # Draw edges with colors based on stock status and width based on quantity
  for (u, v, data) in G.edges(data=True):
      color = get_edge_color(data.get('stock_status', 100), data.get('blocked', False))
      width = get_edge_width(data.get('qty_needed', 1))
      nx.draw_networkx_edges(G, pos, edgelist=[(u, v)], width=width, 
                            edge_color=color, alpha=0.7, arrows=True, arrowsize=15)

  # Draw labels
  nx.draw_networkx_labels(G, pos, font_size=8)
  
  data_G = json_graph.node_link_data(G)
  
  # with open("basic.json", "w") as f:
  #   json.dump(data_G, f, indent=2)

  # Add legends
  spec_patch = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='skyblue', 
                        markersize=10, label='Spec')
  part_patch = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='lightgreen', 
                        markersize=10, label='Part')
  red_line = plt.Line2D([0], [0], color='red', lw=2, label='Blocked')
  orange_line = plt.Line2D([0], [0], color='orange', lw=2, label='Low Stock (<50%)')
  yellow_line = plt.Line2D([0], [0], color='yellow', lw=2, label='Medium Stock (<100%)')
  green_line = plt.Line2D([0], [0], color='green', lw=2, label='Good Stock')

  plt.legend(handles=[spec_patch, part_patch, red_line, orange_line, yellow_line, green_line], 
            loc='upper left', bbox_to_anchor=(1, 1))

  plt.title('Spec-Part Relationship Graph with Stock Status', fontsize=15)
  plt.tight_layout()
  plt.axis('off')
  plt.savefig('specs_parts_graph.png', dpi=300, bbox_inches='tight')
  # plt.show()

  # Create a data summary table for analysis
  def create_summary_table():
      parts_df = pd.DataFrame(parts_data)
      
      # Calculate stock status percentage
      parts_df['stock_status'] = (parts_df['quantity'] / parts_df['min_stock']) * 100
      
      # Add a status category column
      def get_status_category(row):
          if row['blocked']:
              return 'Blocked'
          elif row['stock_status'] < 50:
              return 'Critical'
          elif row['stock_status'] < 100:
              return 'Low'
          else:
              return 'Good'
      
      parts_df['status_category'] = parts_df.apply(get_status_category, axis=1)
      
      part_usage = defaultdict(int)
      for spec in specs_data:
          for part_item in spec['bill of materials']:
              part_usage[part_item['Part_ID']] += 1
      
      parts_df['usage_count'] = parts_df['part_id'].map(part_usage)
      parts_df_sorted = parts_df.sort_values(['status_category', 'usage_count'], 
                                            ascending=[True, False])
      summary_df = parts_df_sorted[['part_id', 'part_name', 'quantity', 'min_stock', 
                                  'stock_status', 'status_category', 'usage_count', 
                                  'blocked', 'comments']]
      
      return summary_df

  # Generate and print summary table
  summary_table = create_summary_table()
  summary_table.to_csv('parts_summary.csv', index=False)

  def create_critical_parts_graph():
      critical_parts = [part['part_id'] for part in parts_data if part['blocked'] or (part['quantity'] < part['min_stock'])]
      
      if not critical_parts:
          return None
      
      # Create a new graph for critical parts
      H = nx.DiGraph()
      
      # Find which specs use these critical parts
      for spec in specs_data:
          spec_name = spec['spec_name']
          spec_uses_critical = False
          
          for part_item in spec['bill of materials']:
              part_id = part_item['Part_ID']
              if part_id in critical_parts:
                  spec_uses_critical = True
                  qty_needed = part_item['Qty']
                  
                  # Add nodes if they don't exist yet
                  if spec_name not in H:
                      H.add_node(spec_name, node_type='spec')
                  if part_id not in H:
                      H.add_node(part_id, node_type='part')
                  
                  # Get part information
                  part_info = parts_dict[part_id]
                  current_stock = part_info.get('quantity', 0)
                  min_stock = part_info.get('min_stock', 0)
                  blocked = part_info.get('blocked', False)
                  
                  # Calculate stock status
                  if min_stock > 0:
                      stock_status = (current_stock / min_stock) * 100
                  else:
                      stock_status = 100
                  
                  # Add edge with attributes
                  H.add_edge(spec_name, part_id, 
                            qty_needed=qty_needed,
                            current_stock=current_stock,
                            min_stock=min_stock,
                            stock_status=stock_status,
                            blocked=blocked)
      
      if len(H) == 0:  # If no nodes in subgraph
          return None
      
      return H

  # Draw the critical parts graph if there are any critical parts
  critical_graph = create_critical_parts_graph()
  data = json_graph.node_link_data(critical_graph)
  # json_string = json.dumps(data)
  # print(json_string)
  # with open("critical.json", "w") as f:
  #   json.dump(data, f, indent=2)
  
  if critical_graph:
      plt.figure(figsize=(12, 8))
      
      node_types = nx.get_node_attributes(critical_graph, 'node_type')
      colors = ['skyblue' if node_types[node] == 'spec' else 'red' for node in critical_graph.nodes()]
      
      pos = nx.spring_layout(critical_graph, k=0.8, iterations=100, seed=42)
      nx.draw_networkx_nodes(critical_graph, pos, node_size=800, node_color=colors, alpha=0.8)
      for (u, v, data) in critical_graph.edges(data=True):
          color = 'red' if data.get('blocked', False) else 'orange'
          width = get_edge_width(data.get('qty_needed', 1))
          nx.draw_networkx_edges(critical_graph, pos, edgelist=[(u, v)], 
                                width=width, alpha=0.7, edge_color=color, arrows=True)
      
      # Draw labels
      nx.draw_networkx_labels(critical_graph, pos, font_size=10)
      plt.title('Critical Parts and Affected Specs', fontsize=15)
      
      spec_patch = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='skyblue', 
                            markersize=10, label='Spec')
      part_patch = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='red', 
                            markersize=10, label='Critical Part')
      red_line = plt.Line2D([0], [0], color='red', lw=2, label='Blocked')
      orange_line = plt.Line2D([0], [0], color='orange', lw=2, label='Low Stock')
      
      plt.legend(handles=[spec_patch, part_patch, red_line, orange_line], 
                loc='upper left', bbox_to_anchor=(1, 1))
      
      plt.axis('off')
      plt.tight_layout()
      plt.savefig('critical_parts_graph.png', dpi=300, bbox_inches='tight')
      # plt.show()
  else:
      print("No critical parts found for visualization")
      
  return summary_table

if __name__ == "__main__":
  db = initialize_firebase()
  summary_table = create_graph(db)
  # print(summary_table)