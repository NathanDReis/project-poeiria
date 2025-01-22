const $box = document.querySelector("#cards");
const $author = document.querySelector("#author");
const $search = document.querySelector("#search");
const vazio = /^\s*$/; 
let registers = [];
let filterSaved;

(() => {
    const isAndroid = new URLSearchParams(location.search).get('android');
    if(isAndroid) {
        localStorage.setItem("isAndroid","true");
        const $boxHeader = document.querySelector("header .box");
        $boxHeader.classList.add("padding");
    }
})()

async function getAll() {
    try {
        isLoading.true();
        localStorage.removeItem("register");

        registers = await Poeiria.getAll();
        poeiria(registers);
        author(registers);
        
        // Filter
        filterSaved = JSON.parse(localStorage.getItem("filter"));
        if(filterSaved && (!vazio.test(filterSaved.search) || !vazio.test(filterSaved.author))) {
            $search.value = filterSaved.search;
            $author.value = filterSaved.author;
            search($search);
        } 
    }
    catch (error) {
        console.error(error);
        openDialog.alert(error);
    }
    finally{isLoading.false()}
}

function poeiria(data) {
    if(data) {
        $box.innerHTML = '';
    
        data.map((poeiria) => {
            const card = document.createElement("div");
            card.classList.add("card");
            const img = document.createElement("div");
            img.classList.add("img");
            img.style = poeiria.url ? `--url: url(${poeiria.url})` : '--url: url(../../assets/book.webp)';
            const h1 = document.createElement("h1");
            h1.innerHTML = poeiria.title;
            
            card.onclick = () => {
                localStorage.setItem("register", JSON.stringify(poeiria));
                location = `../read/index.html?doc=${poeiria.uid}`;
            }
    
            card.appendChild(img);
            card.appendChild(h1);
            $box.appendChild(card);
        });
    }
}

function author(data) {
    const authors = new Set([...data.map((d) => d.author)]);
    const authorsOrder = [...authors].sort((a,b) => a > b ? 1 : -1 );
    const $select = document.querySelector("#author");
    authorsOrder.forEach((author) => {
        const option = document.createElement("option");
        option.value = author;
        option.innerHTML = author;
        $select.appendChild(option);
    })
}

const $self = document.querySelector("#self");
const search = (element) => {
    const value = element.value;
    const regex = new RegExp(value, 'i');

    const $author = document.querySelector("#author");
    const regexA = new RegExp($author.value, 'i');

    vazio.test($author.value) 
        ?poeiria(vazio.test(value) ? registers : registers.filter((register) => (regex.test(register.title) || regex.test(register.lines.join(" ")))))
        :poeiria(vazio.test(value) ? searchAuthor($author) : registers.filter((register) => 
            (regex.test(register.title) || regex.test(register.lines.join(" "))) && regexA.test(register.author)));
    localStorage.setItem("filter", JSON.stringify({search: value, author: $author.value}));
    $self.checked = false;
}

const searchAuthor = (element) => {
    const value = element.value;
    const regex = {
        test: (valueTest) => {
            return value === valueTest;
        }
    };    
    
    const regexS = new RegExp($search.value, 'i');
    
    vazio.test($search.value) 
    ?poeiria(vazio.test(value) ? registers : registers.filter((register) => regex.test(register.author)))
    :poeiria(vazio.test(value) ? search($search) : registers.filter((register) => 
        (regexS.test(register.title) || regexS.test(register.lines.join(" "))) && regex.test(register.author)));
    localStorage.setItem("filter", JSON.stringify({search: $search.value, author: value}));
    $self.checked = false;
}

const searchSelf = async (element) => {
    try {
        isLoading.true();
        console.log(element.checked)
        if(element.checked) {
            const value = await Poeiria.getMyUID();
            const regex = {test: (valueTest) => value === valueTest};    
            
            $search.value = "";
            $author.value = "";
                
            poeiria(vazio.test(value) ? registers : registers.filter((register) => regex.test(register.createdBy)))
        }
        else {
            // Filter
            filterSaved = JSON.parse(localStorage.getItem("filter"));
            if(filterSaved && (!vazio.test(filterSaved.search) || !vazio.test(filterSaved.author))) {
                $search.value = filterSaved.search;
                $author.value = filterSaved.author;
                search($search);
            } 
            else {
                poeiria(registers);
            }
        }
    }
    catch (error) {
        openDialog.alert("Erro na pesquisa","Tente novamente mais tarde");
    }
    finally{isLoading.false()}
}