import data from "../books.json" with { type: "json" };

document.addEventListener('DOMContentLoaded', function () {
    const productsContainer = document.getElementById('products-container');
    const addBookButton = document.getElementById('addBook'); // הפניית הכפתור מה-HTML
    initialBooks();

    let sortOrder = {
        id: 'none',
        title: 'none',
        price: 'none',
        rate: 'none'
    };

    addBookButton.addEventListener('click', function () {
        showEditForm();
    });

    function getSortArrow(field) {
        if (sortOrder[field] === 'asc') {
            return ' ↑';
        } else if (sortOrder[field] === 'desc') {
            return ' ↓';
        } else {
            return '';
        }
    }

    function renderBooks() {
        const books = getAllBooks();
        productsContainer.innerHTML = '';
        productsContainer.appendChild(addBookButton);
    
        // יצירת כותרות הטבלה עם Bootstrap
        const table = document.createElement('table');
        table.classList.add('table', 'table-striped', 'table-responsive');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th scope="col" id="id-header" class="sortable">אינדקס ${getSortArrow('id')}</th>
                <th scope="col" id="title-header" class="sortable">כותרת ${getSortArrow('title')}</th>
                <th scope="col" id="price-header" class="sortable">מחיר ${getSortArrow('price')}</th>
                <th scope="col" id="rate-header" class="sortable">דירוג ${getSortArrow('rate')}</th>
                <th scope="col"></th>
            </tr>
        `;
        table.appendChild(thead);
    
        const tbody = document.createElement('tbody');
        
        books.forEach(book => {
            const bookRow = document.createElement('tr');
            bookRow.innerHTML = `
                <td class="book-id">${book.id}</td>
                <td class="book-title">${book.title}</td>
                <td class="book-price">$${book.price}</td>
                <td class="book-rate">${book.rate}</td>
                <td>
                    <button class="btn btn-primary read-book" data-id="${book.id}">צפיה</button>
                    <button class="btn btn-warning edit-book" data-id="${book.id}">ערוך</button>
                    <button class="btn btn-danger remove-book" data-id="${book.id}">מחק</button>
                </td>
            `;
            tbody.appendChild(bookRow);
        });
    
        table.appendChild(tbody);
        productsContainer.appendChild(table);
    
        // הוספת מאזינים לכפתורי הפעולות
        document.querySelectorAll('.remove-book').forEach(button => {
            button.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                removeBook(id);
            });
        });
    
        document.querySelectorAll('.edit-book').forEach(button => {
            button.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const book = getById(id);
                showEditForm(book);
                console.log(book);

            });
        });
        document.querySelectorAll('.read-book').forEach(button => {
            button.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const book = getById(id)
                showEditForm(book,true)
            })
        })

        document.getElementById('id-header').addEventListener('click', () => sortBooks('id'));
        document.getElementById('title-header').addEventListener('click', () => sortBooks('title'));
        document.getElementById('price-header').addEventListener('click', () => sortBooks('price'));
        document.getElementById('rate-header').addEventListener('click', () => sortBooks('rate'));
    }

    function showEditForm(book = null, isReadOnly = false) {
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        document.body.appendChild(overlay);
    
        const editForm = document.createElement('div');
        let newId;
        if (book) {
            newId = book.id;
        } else {
            const books = getAllBooks();
            newId = books.length ? books[books.length - 1].id + 1 : 1;
        }
    
        // יצירת HTML עבור טופס העריכה/קריאה
        editForm.innerHTML = `
            <div class="form-header">
                <img src="${book ? book.coverImageUrl : ''}" alt="${book ? book.title : ''}" class="book-image">
                <h2 class="form-title">${book ? (isReadOnly ? `${book.title}` : 'ערוך ספר') : 'הוסף ספר חדש'}</h2>
            </div>

            <div class="form-field ${isReadOnly ? 'readonly' : ''}">
                <label for="edit-title">:שם</label>
                <input type="text" id="edit-title" value="${book ? book.title : ''}" required ${isReadOnly ? 'readonly' : ''}>
            </div>
            <div class="form-field ${isReadOnly ? 'readonly' : ''}">
                <label for="edit-img">:(url) תמונה</label>
                <input type="text" id="edit-img" value="${book ? book.coverImageUrl : ''}" required ${isReadOnly ? 'readonly' : ''}>
            </div>  
            <div class="form-field price-rate-field">  
                <div class="form-field">
                    <label for="edit-rate">:דירוג</label>
                    <input type="range" id="edit-rate" value="${book ? book.rate : '0'}" step="0.1" min="0" max="5" ${isReadOnly ? '' : 'required'}>
                    <span id="rate-value">${book ? book.rate : '0'}</span>
                </div>        
                <div class="form-field ${isReadOnly ? 'readonly' : ''}">
                    <label for="edit-price">:מחיר</label>
                    <input type="number" id="edit-price" value="${book ? book.price : ''}" required ${isReadOnly ? 'readonly' : ''}>
                </div>
            </div>
            <button id="save-book">${isReadOnly ? 'שמור דירוג' : book ? 'שמור' : 'צור'}</button>
            <button id="cancel-edit">ביטול</button>
        `;
    //לדעתי לא נדרש - הוספת תגית האינדקס לטופס
    //     <div class="form-field ${isReadOnly ? 'readonly' : ''}">
    //     <label for="edit-id">:מספר בקטלוג</label>
    //     <input type="number" id="edit-id" value="${newId}" required readonly>
    //     </div>
    
        if (document.getElementById('edit-form')) {
            document.body.removeChild(document.getElementById('edit-form'));
        }
    
        editForm.id = 'edit-form';
        document.body.appendChild(editForm);
        const rateInput = document.getElementById('edit-rate');
        const rateValueDisplay = document.getElementById('rate-value');
        // הצגת הדירוג הנוכחי
        rateValueDisplay.textContent = rateInput.value;
        // עדכון התצוגה כשיש שינוי בדירוג
        rateInput.addEventListener('input', function () {
            rateValueDisplay.textContent = this.value;
        });
    
        document.getElementById('save-book').addEventListener('click', function () {
            if (isReadOnly) {
                // עדכון הדירוג בלבד במקרה של תצוגת קריאה
                book.rate = parseFloat(rateInput.value);
                updateBook(book);
            } else {
                handleSave(book);
            }
            closeEditForm(); 
            renderBooks();   
        });
    
        document.getElementById('cancel-edit').addEventListener('click', closeEditForm);
        overlay.addEventListener('click', closeEditForm);
    }
    
    function handleSave(book) {
        const updatedBook = {
            id: book ? book.id : null,
            title: document.getElementById('edit-title').value,
            coverImageUrl: document.getElementById('edit-img').value,
            price: parseFloat(document.getElementById('edit-price').value),
            rate: parseFloat(document.getElementById('edit-rate').value)
        };
    
        if (book) {
            updateBook(updatedBook);
        } else {
            createBook(updatedBook);
        }
    
        closeEditForm();
        renderBooks();
    }
    
    function closeEditForm() {
        const editForm = document.getElementById('edit-form');
        const overlay = document.getElementById('overlay');
    
        if (editForm) {
            document.body.removeChild(editForm);
        }
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }
    
    function saveBooksToLocalStorage(books) {
        localStorage.setItem('books', JSON.stringify(books));
    }
    
    function initialBooks() {
        if (!localStorage.getItem('books')) {
            saveBooksToLocalStorage(data.books);
        }
    }

    function getAllBooks() {
        const books = localStorage.getItem('books');
        return books ? JSON.parse(books) : [];
    }

    function getById(id) {
        const allBooks = getAllBooks();
        return allBooks.find(book => book.id === id);
    }

    function removeBook(id) {
        const allBooks = getAllBooks();
        const updatedArrayBooks = allBooks.filter(book => book.id !== id);
        saveBooksToLocalStorage(updatedArrayBooks);
        renderBooks();
    }

    function createBook(newBook) {
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = ''; // ניקוי הודעות קודמות
        if (!isBookValid(newBook)) {
            errorMessageElement.textContent = 'שגיאה: כל השדות חייבים להיות מלאים ותקינים.';
            console.error('Invalid book data. Please fill all fields correctly.');
            return;  
        }
        const books = getAllBooks();
        newBook.id = books.length ? books[books.length - 1].id + 1 : 1;
        books.push(newBook);
        saveBooksToLocalStorage(books);
        renderBooks();
    }
    function updateBook(updatedBook) {
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = ''; // ניקוי הודעות קודמות
        if (!isBookValid(updatedBook)) {
            errorMessageElement.textContent = 'שגיאה: כל השדות חייבים להיות מלאים ותקינים.';
            console.error('Invalid book data. Please fill all fields correctly.');
            return;  
        }
        let books = getAllBooks();
        const index = books.findIndex(book => book.id === updatedBook.id);

        if (index !== -1) {
            books[index] = updatedBook;
            saveBooksToLocalStorage(books);
        }
    }

    function isBookValid(book) {
        return book.title.trim() !== '' && 
               book.price > 0 && 
               book.coverImageUrl.trim() !== '' 
    }

    function sortBooks(field) {
        const direction = sortOrder[field] === 'asc' ? 'desc' : 'asc';
        sortOrder[field] = direction;

        const books = getAllBooks();
        books.sort((a, b) => {
            if (field === 'title') {
                return direction === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            } else if (field === 'id') {
                return direction === 'asc' ? a.id - b.id : b.id - a.id;
            } else if (field === 'price') {
                return direction === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (field === 'rate') {
                return direction === 'asc' ? a.rate - b.rate : b.rate - a.rate;
            }

        });

        saveBooksToLocalStorage(books); 
        renderBooks();
    }

    createBook({
        "title": "1984",
        "price": 39.99,
        "coverImageUrl": "https://upload.wikimedia.org/wikipedia/en/c/c3/1984first.jpg",
        "rate": 4.7
    });

    console.log(getAllBooks());
});




