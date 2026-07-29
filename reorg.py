import re
from bs4 import BeautifulSoup

with open('mockup_AirportGeneralInfo.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# 1. Update CSS
style_tag = soup.find('style')
css = style_tag.string

css = re.sub(r'\.detail-field\s*\{[^}]*\}', 
             '.detail-field {\n            display: flex;\n            flex-direction: row;\n            justify-content: space-between;\n            align-items: center;\n            padding: 8px 0;\n            border-bottom: 1px solid var(--border-light);\n            gap: 16px;\n        }', 
             css)

if '.detail-value-align' not in css:
    css += '''
        .detail-value-align {}
        .detail-field .detail-label { flex: 1; }
        .detail-field .detail-value, .detail-field .edit-only { flex: 1; text-align: right; }
        .drawer-section { margin-bottom: 24px; }
        .section-title { font-size: 13px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--border-light); letter-spacing: 0.5px; }
        .detail-column { display: flex; flex-direction: column; gap: 0; }
        .drawer-body.edit-mode .detail-field { padding: 8px 0; border-bottom: 1px dashed var(--border-light); }
'''
style_tag.string = css

# 2. Reorganize HTML
drawer_body = soup.find('div', id='drawerBody')
if drawer_body:
    detail_grid = drawer_body.find('div', class_='detail-grid')
    if detail_grid:
        fields = detail_grid.find_all('div', class_='detail-field', recursive=False)
        
        new_html = f'''
        <div class="drawer-section">
            <div class="section-title">AIRPORT GENERAL</div>
            <div class="detail-grid">
                <div class="detail-column">
                    {fields[0]}
                    {fields[1]}
                    {fields[4]}
                </div>
                <div class="detail-column">
                    {fields[2]}
                    {fields[3]}
                </div>
            </div>
        </div>

        <div class="drawer-section">
            <div class="section-title">CURFEW TIME</div>
            <div class="detail-grid" style="grid-template-columns: 1fr;">
                <div class="detail-column">
                    {fields[5]}
                </div>
            </div>
        </div>

        <div class="drawer-section">
            <div class="section-title">SERVICES</div>
            <div class="detail-grid">
                <div class="detail-column">
                    {fields[6]}
                    {fields[7]}
                    {fields[8]}
                </div>
                <div class="detail-column">
                    {fields[9]}
                    {fields[10]}
                </div>
            </div>
        </div>
        '''
        
        new_soup = BeautifulSoup(new_html, 'html.parser')
        detail_grid.replace_with(new_soup)

with open('mockup_AirportGeneralInfo.html', 'w', encoding='utf-8') as f:
    f.write(str(soup))
