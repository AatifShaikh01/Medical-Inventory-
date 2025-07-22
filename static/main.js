const firebaseConfig = {
  apiKey: "AIzaSyBVMuiXcAk2ogPLA1Unz-XfT_jdAdqlqRc",
  authDomain: "medical-79d1f.firebaseapp.com",
  projectId: "medical-79d1f",
  storageBucket: "medical-79d1f.appspot.com",
  messagingSenderId: "181138991667",
  appId: "1:181138991667:web:a66172185ce1ac26139146",
  measurementId: "G-JEBM3X49RN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const inventoryCollection = db.collection('inventory');

// Function to sync inventory to Firestore
async function syncInventoryToFirestore(inventory) {
    try {
        const batch = db.batch();
        const snapshot = await inventoryCollection.get();
        snapshot.forEach(doc => batch.delete(doc.ref)); // Clear existing data
        inventory.forEach(item => {
            const docRef = inventoryCollection.doc();
            batch.set(docRef, {
                name: item.name,
                company: item.company,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity)
            });
        });
        await batch.commit();
    } catch (error) {
        console.error("Error syncing to Firestore:", error);
    }
}

// Function to load inventory from Firestore
async function loadInventoryFromFirestore() {
    try {
        const snapshot = await inventoryCollection.get();
        const inventory = [];
        snapshot.forEach(doc => {
            inventory.push(doc.data());
        });
        renderInventory(inventory);
        return inventory;
    } catch (error) {
        console.error("Error loading from Firestore:", error);
        return [];
    }
}

// Function to render inventory in the table
function renderInventory(inventory) {
    const tableBody = document.getElementById('inventory-table');
    tableBody.innerHTML = '';
    inventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border border-gray-300 p-2">${item.name}</td>
            <td class="border border-gray-300 p-2">${item.company}</td>
            <td class="border border-gray-300 p-2">${item.price}</td>
            <td class="border border-gray-300 p-2">${item.quantity}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle form submissions
document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newItem = {
        name: e.target.name.value,
        company: e.target.company.value,
        price: e.target.price.value,
        quantity: e.target.quantity.value
    };
    const response = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(newItem).toString()
    });
    if (response.ok) {
        const inventory = await loadInventoryFromFirestore();
        syncInventoryToFirestore(inventory);
    }
});

document.getElementById('sell-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sellData = {
        name: e.target.name.value,
        quantity: e.target.quantity.value
    };
    const response = await fetch('/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(sellData).toString()
    });
    if (response.ok) {
        const inventory = await loadInventoryFromFirestore();
        syncInventoryToFirestore(inventory);
    }
});

document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchData = {
        name: e.target.name.value
    };
    const response = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(searchData).toString()
    });
    if (response.ok) {
        const inventory = await loadInventoryFromFirestore();
        renderInventory(inventory.filter(item => searchData.name.toLowerCase() in item.name.toLowerCase()));
    }
});

// Initial load
loadInventoryFromFirestore();