import os
import re

root = r'D:\GithubClone\solutionhub\frontend\src'
exclude = {'node_modules', 'graphify-out', '.git', 'dist', 'build', '.next', '.chrome-test-5'}

files = []
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in exclude]
    for f in filenames:
        if f.endswith(('.jsx', '.js')):
            files.append(os.path.join(dirpath, f))

print(f'Processing {len(files)} files')

# Only replace UI-facing text and component/file names
# DO NOT replace DB field names, route paths, or backend API names
compound_replacements = [
    ('CustomerLayout', 'StudentLayout'),
    ('CustomerOrders', 'StudentOrders'),
    ('CustomerOverview', 'StudentOverview'),
    ('CustomerSupport', 'StudentSupport'),
    ('CustomerProfile', 'StudentProfile'),
    ('CustomerCertificates', 'StudentCertificates'),
    ('CustomerMyCourses', 'StudentMyCourses'),
    ('CustomerSignup', 'StudentSignup'),
    ('AdminCustomers', 'AdminStudents'),
    ('CustomerDashboard', 'StudentDashboard'),
    # DB fields - keep as-is, do NOT include here
    # 'customer_name', 'customer_email', 'customer_phone', 'customer_uid'
]

# Word-boundary replacements (handles standalone words)
word_replacements = [
    (r'\bCustomer\b', 'Student'),
    (r'\bcustomer\b', 'student'),
    (r'\bcustomers\b', 'students'),
    (r'\bCUSTOMER\b', 'STUDENT'),
]

# Patterns to skip in word replacement
skip_patterns = [
    r'customer_name',
    r'customer_email',
    r'customer_phone',
    r'customer_uid',
    r'/customer/',
    r'/customers/',
    r"'customer'",
    r'"customer"',
    r'`customer`',
    r'registerCustomer',
    r'register-customer',
]

def should_skip(match_text, start, full_content):
    # Check if this match is part of a protected pattern
    for pat in skip_patterns:
        if re.search(pat, full_content[max(0,start-20):start+30]):
            return True
    return False

def replace_text(content):
    # Replace specific compound terms first
    for old, new in compound_replacements:
        content = content.replace(old, new)
    # Replace standalone words with skip logic
    for pattern, replacement in word_replacements:
        def replacer(m):
            if should_skip(m.group(0), m.start(), content):
                return m.group(0)
            return replacement
        content = re.sub(pattern, replacer, content)
    return content

updated = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    new_content = replace_text(content)
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        updated.append(os.path.relpath(f, root))

print(f'Updated {len(updated)} files')
for u in updated[:20]:
    print(f'  {u}')
if len(updated) > 20:
    print(f'  ... and {len(updated)-20} more')

rename_map = {
    'AdminCustomers.jsx': 'AdminStudents.jsx',
    'CustomerLayout.jsx': 'StudentLayout.jsx',
    'CustomerMyCourses.jsx': 'StudentMyCourses.jsx',
    'CustomerOrders.jsx': 'StudentOrders.jsx',
    'CustomerOverview.jsx': 'StudentOverview.jsx',
    'CustomerProfile.jsx': 'StudentProfile.jsx',
    'CustomerCertificates.jsx': 'StudentCertificates.jsx',
    'CustomerSupport.jsx': 'StudentSupport.jsx',
    'CustomerSignup.jsx': 'StudentSignup.jsx',
}

for old, new in rename_map.items():
    for f in files:
        if os.path.basename(f) == old:
            new_f = os.path.join(os.path.dirname(f), new)
            os.rename(f, new_f)
            print(f'Renamed: {os.path.relpath(f, root)} -> {os.path.relpath(new_f, root)}')

# Re-list files after renames
files2 = []
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in exclude]
    for f in filenames:
        if f.endswith(('.jsx', '.js')):
            files2.append(os.path.join(dirpath, f))

for f in files2:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    original = content
    for old, new in rename_map.items():
        content = content.replace(old, new)
    content = content.replace('CustomerDashboard', 'StudentDashboard')
    if content != original:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Fixed imports: {os.path.relpath(f, root)}')

print('All done!')
