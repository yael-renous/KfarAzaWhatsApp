import json
import os
from pathlib import Path
from deep_translator import GoogleTranslator

def translate_message_content(text):
    print(f"\nTranslating text: {text[:100]}...")  # Show first 100 chars in case text is long
    
    # Replace censored text first
    text = text.replace("צנזורמערכתי", "CENSORED")
    
    # If the text is only "CENSORED", no need to translate
    if text == "CENSORED":
        print("Text is censored, skipping translation")
        return text
        
    try:
        # Translate the text from Hebrew to English
        print("Attempting translation...")
        translated = GoogleTranslator(source='iw', target='en').translate(text)
        print(f"Translation result: {translated[:100]}...")  # Show first 100 chars
        return translated
    except Exception as e:
        # If translation fails, return original text
        print(f"Translation failed: {str(e)}")
        return text

def process_json_file(input_file, output_file):
    print(f"\nReading JSON file: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Found {len(data['messages'])} messages to process")
    
    # Process each message
    for i, message in enumerate(data['messages'], 1):
        if i % 10 == 0:  # Print progress every 10 messages
            print(f"Processing message {i}/{len(data['messages'])}...")
        if 'messageContent' in message:
            message['messageContent'] = translate_message_content(message['messageContent'])
    
    # Write the translated data
    print(f"\nWriting translated data to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("File write completed")

def main():
    # Directory containing JSON files
    json_dir = Path('Messages/JSON')
    print(f"\nStarting translation process...")
    print(f"Looking for JSON files in: {json_dir}")
    
    # Create output directory if it doesn't exist
    output_dir = json_dir / 'translated'
    output_dir.mkdir(exist_ok=True)
    print(f"Output directory ensured: {output_dir}")
    
    # Process all JSON files
    json_files = list(json_dir.glob('*.json'))
    print(f"Found {len(json_files)} JSON files to process")
    
    # for i, json_file in enumerate(json_files, 1):
    #     if json_file.is_file():
    #         print(f"\n[{i}/{len(json_files)}] Processing {json_file.name}...")
    #         output_file = output_dir / json_file.name
    #         process_json_file(json_file, output_file)
    #         print(f"Completed translation of {json_file.name}")

    json_file = json_dir / 'tweeters.json'
    if json_file.is_file():
        print(f"\nProcessing tweeters.json...")
        output_file = output_dir / 'tweeters.json'
        process_json_file(json_file, output_file)
        print(f"Completed translation of tweeters.json")
    else:
        print("Error: tweeters.json not found in Messages/JSON directory")

if __name__ == "__main__":
    main()
