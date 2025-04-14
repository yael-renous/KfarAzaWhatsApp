import json
import math
import glob
import os

def split_json_file(input_file, max_items_per_file=200):
    # Check if split files already exist
    basename = os.path.basename(input_file).split('.')[0]
    directory = os.path.dirname(input_file)
    existing_parts = glob.glob(f'{directory}/{basename}_part*.json')
    
    if existing_parts:
        print(f"Split files already exist for {input_file}. Skipping split operation.")
        return
    
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
        
        output_file = f'{directory}/{basename}_part{i+1}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({"messages": chunk}, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully split {input_file} into {num_files} parts.")

def combine_json_files(directory_path='Messages/JSON/', output_file='Messages/JSON/youngPrivate.json'):
    # Initialize empty list for all messages
    all_messages = []
    
    # Get all part files
    basename = os.path.basename(output_file).split('.')[0]
    part_files = sorted(glob.glob(f'{directory_path}{basename}_part*.json'))
    
    # Read each file and combine messages
    for file_path in part_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_messages.extend(data['messages'])
    
    # Write combined messages to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"messages": all_messages}, f, ensure_ascii=False, indent=2)

# Usage
split_json_file('Messages/JSON/youngPrivate.json', 200)  
# combine_json_files()