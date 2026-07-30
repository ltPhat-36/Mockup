import re
from bs4 import BeautifulSoup

def process_file():
    with open('mockup_AirportGeneralInfo.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    table = soup.find('table')
    if not table:
        print("Table not found")
        return
        
    # Reorder the headers
    thead = table.find('thead')
    if thead:
        tr = thead.find('tr')
        ths = tr.find_all('th')
        if len(ths) > 4:
            airport_name_th = ths[4]
            airport_name_th.extract()
            ths[1].insert_after(airport_name_th)
            
    # Reorder the body rows
    tbody = table.find('tbody')
    if tbody:
        trs = tbody.find_all('tr')
        for tr in trs:
            tds = tr.find_all('td')
            if len(tds) > 4:
                airport_name_td = tds[4]
                airport_name_td.extract()
                tds[1].insert_after(airport_name_td)
                
    # Re-insert modified table
    new_table_html = str(table)
    
    old_table_match = re.search(r'<table>.*?</table>', html, flags=re.DOTALL)
    if old_table_match:
        html = html[:old_table_match.start()] + new_table_html + html[old_table_match.end():]
        
    # Now update JS
    html = html.replace('inputs[2].value = rowData[4]; // Airport Name', 'inputs[2].value = rowData[2]; // Airport Name')
    html = html.replace('inputs[3].value = rowData[2]; // Country', 'inputs[3].value = rowData[3]; // Country')
    html = html.replace('inputs[4].value = rowData[3]; // Region', 'inputs[4].value = rowData[4]; // Region')

    html = html.replace('viewValues[2].textContent = rowData[4];', 'viewValues[2].textContent = rowData[2];')
    html = html.replace('viewValues[3].textContent = rowData[2];', 'viewValues[3].textContent = rowData[3];')
    html = html.replace('viewValues[4].textContent = rowData[3];', 'viewValues[4].textContent = rowData[4];')

    html = html.replace('if (drawerTitle) drawerTitle.textContent = rowData[4];', 'if (drawerTitle) drawerTitle.textContent = rowData[2];')

    with open('mockup_AirportGeneralInfo.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == "__main__":
    process_file()
