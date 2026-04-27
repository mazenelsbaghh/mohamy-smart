import os
import glob
import re

base_path = "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis"

# Remove exports from the 3 defining files
files_to_remove_export = [
    f"{base_path}/adminComplaint/steps/ComplaintStep1Classification.tsx",
    f"{base_path}/legalWarning/steps/WarningStep1Classification.tsx",
    f"{base_path}/defenseMemoPage/DefenseMemoPage.tsx"
]

for f in files_to_remove_export:
    with open(f, "r") as file:
        content = file.read()
    content = re.sub(r'export\s+const\s+(ADMIN_COMPLAINT_STEPS|LEGAL_WARNING_STEPS|DEFENSE_MEMO_STEPS)\s*=\s*\[[\s\S]*?\];', '', content)
    with open(f, "w") as file:
        file.write(content)

# Update imports in all files
all_files = glob.glob(f"{base_path}/**/*.tsx", recursive=True)

for f in all_files:
    with open(f, "r") as file:
        content = file.read()
        
    old_content = content
    
    # Remove old imports
    content = re.sub(r"import\s*\{\s*ADMIN_COMPLAINT_STEPS\s*\}\s*from\s*'\./ComplaintStep1Classification';\n?", "", content)
    content = re.sub(r"import\s*\{\s*LEGAL_WARNING_STEPS\s*\}\s*from\s*'\./WarningStep1Classification';\n?", "", content)
    content = re.sub(r"import\s*\{\s*DEFENSE_MEMO_STEPS\s*\}\s*from\s*'(\.\./)?DefenseMemoPage';\n?", "", content)
    
    # Add new imports if needed
    needs_admin = "ADMIN_COMPLAINT_STEPS" in content
    needs_warning = "LEGAL_WARNING_STEPS" in content
    needs_defense = "DEFENSE_MEMO_STEPS" in content
    
    if needs_admin or needs_warning or needs_defense:
        imports_to_add = []
        if needs_admin: imports_to_add.append("ADMIN_COMPLAINT_STEPS")
        if needs_warning: imports_to_add.append("LEGAL_WARNING_STEPS")
        if needs_defense: imports_to_add.append("DEFENSE_MEMO_STEPS")
        
        # Calculate relative path to src/components/analysisWorkflow/workflowConstants
        # src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep1Classification.tsx -> ../../../../../../components/analysisWorkflow/workflowConstants
        
        rel_path = ""
        if "adminComplaint/steps" in f or "legalWarning/steps" in f or "defenseMemoPage/steps" in f:
            rel_path = "../../../../../../components/analysisWorkflow/workflowConstants"
        elif "defenseMemoPage" in f:
            rel_path = "../../../../../components/analysisWorkflow/workflowConstants"
            
        import_stmt = f"import {{ {', '.join(imports_to_add)} }} from '{rel_path}';\n"
        
        # Add import after other imports
        content = re.sub(r'(import .*;\n)(?!import )', r'\1' + import_stmt, content, count=1)
        
    if old_content != content:
        with open(f, "w") as file:
            file.write(content)

print("Done")
