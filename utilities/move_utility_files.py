#!/usr/bin/env python3
"""
Utility script to move diagnostic/analysis files from src/ to utilities/analysis/
This keeps the source directory clean while preserving the utility scripts.
"""

import os
import sys
import shutil

def main():
    # Ensure we're in the right directory
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Change to project root directory
    os.chdir(os.path.join(script_dir, '..'))
    
    # Files to move
    utility_files = [
        'export_raw_data.py',
        'analyze_sections.py',
        'check_lab_sections.py'
    ]
    
    # Ensure the destination directory exists
    os.makedirs('utilities/analysis', exist_ok=True)
    
    # Move each file
    for file_name in utility_files:
        src_path = os.path.join('src', file_name)
        dest_path = os.path.join('utilities/analysis', file_name)
        
        # Check if the source file exists
        if os.path.exists(src_path):
            print(f"Moving {src_path} to {dest_path}")
            
            # Check if destination already exists
            if os.path.exists(dest_path):
                # Compare files
                if os.path.getsize(src_path) == os.path.getsize(dest_path):
                    print(f"  - Skipping as file already exists in destination")
                    continue
                else:
                    # Create a backup of the file in src with a .bak extension
                    backup_path = src_path + '.bak'
                    print(f"  - Creating backup at {backup_path}")
                    shutil.copy2(src_path, backup_path)
            
            # Copy the file to the utilities directory
            shutil.copy2(src_path, dest_path)
            
            # Optional: remove the original file
            # os.remove(src_path)
            
            print(f"  - Done")
        else:
            print(f"Warning: Source file {src_path} not found")
    
    print("\nUtility files have been moved to utilities/analysis/")
    print("Original files were kept in the src directory")
    print("You can delete them manually if you no longer need them there.")

if __name__ == "__main__":
    main() 