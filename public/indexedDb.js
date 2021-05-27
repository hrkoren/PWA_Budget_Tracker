const request = window.indexedDB.open('budget', 1);
let db;
//create new records
request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onerror = function (e) {
    console.log("There was an error");
};
//on successful reqeuest, if online check the db for cached transactions
request.onsuccess = function (e) {
    db = e.target.result;
    if (navigator.onLine) {
        checkDb();
    }
};
//check for cached transactions
function checkDb() {
    let tx = db.transaction('pending', 'readwrite');
    let store = tx.objectStore('pending');
    let getAll = store.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (res) {
                    return res.json();
                })
                .then(function (data) {
                    let transaction = db.transaction('pending', 'readwrite');
                    let storedb = transaction.objectStore('pending');
                    storedb.clear();
                })
        }
    }
}
//save cached transactions to db
function saveRecord(record) {
    let transaction = db.transaction('pending', 'readwrite');
    let storedb = transaction.objectStore('pending');
    storedb.add(record);
}

window.addEventListener('online', checkDb);