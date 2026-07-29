import re

with open('mockup_AirportGeneralInfo.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add IDs to Drawer Title
content = content.replace('<h2>Noi Bai International Airport</h2>', '<h2 id="drawerTitle">Noi Bai International Airport</h2>')
content = content.replace('<div style="font-size: 15px; font-weight: 600; color: var(--text-main);">VVNB - HAN</div>', '<div id="drawerSubtitle" style="font-size: 15px; font-weight: 600; color: var(--text-main);">VVNB - HAN</div>')

# 2. Remove addModal HTML
modal_start = content.find('<!-- Add New Modal -->')
modal_end = content.find('<!-- Drawer Overlay -->')
if modal_start != -1 and modal_end != -1:
    content = content[:modal_start] + content[modal_end:]

# 3. Rewrite the JS
script_start = content.find('// Modal Logic')
script_end = content.find('<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>')

new_js = '''// Drawer Logic
        const drawerOverlay = document.getElementById('drawerOverlay');
        const drawerPanel = document.getElementById('drawerPanel');
        const closeDrawerBtn = document.getElementById('closeDrawerBtn');
        const drawerBody = document.getElementById('drawerBody');
        const openBtn = document.getElementById('addNewBtn');
        const drawerTitle = document.getElementById('drawerTitle');
        const drawerSubtitle = document.getElementById('drawerSubtitle');

        const openDrawer = (mode = 'view', rowData = null) => {
            drawerOverlay.classList.add('active');
            drawerPanel.classList.add('active');
            
            const inputs = drawerBody.querySelectorAll('input.edit-only, select.edit-only');
            const viewValues = drawerBody.querySelectorAll('.detail-value');
            
            if (mode === 'add') {
                drawerBody.classList.add('edit-mode');
                if(drawerTitle) drawerTitle.textContent = 'Add New Airport';
                if(drawerSubtitle) drawerSubtitle.textContent = '';
                inputs.forEach(input => input.value = '');
            } else if (mode === 'edit') {
                drawerBody.classList.add('edit-mode');
                if(drawerTitle) drawerTitle.textContent = 'Edit Airport';
                if (rowData) {
                    if(drawerSubtitle) drawerSubtitle.textContent = rowData[0] + ' - ' + rowData[1];
                    // populate inputs
                    if(inputs.length >= 12) {
                        inputs[0].value = rowData[0]; // ICAO
                        inputs[1].value = rowData[1]; // IATA
                        inputs[2].value = rowData[4]; // Airport Name
                        inputs[3].value = rowData[2]; // Country
                        inputs[4].value = rowData[3]; // Region
                        
                        if (rowData[5] && rowData[5].includes('-->')) {
                            const times = rowData[5].split('-->').map(t => t.trim());
                            inputs[5].value = times[0] || '';
                            inputs[6].value = times[1] || '';
                        } else {
                            inputs[5].value = '';
                            inputs[6].value = '';
                        }
                        
                        inputs[7].value = (rowData[6] || '').toLowerCase().replace(' ', '_'); // Maintenance
                        inputs[8].value = (rowData[7] || '').toLowerCase().replace(' ', '_'); // GPU
                        inputs[9].value = (rowData[8] || '').toLowerCase().replace(' ', '_'); // GPS
                        inputs[10].value = (rowData[9] || '').toLowerCase().replace(' ', '_'); // ASU
                        inputs[11].value = (rowData[10] || '').toLowerCase().replace(' ', '_'); // PCA
                    }
                }
            } else {
                drawerBody.classList.remove('edit-mode');
                if (rowData) {
                    if(drawerTitle) drawerTitle.textContent = rowData[4];
                    if(drawerSubtitle) drawerSubtitle.textContent = rowData[0] + ' - ' + rowData[1];
                    // populate view values
                    if(viewValues.length >= 12) {
                        viewValues[0].textContent = rowData[0];
                        viewValues[1].textContent = rowData[1];
                        viewValues[2].textContent = rowData[4];
                        viewValues[3].textContent = rowData[2];
                        viewValues[4].textContent = rowData[3];
                        
                        if (rowData[5] && rowData[5].includes('-->')) {
                            const times = rowData[5].split('-->').map(t => t.trim());
                            viewValues[5].textContent = times[0] || '';
                            viewValues[6].textContent = times[1] || '';
                        } else {
                            viewValues[5].textContent = '';
                            viewValues[6].textContent = '';
                        }
                        
                        viewValues[7].textContent = rowData[6] || '';
                        viewValues[8].textContent = rowData[7] || '';
                        viewValues[9].textContent = rowData[8] || '';
                        viewValues[10].textContent = rowData[9] || '';
                        viewValues[11].textContent = rowData[10] || '';
                    }
                }
            }
        };

        const closeDrawer = () => {
            drawerOverlay.classList.remove('active');
            drawerPanel.classList.remove('active');
        };

        openBtn.addEventListener('click', () => {
            openDrawer('add');
        });

        closeDrawerBtn.addEventListener('click', closeDrawer);
        drawerOverlay.addEventListener('click', closeDrawer);

        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.ri-pencil-line')) return;
                const tds = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
                openDrawer('view', tds);
            });
            row.style.cursor = 'pointer';

            const eyeIcon = row.querySelector('.ri-eye-line');
            const pencilIcon = row.querySelector('.ri-pencil-line');

            if (eyeIcon) {
                eyeIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const tds = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
                    openDrawer('view', tds);
                });
            }
            if (pencilIcon) {
                pencilIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const tds = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
                    openDrawer('edit', tds);
                });
            }
        });

        const editDrawerBtn = document.getElementById('editDrawerBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const saveEditBtn = document.getElementById('saveEditBtn');

        editDrawerBtn.addEventListener('click', () => {
            drawerBody.classList.add('edit-mode');
            if(drawerTitle) drawerTitle.textContent = 'Edit Airport';
        });

        cancelEditBtn.addEventListener('click', () => {
            drawerBody.classList.remove('edit-mode');
        });

        saveEditBtn.addEventListener('click', () => {
            drawerBody.classList.remove('edit-mode');
            // update viewValues based on inputs if needed (mockup only)
        });
    </script>
'''

if script_start != -1 and script_end != -1:
    content = content[:script_start] + new_js + content[script_end + len('<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>'):]
    # Re-insert the flatpickr script
    content = content.replace('</script>\n</body>', '</script>\n    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>\n</body>')

with open('mockup_AirportGeneralInfo.html', 'w', encoding='utf-8') as f:
    f.write(content)
