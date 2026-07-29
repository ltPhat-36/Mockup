import re

with open('mockup_AirportGeneralInfo.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update .detail-field padding and remove min-height
content = re.sub(
    r'\.detail-field\s*\{[^}]*\}',
    '''.detail-field {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid var(--border-light);
            gap: 16px;
            box-sizing: border-box;
        }''',
    content
)

# 2. Update .drawer-body.edit-mode .detail-field padding
content = re.sub(
    r'\.drawer-body\.edit-mode \.detail-field\s*\{[^}]*\}',
    '''.drawer-body.edit-mode .detail-field {
            padding: 2px 0;
            border-bottom: 1px dashed var(--border-light);
        }''',
    content
)

# 3. Update .detail-value and .edit-only layout
content = re.sub(
    r'\.detail-field \.detail-value,\s*\n\s*\.detail-field \.edit-only\s*\{[^}]*\}',
    '''.detail-field .detail-value,
        .detail-field .edit-only {
            flex: 0 0 180px;
            width: 180px;
            text-align: left;
        }''',
    content
)

# 4. Remove inline width: 120px from Curfew Time
content = content.replace('style="position: relative; width: 120px;"', 'style="position: relative;"')

with open('mockup_AirportGeneralInfo.html', 'w', encoding='utf-8') as f:
    f.write(content)
