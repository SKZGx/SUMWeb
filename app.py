from flask import Flask, render_template, request, jsonify
from flask import request
import json
import urllib.parse
from jinja2 import Environment
from colorama import Fore, Style  # Додайте імпорт кольорових стилів
import sys
sys.stdout.reconfigure(encoding='utf-8')


app = Flask(__name__)
app.debug = True

# Зчитування даних з JSON файлу
data_file = "mods.json"  # Шлях до вашого JSON-файлу



def generate_formatted_id(file_paths):
    all_data = []

    # Read data from all specified files and merge into one list
    for file_path in file_paths:
        file_data = read_data_from_file(file_path)
        all_data.extend(file_data)

    # Check if there is any data
    if all_data:
        # Get the maximum id from the combined data
        max_id = max(int(card.get('id', 0)) for card in all_data)
        new_id = max_id + 1
    else:
        # If no data, start with id 1
        new_id = 1

    return f"{new_id:06d}"










def read_data_from_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        print(f'{Fore.RED}Error: File {file_path} not found{Style.RESET_ALL}')
        return []


def save_data_to_file(data, file_path):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=4)
    except FileNotFoundError:
        print(f'{Fore.RED}Error: File {file_path} not found{Style.RESET_ALL}')



# Додавання фільтра urlparse до Jinja2
def urlparse(url):
    from urllib.parse import urlparse
    netloc = urlparse(url).netloc
    if netloc.startswith("www."):
        netloc = netloc[4:]
    if netloc.endswith(".com"):
        netloc = netloc[:-4]
    return netloc



app.jinja_env.filters['urlparse'] = urlparse

@app.route('/')
def editor():
    data = read_data_from_file(data_file)
    return render_template('editor.html', data=data)

@app.route('/delete_card', methods=['POST'])
def delete_card_handler():
    data = request.get_json()
    card_id = data.get('id')  # Change 'title' to 'id'

    if card_id is not None:
        print(f'{Fore.YELLOW}Trying to delete card with id: {card_id}{Style.RESET_ALL}')
        data = read_data_from_file(data_file)
        for card in data:
            if 'id' in card and card['id'] == card_id:  # Check against 'id' instead of 'title'
                data.remove(card)
                save_data_to_file(data)
                print(f'{Fore.GREEN}Deleted card with id: {card_id}{Style.RESET_ALL}')
                return '', 204  # Successful response without a body

    return f'{Fore.RED}Card not found{Style.RESET_ALL}', 404

@app.route('/add_card', methods=['POST'])
def add_card():
    data = request.get_json()
    new_title = data.get('title')
    new_description = data.get('description')
    new_image = data.get('image')
    new_author = data.get('author')
    new_verified = data.get('verified')
    new_completed = data.get('completed')
    new_link = data.get('link')
    file_path = data.get('file_path', 'mods.json')  # Default to 'mods.json' if not provided

    # Генерування нового унікального 'id' based on data from both mods.json and other.json
    new_id = generate_formatted_id(['mods.json', 'other.json'])


    print(f'{Fore.GREEN}Added a new card: {new_title} with id: {new_id}{data}{Style.RESET_ALL}')

    if not new_title:
        return f'{Fore.RED}Error: Record has no title.{Style.RESET_ALL}', 400

    # Load data from the specified file
    data = read_data_from_file(file_path)

    for card in data:
        if card['title'] == new_title:
            return f'{Fore.RED}A card with the same title already exists{Style.RESET_ALL}', 400

    new_card = {
        'id': new_id,
        'title': new_title,
        'description': new_description,
        'image': new_image,
        'verified': new_verified,
        'author': new_author,
        'completed': new_completed,
        'link': new_link
    }

    data.append(new_card)
    save_data_to_file(data, file_path)
    return jsonify(new_card)



@app.route('/edit_card/<string:card_id>', methods=['POST'])
def edit_card(card_id):
    if request.content_type != 'application/x-www-form-urlencoded':
        return f'{Fore.RED}Unsupported media type{Style.RESET_ALL}', 415

    # Assuming you are using the request.form to get form data
    new_title = request.form.get('new-title', '')
    new_description = request.form.get('new-description', '')
    new_image = request.form.get('new-image', '')
    new_author = request.form.get('new-author', '')
    new_verified = request.form.get('new-verified', type=bool, default=False)
    new_completed = request.form.get('new-completed', type=bool, default=False)
    new_link = request.form.get('new-link', '')

    data = read_data_from_file(data_file)

    updated = False
    updated_card = None

    for card in data:
        if 'id' in card and card['id'] == card_id:
            card['title'] = new_title
            card['description'] = new_description
            card['image'] = new_image
            card['author'] = new_author
            card['verified'] = new_verified
            card['completed'] = new_completed
            card['link'] = new_link
            updated = True
            updated_card = card
            break

    if updated:
        save_data_to_file(data, data_file)  # Pass the file_path parameter
        print(f'{Fore.GREEN}Картку {new_title}(id: {card_id}) оновлено з даними title: {new_title}, description: {new_description}, image link: {new_image}, author: {new_author}, is verified: {new_verified}, is completed: {new_completed}, link: {new_link}{Style.RESET_ALL}')
        return jsonify(updated_card)  # Return the updated card in the response
    else:
        return f'{Fore.RED}Card not found{Style.RESET_ALL}', 404



if __name__ == '__main__':
    app.run(debug=True)
