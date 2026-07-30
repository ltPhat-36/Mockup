import re

with open('mockup_AirportGeneralInfo.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add placeholders to text inputs
content = content.replace(
    '<input class="custom-input edit-only" type="text" value="VVNB" />',
    '<input class="custom-input edit-only" type="text" value="VVNB" placeholder="Enter ICAO" />'
)
content = content.replace(
    '<input class="custom-input edit-only" type="text" value="HAN" />',
    '<input class="custom-input edit-only" type="text" value="HAN" placeholder="Enter IATA" />'
)
content = content.replace(
    '<input class="custom-input edit-only" type="text" value="Noi Bai International Airport" />',
    '<input class="custom-input edit-only" type="text" value="Noi Bai International Airport" placeholder="Enter Airport Name" />'
)
content = content.replace(
    '<input class="custom-input edit-only" type="text" value="VN" />',
    '<input class="custom-input edit-only" type="text" value="VN" placeholder="Enter Country" />'
)
content = content.replace(
    '<input class="custom-input edit-only" type="text" value="Asia" />',
    '<input class="custom-input edit-only" type="text" value="Asia" placeholder="Enter Region" />'
)

# Add placeholder option to selects
content = content.replace(
    '<select class="custom-input edit-only">',
    '<select class="custom-input edit-only">\n                                <option value="" disabled hidden>Select Availability</option>'
)

# Revert JS to set input.value = '' for all inputs so the placeholder shows
js_old = '''inputs.forEach(input => {
                    if (input.tagName === 'SELECT') {
                        input.value = 'available';
                    } else {
                        input.value = '';
                    }
                });'''
js_new = '''inputs.forEach(input => input.value = '');'''
content = content.replace(js_old, js_new)

# Wait, the time-picker already has placeholder="HH:mm" from an earlier step. I should change it to "hh:mm" if I want to perfectly match the image, but the user explicitly said "placeholder HH:mm" earlier. I will change it to "hh:mm" anyway just to be safe as the user said "như ảnh".
content = content.replace('placeholder="HH:mm"', 'placeholder="hh:mm"')

with open('mockup_AirportGeneralInfo.html', 'w', encoding='utf-8') as f:
    f.write(content)
