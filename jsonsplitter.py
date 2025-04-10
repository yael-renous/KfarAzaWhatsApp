import json
import math
import glob

def split_json_file(input_file, max_items_per_file=200):
    # Read the original file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Ensure we're working with the messages list
    messages = data.get('messages', [])
    
    # Calculate number of files needed
    total_items = len(messages)
    num_files = math.ceil(total_items / max_items_per_file)
    
    # Split and save files
    for i in range(num_files):
        start_idx = i * max_items_per_file
        end_idx = min((i + 1) * max_items_per_file, total_items)
        
        chunk = messages[start_idx:end_idx]
        
        output_file = f'Messages/JSON/young_part{i+1}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({"messages": chunk}, f, ensure_ascii=False, indent=2)

def combine_json_files(directory_path='Messages/JSON/', output_file='Messages/JSON/young.json'):
    # Initialize empty list for all messages
    all_messages = []
    
    # Get all part files
    part_files = sorted(glob.glob(f'{directory_path}young_part*.json'))
    
    # Read each file and combine messages
    for file_path in part_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_messages.extend(data['messages'])
    
    # Write combined messages to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"messages": all_messages}, f, ensure_ascii=False, indent=2)

# Usage
# split_json_file('Messages/JSON/young.json', 200)  
combine_json_files()