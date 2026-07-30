import re

with open('mockup_AirportGeneralInfo.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update .drawer-header CSS to align items horizontally
content = content.replace(
    '''        .drawer-header {
            padding: 20px 24px 0 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            border-bottom: 1px solid var(--border-color);
        }''',
    '''        .drawer-header {
            padding: 20px 24px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
        }'''
)

# 2. Replace drawer header HTML
old_header = r'<div class="drawer-header">.*?</div>\s*<div class="drawer-body" id="drawerBody">\s*<div class="section-header">.*?</div>'
new_header = '''<div class="drawer-header">
            <h2 id="drawerTitle" style="font-size: 18px; margin: 0; color: var(--primary-color);">Airport Details</h2>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div class="view-only">
                    <button class="btn btn-ghost" id="editDrawerBtn" style="border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 6px; font-weight: 500;"><i class="ri-edit-line"></i> Edit</button>
                </div>
                <div class="edit-only" style="gap: 12px; display: none;">
                    <button class="btn btn-ghost" id="cancelEditBtn" style="border: 1px solid var(--border-color);">Cancel</button>
                    <button class="btn btn-primary" id="saveEditBtn">Save</button>
                </div>
                <div style="width: 1px; height: 24px; background-color: var(--border-color);"></div>
                <button class="drawer-close" id="closeDrawerBtn" style="background: none; border: none; cursor: pointer; font-size: 20px; color: var(--text-light);"><i class="ri-close-line"></i></button>
            </div>
        </div>
        <div class="drawer-body" id="drawerBody">'''
content = re.sub(old_header, new_header, content, flags=re.DOTALL)

# 3. Change CSS from .drawer-body.edit-mode to .drawer-panel.edit-mode
content = content.replace('.drawer-body.edit-mode', '.drawer-panel.edit-mode')

# 4. Change JS from drawerBody.classList to drawerPanel.classList
content = content.replace("drawerBody.classList.add('edit-mode')", "drawerPanel.classList.add('edit-mode')")
content = content.replace("drawerBody.classList.remove('edit-mode')", "drawerPanel.classList.remove('edit-mode')")

with open('mockup_AirportGeneralInfo.html', 'w', encoding='utf-8') as f:
    f.write(content)
