# Implementation Scripts

Helper scripts for implementing the Educational MVC App based on the IMPLEMENTATION_PLAN.md.

## copy_feature.py

Extracts feature details and agent prompts from IMPLEMENTATION_PLAN.md for easy copy-paste.

### Installation

No installation required. Just run with Python 3.

### Usage

#### List all available features:
```bash
python3 copy_feature.py --list
```

This shows all 35 features organized by phase:
- Phase 0: Project Scaffolding (1 feature)
- Phase 1: Core Python MVC + SQLite (9 features)
- Phase 2: Method Logging & Developer Panel (10 features)
- Phase 3: Lesson Engine (6 features)
- Phase 4: Mode Toggle & Polish (5 features)
- Phase 5: Deployment & Documentation (6 features)

#### Extract a specific feature:
```bash
python3 copy_feature.py 0.1
python3 copy_feature.py 1.5
python3 copy_feature.py 2.3
```

This will display:
1. **Agent Guidelines & Project Context** (General Principles + Project Structure)
   - These sections apply to ALL features and should be understood first
2. **Feature Details** (title, time estimate, files to create/modify)
3. **Complete Agent Prompt** (ready to copy-paste to the agent)

#### Pipe directly to clipboard (recommended):

**macOS:**
```bash
python3 copy_feature.py 1.5 | pbcopy
```

**Linux (with wl-copy):**
```bash
python3 copy_feature.py 1.5 | wl-copy
```

**Linux (with xclip):**
```bash
python3 copy_feature.py 1.5 | xclip -selection clipboard
```

**Windows (PowerShell):**
```powershell
python3 copy_feature.py 1.5 | Set-Clipboard
```

The output is optimized for piping - no extraneous messages, just the feature content ready to paste to your agent!

#### Save feature to file:
```bash
python3 copy_feature.py 1.5 --save
```

This saves the extracted feature to a file in the `output/` directory:
```
implementation-scripts/output/feature_1_5.txt
```

### Workflow

**Step 1: List features**
```bash
python3 copy_feature.py --list
```

**Step 2: Choose a feature to implement**
Pick the next feature from the list. Example: Feature 0.1

**Step 3: Extract and copy to clipboard**
```bash
# On macOS:
python3 copy_feature.py 0.1 | pbcopy

# On Linux (wl-copy):
python3 copy_feature.py 0.1 | wl-copy

# On Linux (xclip):
python3 copy_feature.py 0.1 | xclip -selection clipboard

# Or view first (without copying):
python3 copy_feature.py 0.1
```

This extracts all the context the agent needs:
- **Agent Guidelines & Best Practices** (applies to all features)
- **Project Structure** (so agent understands the architecture)
- **Feature Details** (title, time, files to create/modify)
- **Specific Feature Prompt** (detailed instructions for this task)

**Step 4: Paste to agent**
Open your chat with the agent and paste the content. Everything is pre-formatted and ready to go!

**Step 5: Test after implementation**
Use the test steps provided in the feature prompt to verify the implementation works.

**Step 6: Approve and move to next feature**
Once testing passes, proceed to the next feature.

### Example Workflow

```bash
# See all features
$ python3 copy_feature.py --list

# Start with first feature
$ python3 copy_feature.py 0.1

# Copy the displayed agent prompt
# Paste it to an agent with message: "Implement this feature"

# Wait for agent to complete and commit

# You test it

# Move to next feature
$ python3 copy_feature.py 1.1
```

### Tips

- Use `--save` flag to save feature details to a text file for reference
- Check the feature's "FILES TO CREATE/MODIFY" section to understand scope
- The "TIME" estimate (30min-1hr) helps you gauge feature complexity
- Keep the IMPLEMENTATION_PLAN.md file up to date as you progress

### Troubleshooting

**"Feature X not found"**
- Check that you're using the correct feature ID (e.g., 1.5 not 15)
- Use `--list` to see all available features
- Ensure IMPLEMENTATION_PLAN.md is in the parent directory

**"python3 command not found"**
- Make sure Python 3 is installed
- On some systems, use `python` instead of `python3`
- Check your PATH environment variable

### Output Files

When using `--save`, output files are created in `implementation-scripts/output/`:
```
feature_0_1.txt
feature_1_1.txt
feature_1_5.txt
...
```

These files contain the full feature details and can be referenced later.
