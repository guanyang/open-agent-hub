#!/usr/bin/env python3
"""
Update skills_index.json by scanning the skills/ directory.
This script extracts descriptions from SKILL.md files and generates the index.
"""
import json
import os
import re

def extract_description(skill_path):
    skill_md_path = os.path.join(skill_path, "SKILL.md")
    if not os.path.exists(skill_md_path):
        return ""
    
    try:
        with open(skill_md_path, "r", encoding="utf-8") as f:
            content = f.read(1000) # Read first 1000 chars
            
            # Try to find description in YAML frontmatter
            match = re.search(r'^description:\s*(.+)$', content, re.MULTILINE)
            if match:
                desc = match.group(1).strip()
                # Remove quotes if present
                if (desc.startswith('"') and desc.endswith('"')) or (desc.startswith("'") and desc.endswith("'")):
                    desc = desc[1:-1].strip()
                return desc
    except Exception as e:
        print(f"Error reading {skill_md_path}: {e}")
        
    return ""

def update_index():
    skills_dir = "skills"
    index_path = "skills_index.json"
    
    if not os.path.exists(skills_dir):
        print(f"Error: {skills_dir} directory not found.")
        return
        
    skills = []
    
    for item in os.listdir(skills_dir):
        item_path = os.path.join(skills_dir, item)
        if os.path.isdir(item_path):
            # Skip hidden directories
            if item.startswith('.'):
                continue
                
            skill_md = os.path.join(item_path, "SKILL.md")
            if os.path.exists(skill_md):
                desc = extract_description(item_path)
                
                # You can optionally skip deprecated skills here if desired
                # if desc.startswith("[Deprecated:"):
                #     continue
                
                skills.append({
                    "id": item,
                    "path": f"skills/{item}",
                    "name": item,
                    "description": desc
                })
                
    # Sort by id for consistency
    skills.sort(key=lambda x: x["id"])
    
    try:
        with open(index_path, "w", encoding="utf-8") as f:
            json.dump(skills, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"Successfully updated {index_path} with {len(skills)} skills.")
    except Exception as e:
        print(f"Error writing to {index_path}: {e}")

if __name__ == "__main__":
    # Change working directory to project root if run from elsewhere
    # Assuming script is in scripts/ directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    os.chdir(project_root)
    
    update_index()
