from flask import Flask, render_template, request, redirect
import csv
import os

app = Flask(__name__)
CSV_FILE = 'inventory.csv'

# Initialize inventory file if not exists
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'company', 'price', 'quantity'])

def read_inventory():
    with open(CSV_FILE, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

def write_inventory(data):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'company', 'price', 'quantity'])
        writer.writeheader()
        writer.writerows(data)

@app.route('/')
def index():
    inventory = read_inventory()
    return render_template('index.html', inventory=inventory)

@app.route('/add', methods=['POST'])
def add_medicine():
    new_item = {
        'name': request.form['name'],
        'company': request.form['company'],
        'price': request.form['price'],
        'quantity': request.form['quantity']
    }

    inventory = read_inventory()
    inventory.append(new_item)
    write_inventory(inventory)

    return redirect('/')

@app.route('/sell', methods=['POST'])
def sell_medicine():
    name = request.form['name'].lower()
    qty_to_sell = int(request.form['quantity'])

    inventory = read_inventory()
    for item in inventory:
        if item['name'].lower() == name:
            item['quantity'] = str(max(0, int(item['quantity']) - qty_to_sell))
            break

    write_inventory(inventory)
    return redirect('/')

@app.route('/search', methods=['POST'])
def search_medicine():
    name = request.form['name'].lower()
    inventory = read_inventory()
    results = [item for item in inventory if name in item['name'].lower()]
    return render_template('index.html', inventory=results)

if __name__ == '__main__':
    app.run(debug=True)