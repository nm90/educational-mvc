#!/usr/bin/env python3
"""
Copy Feature Extractor

Extracts feature details and agent prompt from docs/IMPLEMENTATION_PLAN.md
for easy copy-paste to agents.

Usage:
    python copy_feature.py 0.1          # Extract Feature 0.1
    python copy_feature.py 1.5          # Extract Feature 1.5
    python copy_feature.py 2.1 --save   # Save to file
    python copy_feature.py --list       # List all available features
"""

import re
import sys
import os
from pathlib import Path


def get_plan_file():
    """Get the path to IMPLEMENTATION_PLAN.md"""
    script_dir = Path(__file__).parent
    plan_file = script_dir.parent / "docs" / "IMPLEMENTATION_PLAN.md"

    if not plan_file.exists():
        print(f"Error: IMPLEMENTATION_PLAN.md not found at {plan_file}")
        sys.exit(1)

    return plan_file


def read_plan():
    """Read the entire plan file"""
    plan_file = get_plan_file()
    with open(plan_file, 'r') as f:
        return f.read()


def extract_general_principles():
    """Extract Agent Guidelines & Best Practices section"""
    plan = read_plan()

    # Find the section between "## Agent Guidelines & Best Practices" and the next section
    pattern = r"## Agent Guidelines & Best Practices\n\n(.*?)\n---\n"
    match = re.search(pattern, plan, re.DOTALL)

    if match:
        return match.group(1)
    return None


def extract_project_structure():
    """Extract Project Structure section"""
    plan = read_plan()

    # Find the section between "## Project Structure" and the next major section
    pattern = r"## Project Structure\n\n(.*?)\n---"
    match = re.search(pattern, plan, re.DOTALL)

    if match:
        return match.group(1)
    return None


def extract_feature(feature_id):
    """
    Extract feature section and agent prompt by feature ID.

    Returns: {
        'id': '0.1',
        'title': 'Initialize Project Structure',
        'time': '30min',
        'files': ['...'],
        'description': '...',
        'agent_prompt': '...',
        'general_principles': '...',
        'project_structure': '...'
    }
    """
    plan = read_plan()

    # Escape dots in regex
    escaped_id = feature_id.replace('.', r'\.')

    # Pattern to match feature header
    feature_pattern = rf"#### Feature {escaped_id}: (.*?)\n"
    match = re.search(feature_pattern, plan)

    if not match:
        return None

    feature_title = match.group(1)
    start_pos = match.start()

    # Find the end of this feature (next feature or next phase)
    next_feature_pattern = r"#### Feature \d+\.\d+:|### Phase \d+:|## Summary"
    next_match = re.search(next_feature_pattern, plan[start_pos + 10:])

    if next_match:
        end_pos = start_pos + 10 + next_match.start()
    else:
        end_pos = len(plan)

    feature_section = plan[start_pos:end_pos]

    # Extract Time
    time_match = re.search(r"\*\*Time\*\*: (.*?)\n", feature_section)
    time = time_match.group(1) if time_match else "Unknown"

    # Extract Files to create/modify
    files_section = re.search(r"\*\*Files to (?:create|modify)\*\*:\n((?:- `.*?\n)+)", feature_section)
    files = []
    if files_section:
        files_text = files_section.group(1)
        files = [f.strip('- `').strip('`').strip() for f in files_text.split('\n') if f.strip()]

    # Extract Agent Prompt
    prompt_match = re.search(r"\*\*Agent Prompt\*\*:\n```\n(.*?)\n```", feature_section, re.DOTALL)
    agent_prompt = prompt_match.group(1) if prompt_match else None

    # Extract description (everything between header and Files)
    desc_match = re.search(rf"#### Feature {escaped_id}: .*?\n(.*?)\n\*\*Time\*\*:", feature_section, re.DOTALL)
    description = desc_match.group(1).strip() if desc_match else ""

    return {
        'id': feature_id,
        'title': feature_title,
        'time': time,
        'files': files,
        'description': description,
        'agent_prompt': agent_prompt,
        'general_principles': extract_general_principles(),
        'project_structure': extract_project_structure()
    }


def list_features():
    """List all available features"""
    plan = read_plan()

    # Find all features
    pattern = r"#### Feature ([\d\.]+): (.*?)\n\*\*Time\*\*: (.*?)\n"
    matches = re.findall(pattern, plan)

    if not matches:
        print("No features found in IMPLEMENTATION_PLAN.md")
        return

    print("\n" + "=" * 80)
    print("AVAILABLE FEATURES")
    print("=" * 80 + "\n")

    current_phase = None

    for feature_id, title, time in matches:
        # Extract phase from feature ID (e.g., "0" from "0.1")
        phase = feature_id.split('.')[0]

        if phase != current_phase:
            current_phase = phase
            if current_phase == "0":
                print("PHASE 0: Project Scaffolding")
            elif current_phase == "1":
                print("\nPHASE 1: Core Python MVC + SQLite")
            elif current_phase == "2":
                print("\nPHASE 2: Method Logging & Developer Panel")
            elif current_phase == "3":
                print("\nPHASE 3: Lesson Engine")
            elif current_phase == "4":
                print("\nPHASE 4: Mode Toggle & Polish")
            elif current_phase == "5":
                print("\nPHASE 5: Deployment & Documentation")
            print("-" * 80)

        print(f"  {feature_id:>4}  {title:<50}  ({time})")

    print("\n" + "=" * 80)
    print(f"Total: {len(matches)} features")
    print("=" * 80 + "\n")
    print("Usage: python copy_feature.py <feature_id>")
    print("Example: python copy_feature.py 1.5\n")


def format_output(feature):
    """Format feature for display and copying"""
    output = []

    # Include General Principles and Project Structure at the top
    output.append("\n" + "=" * 80)
    output.append("AGENT GUIDELINES & PROJECT CONTEXT")
    output.append("=" * 80)
    output.append("Read these sections carefully - they apply to all features.\n")

    if feature['general_principles']:
        output.append("## GENERAL PRINCIPLES\n")
        output.append(feature['general_principles'])
        output.append("\n")

    if feature['project_structure']:
        output.append("## PROJECT STRUCTURE\n")
        output.append(feature['project_structure'])
        output.append("\n")

    # Now the specific feature
    output.append("=" * 80)
    output.append(f"FEATURE {feature['id']}: {feature['title']}")
    output.append("=" * 80 + "\n")

    if feature['description']:
        output.append("DESCRIPTION:")
        output.append(feature['description'] + "\n")

    output.append(f"TIME: {feature['time']}")

    if feature['files']:
        output.append("\nFILES TO CREATE/MODIFY:")
        for f in feature['files']:
            output.append(f"  - {f}")

    output.append("\n" + "-" * 80)
    output.append("AGENT PROMPT (Copy from here):")
    output.append("-" * 80 + "\n")

    if feature['agent_prompt']:
        output.append(feature['agent_prompt'])
    else:
        output.append("[ERROR: Agent prompt not found]")

    output.append("\n" + "=" * 80 + "\n")

    return "\n".join(output)


def save_to_file(feature, filename=None):
    """Save feature to file"""
    if not filename:
        filename = f"feature_{feature['id'].replace('.', '_')}.txt"

    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)

    filepath = output_dir / filename

    with open(filepath, 'w') as f:
        f.write(format_output(feature))

    return filepath


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        list_features()
        sys.exit(0)

    command = sys.argv[1]

    # List command
    if command == "--list":
        list_features()
        sys.exit(0)

    # Feature ID provided
    feature_id = command

    # Check if --save flag is provided
    save_flag = "--save" in sys.argv

    # Extract feature
    feature = extract_feature(feature_id)

    if not feature or not feature['agent_prompt']:
        print(f"Error: Feature {feature_id} not found or has no agent prompt", file=sys.stderr)
        print("Use --list to see all available features:", file=sys.stderr)
        print("  python copy_feature.py --list", file=sys.stderr)
        sys.exit(1)

    # Display output (clean, no extra messages for piping to clipboard)
    output = format_output(feature)
    print(output, end='')

    # Save to file if requested (separate from stdout)
    if save_flag:
        filepath = save_to_file(feature)
        print(f"\n✓ Saved to: {filepath}", file=sys.stderr)


if __name__ == "__main__":
    main()
