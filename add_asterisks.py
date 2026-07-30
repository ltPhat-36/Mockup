import re

with open('mockup_AirportGeneralInfo.html', 'r', encoding='utf-8') as f:
    content = f.read()

labels_to_mark = ['ICAO Code', 'IATA Code', 'Airport Name', 'Country', 'Region', 
                  'Maintenance Service', 'GPU', 'GPS', 'ASU', 'PCA']

for label in labels_to_mark:
    content = content.replace(f'<span class="detail-label">{label}</span>', f'<span class="detail-label mandatory">{label}</span>')

css_to_add = '''
        .drawer-body.edit-mode .detail-label.mandatory::after {
            content: " *";
            color: red;
        }
'''
content = content.replace('</style>', f'{css_to_add}</style>')

with open('mockup_AirportGeneralInfo.html', 'w', encoding='utf-8') as f:
    f.write(content)
