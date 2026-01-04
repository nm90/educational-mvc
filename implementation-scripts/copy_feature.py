#!/usr/bin/env python3
"""
Copy Feature Extractor

Extracts feature details and agent prompt from docs/IMPLEMENTATION_PLAN.md
or docs/ENHANCEMENTS-PLAN.md for easy copy-paste to agents.

Usage:
    python copy_feature.py 0.1              # Extract Feature 0.1 from IMPLEMENTATION_PLAN
    python copy_feature.py 1.5              # Extract Feature 1.5 from IMPLEMENTATION_PLAN
    python copy_feature.py -e 1.1           # Extract Enhancement 1.1 from ENHANCEMENTS-PLAN
    python copy_feature.py --enhancements 2.1   # Same as above
    python copy_feature.py 2.1 --save       # Save to file
    python copy_feature.py --list           # List all features from IMPLEMENTATION_PLAN
    python copy_feature.py -e --list        # List all enhancements from ENHANCEMENTS-PLAN

"""

import re
import sys
import os
from pathlib import Path


# Plan file types
IMPLEMENTATION_PLAN = "implementation"
ENHANCEMENTS_PLAN = "enhancements"


def get_plan_file(plan_type=IMPLEMENTATION_PLAN):
    """Get the path to the appropriate plan file"""
    script_dir = Path(__file__).parent

    if plan_type == ENHANCEMENTS_PLAN:
        plan_file = script_dir.parent / "docs" / "ENHANCEMENTS-PLAN.md"
    else:
        plan_file = script_dir.parent / "docs" / "IMPLEMENTATION_PLAN.md"

    if not plan_file.exists():
        print(f"Error: Plan file not found at {plan_file}")
        sys.exit(1)

    return plan_file


def read_plan(plan_type=IMPLEMENTATION_PLAN):
    """Read the entire plan file"""
    plan_file = get_plan_file(plan_type)
    with open(plan_file, 'r') as f:
        return f.read()


def extract_general_principles(plan_type=IMPLEMENTATION_PLAN):
    """Extract Agent Guidelines & Best Practices section"""
    plan = read_plan(plan_type)

    # Find the section between "## Agent Guidelines & Best Practices" and the next section
    pattern = r"## Agent Guidelines & Best Practices\n\n(.*?)\n---\n"
    match = re.search(pattern, plan, re.DOTALL)

    if match:
        return match.group(1)
    return None


def extract_project_structure(plan_type=IMPLEMENTATION_PLAN):
    """Extract Project Structure section"""
    plan = read_plan(plan_type)

    # Find the section between "## Project Structure" and the next major section
    pattern = r"## Project Structure\n\n(.*?)\n---"
    match = re.search(pattern, plan, re.DOTALL)

    if match:
        return match.group(1)
    return None


def extract_implementation_feature(feature_id):
    """
    Extract feature section from IMPLEMENTATION_PLAN.md.
    Pattern: #### Feature X.Y: Title
    """
    plan = read_plan(IMPLEMENTATION_PLAN)

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
        'general_principles': extract_general_principles(IMPLEMENTATION_PLAN),
        'project_structure': extract_project_structure(IMPLEMENTATION_PLAN),
        'plan_type': IMPLEMENTATION_PLAN
    }


def extract_enhancement(enhancement_id):
    """
    Extract enhancement section from ENHANCEMENTS-PLAN.md.
    Pattern: ### X.Y Title
    """
    plan = read_plan(ENHANCEMENTS_PLAN)

    # Escape dots in regex
    escaped_id = enhancement_id.replace('.', r'\.')

    # Pattern to match enhancement header (### X.Y Title)
    enhancement_pattern = rf"### {escaped_id} (.*?)\n"
    match = re.search(enhancement_pattern, plan)

    if not match:
        return None

    enhancement_title = match.group(1)
    start_pos = match.start()

    # Find the end of this enhancement (next enhancement or next priority section)
    next_pattern = r"### \d+\.\d+|## Priority \d+:|## Implementation Order|## Technical Notes"
    next_match = re.search(next_pattern, plan[start_pos + 10:])

    if next_match:
        end_pos = start_pos + 10 + next_match.start()
    else:
        end_pos = len(plan)

    enhancement_section = plan[start_pos:end_pos]

    # Extract Goal
    goal_match = re.search(r"\*\*Goal\*\*: (.*?)\n", enhancement_section)
    goal = goal_match.group(1) if goal_match else ""

    # Extract Files
    files_section = re.search(r"\*\*Files\*\*:\n((?:- .*?\n)+)", enhancement_section)
    files = []
    if files_section:
        files_text = files_section.group(1)
        files = [f.strip('- `').strip('`').strip() for f in files_text.split('\n') if f.strip()]

    # Extract Implementation section
    impl_match = re.search(r"\*\*Implementation\*\*:\n((?:- .*?\n)+)", enhancement_section)
    implementation = ""
    if impl_match:
        implementation = impl_match.group(1).strip()

    # Extract Investigation section (for bugs)
    invest_match = re.search(r"\*\*Investigation(?:\sneeded)?\*\*:?\n((?:- .*?\n)+)", enhancement_section)
    investigation = ""
    if invest_match:
        investigation = invest_match.group(1).strip()

    # Extract Content outline (for lessons)
    content_match = re.search(r"\*\*Content outline\*\*:\n((?:\d+\. .*?\n)+)", enhancement_section)
    content_outline = ""
    if content_match:
        content_outline = content_match.group(1).strip()

    # Build a comprehensive description/prompt from available sections
    description_parts = []
    if goal:
        description_parts.append(f"Goal: {goal}")
    if implementation:
        description_parts.append(f"\nImplementation:\n{implementation}")
    if investigation:
        description_parts.append(f"\nInvestigation:\n{investigation}")
    if content_outline:
        description_parts.append(f"\nContent outline:\n{content_outline}")

    description = "\n".join(description_parts)

    # Build agent prompt from the full section
    agent_prompt = f"""You are implementing Enhancement {enhancement_id}: {enhancement_title}

CONTEXT:
- This is part of the Educational MVC App enhancements
- See ENHANCEMENTS-PLAN.md for full context
- Follow the Agent Guidelines & Best Practices

TASK:
{description}

FILES TO MODIFY:
{chr(10).join('- ' + f for f in files) if files else '- See enhancement details'}

IMPORTANT:
- Keep changes focused on the specific enhancement
- Test your changes before committing
- Ask if unclear about implementation approach

When complete:
- Commit with message: "feat: {enhancement_title.lower()}" or "fix: {enhancement_title.lower()}"
- Ask user to test the changes
"""

    return {
        'id': enhancement_id,
        'title': enhancement_title,
        'time': "Variable",
        'files': files,
        'description': description,
        'agent_prompt': agent_prompt,
        'general_principles': extract_general_principles(ENHANCEMENTS_PLAN),
        'project_structure': extract_project_structure(ENHANCEMENTS_PLAN),
        'plan_type': ENHANCEMENTS_PLAN
    }


def extract_feature(feature_id, plan_type=IMPLEMENTATION_PLAN):
    """Extract feature from appropriate plan file"""
    if plan_type == ENHANCEMENTS_PLAN:
        return extract_enhancement(feature_id)
    else:
        return extract_implementation_feature(feature_id)


def list_implementation_features():
    """List all features from IMPLEMENTATION_PLAN.md"""
    plan = read_plan(IMPLEMENTATION_PLAN)

    # Find all features
    pattern = r"#### Feature ([\d\.]+): (.*?)\n\*\*Time\*\*: (.*?)\n"
    matches = re.findall(pattern, plan)

    if not matches:
        print("No features found in IMPLEMENTATION_PLAN.md")
        return

    print("\n" + "=" * 80)
    print("IMPLEMENTATION PLAN FEATURES")
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


def list_enhancements():
    """List all enhancements from ENHANCEMENTS-PLAN.md"""
    plan = read_plan(ENHANCEMENTS_PLAN)

    # Find all enhancements (### X.Y Title pattern)
    pattern = r"### (\d+\.\d+) (.*?)\n"
    matches = re.findall(pattern, plan)

    if not matches:
        print("No enhancements found in ENHANCEMENTS-PLAN.md")
        return

    print("\n" + "=" * 80)
    print("ENHANCEMENTS PLAN")
    print("=" * 80 + "\n")

    current_priority = None

    for enhancement_id, title in matches:
        # Extract priority from enhancement ID (e.g., "1" from "1.1")
        priority = enhancement_id.split('.')[0]

        if priority != current_priority:
            current_priority = priority
            priority_names = {
                "1": "Priority 1: DevPanel Improvements",
                "2": "Priority 2: Flow Diagram Enhancement",
                "3": "Priority 3: UI/UX Fixes",
                "4": "Priority 4: Bug Fixes",
                "5": "Priority 5: Lesson Content Updates"
            }
            print(f"\n{priority_names.get(priority, f'Priority {priority}')}")
            print("-" * 80)

        print(f"  {enhancement_id:>4}  {title:<60}")

    print("\n" + "=" * 80)
    print(f"Total: {len(matches)} enhancements")
    print("=" * 80 + "\n")
    print("Usage: python copy_feature.py -e <enhancement_id>")
    print("Example: python copy_feature.py -e 1.1\n")


def list_features(plan_type=IMPLEMENTATION_PLAN):
    """List features from appropriate plan file"""
    if plan_type == ENHANCEMENTS_PLAN:
        list_enhancements()
    else:
        list_implementation_features()


def format_output(feature):
    """Format feature for display and copying"""
    output = []

    plan_name = "ENHANCEMENTS PLAN" if feature['plan_type'] == ENHANCEMENTS_PLAN else "IMPLEMENTATION PLAN"

    # Include General Principles and Project Structure at the top
    output.append("\n" + "=" * 80)
    output.append(f"AGENT GUIDELINES & PROJECT CONTEXT ({plan_name})")
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
    feature_type = "ENHANCEMENT" if feature['plan_type'] == ENHANCEMENTS_PLAN else "FEATURE"
    output.append("=" * 80)
    output.append(f"{feature_type} {feature['id']}: {feature['title']}")
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
        prefix = "enhancement" if feature['plan_type'] == ENHANCEMENTS_PLAN else "feature"
        filename = f"{prefix}_{feature['id'].replace('.', '_')}.txt"

    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)

    filepath = output_dir / filename

    with open(filepath, 'w') as f:
        f.write(format_output(feature))

    return filepath


def parse_args():
    """Parse command line arguments"""
    args = sys.argv[1:]

    plan_type = IMPLEMENTATION_PLAN
    feature_id = None
    save_flag = False
    list_flag = False

    i = 0
    while i < len(args):
        arg = args[i]

        if arg in ['-e', '--enhancements']:
            plan_type = ENHANCEMENTS_PLAN
        elif arg == '--save':
            save_flag = True
        elif arg == '--list':
            list_flag = True
        elif not arg.startswith('-'):
            feature_id = arg

        i += 1

    return {
        'plan_type': plan_type,
        'feature_id': feature_id,
        'save_flag': save_flag,
        'list_flag': list_flag
    }


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nAvailable options:")
        print("  --list              List all features/enhancements")
        print("  -e, --enhancements  Use ENHANCEMENTS-PLAN.md instead of IMPLEMENTATION_PLAN.md")
        print("  --save              Save output to file")
        print("\nExamples:")
        print("  python copy_feature.py --list           # List implementation features")
        print("  python copy_feature.py -e --list        # List enhancements")
        print("  python copy_feature.py 1.5              # Get implementation feature 1.5")
        print("  python copy_feature.py -e 1.1           # Get enhancement 1.1")
        sys.exit(0)

    args = parse_args()

    # List command
    if args['list_flag']:
        list_features(args['plan_type'])
        sys.exit(0)

    # Feature ID required for extraction
    if not args['feature_id']:
        print("Error: Feature/enhancement ID required", file=sys.stderr)
        print("Use --list to see available features/enhancements", file=sys.stderr)
        sys.exit(1)

    # Extract feature
    feature = extract_feature(args['feature_id'], args['plan_type'])

    if not feature or not feature['agent_prompt']:
        plan_name = "ENHANCEMENTS-PLAN.md" if args['plan_type'] == ENHANCEMENTS_PLAN else "IMPLEMENTATION_PLAN.md"
        print(f"Error: Feature/enhancement {args['feature_id']} not found in {plan_name}", file=sys.stderr)
        print("Use --list to see all available features/enhancements:", file=sys.stderr)
        if args['plan_type'] == ENHANCEMENTS_PLAN:
            print("  python copy_feature.py -e --list", file=sys.stderr)
        else:
            print("  python copy_feature.py --list", file=sys.stderr)
        sys.exit(1)

    # Display output (clean, no extra messages for piping to clipboard)
    output = format_output(feature)
    print(output, end='')

    # Save to file if requested (separate from stdout)
    if args['save_flag']:
        filepath = save_to_file(feature)
        print(f"\n✓ Saved to: {filepath}", file=sys.stderr)


if __name__ == "__main__":
    main()
