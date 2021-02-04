// once page is loaded, initialize and listen to events
document.addEventListener("DOMContentLoaded", () => {
    initialize();
    initializeDropdowns('category', '/categories');
    initializeDropdowns('beer', '/beers');
    document.getElementById('Add').addEventListener('click', addBeerCategory);
    document.getElementById('table-body').addEventListener('click', deleteRow);
    document.getElementById('table-body').addEventListener('click', editRow);
    document.getElementById('beerDrop').addEventListener('click', change);
    document.getElementById('categoryDrop').addEventListener('click', change);
});

var initialize = () => {
    // perform an impossible deletion that allows for initialization of the page :)
    var req = new XMLHttpRequest();

    // row value
    var userEntry = {"category_id": null};

    req.open("delete", "/beer_categories", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load', () => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addRow(response)
            } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(userEntry));
}

var initializeDropdowns = (item, server) => {
    // perform an impossible deletion that allows for initialization of the page :)
    var req = new XMLHttpRequest();

    // row value
    var id = String(item) + "_id";
        userEntry = {id: null};
    ;

    req.open("delete", server, true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load', () => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addDropdown(response, item)
            } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(userEntry));
}

var addBeerCategory = (event) => {
    var req = new XMLHttpRequest();
    var userEntry = {"beer_id": document.getElementById("beerName").value, 
                    "category_id": document.getElementById("categoryName").value};

    document.getElementById("categorydropdown").innerHTML = 'Categories';
    document.getElementById("beerdropdown").innerHTML = 'Beers';
    console.log(userEntry);

    req.open("post", "/beer_categories", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load',() => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addRow(response)
            } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    
    req.send(JSON.stringify(userEntry));

    // prevent page from reloading
    event.preventDefault();
};

var addDropdown = (data, item) => {
    // re-add these values each time for the table
    var drop = String(item) + "Drop";
    document.getElementById(drop).innerHTML = null;

    newInput = document.createElement("option");
    newInput.style.display = "none";
    newInput.id = String(item) + "Name";
    document.getElementById(drop).appendChild(newInput);

    // parse data and iterate
    var parsedData = JSON.parse(data);
    parsedData.rows.forEach(e => {
        // add arr type into dictionary
        if(item=='beer'){
            var arr = [e.beer_name, e.beer_id];
        } else {
            var arr= [e.category_name, e.category_id];
        }

        // Add option for each category
        var newList = document.createElement("option");
        newList.classList.add("dropdown-item");
        newList.innerHTML = arr[0];
        newList.value = arr[1];
        document.getElementById(drop).appendChild(newList); 
    });
};

var addRow = (data) => {
    document.getElementById("table-body").innerHTML = null;

    // parse data and iterate
    var parsedData = JSON.parse(data);

    parsedData.rows.forEach(e => {
        // update this array on each iteration for the below values
        var category = [e.category_name, e.beer_name];
        
        // create new Rows within the table body
        var newRow = document.createElement("tr");
        document.getElementById("table-body").appendChild(newRow);

        // create an appropriate amount of columns for my data
        for(var i = 0; i<3; i++){
            var newTd = document.createElement("td");
            if(i!=2){
                newTd.innerText = category[i];
                newTd.setAttribute("width", "400px");
            }
            // last column is a special one for forms only
            else if(i==2){
                // this form contains a hidden input, and two buttons
                for(var j = 0; j<3; j++){

                    newInput = document.createElement("input");

                    if(j==0){
                        newInput.setAttribute("type", "hidden");
                        newInput.name = "category_id";
                        newInput.value = e.category_id;
                    } else if (j==1){
                        newInput.setAttribute("type", "hidden");
                        newInput.name = "beer_id";
                        newInput.value = e.beer_id;
                    } else {
                        newInput.setAttribute("type", "submit");
                        newInput.classList.add("btn", "btn-danger");
                        newInput.value = "Delete";
                        newInput.name = "Remove";
                    }

                    newTd.appendChild(newInput);
                }
            } 
            newRow.appendChild(newTd);
        };
    });
}

var deleteRow = (event) => {
    if(event.target.name === 'Remove') {
        var req = new XMLHttpRequest();
        // row value
        var category_id = event.target.parentElement.children[0].value;
        var beer_id = event.target.parentElement.children[1].value;
        var userEntry = {"category_id": category_id, "beer_id": beer_id};

        req.open("delete", "/beer_categories", true);
        req.setRequestHeader('Content-Type', 'application/json');

        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400){
                var response = req.responseText;
                addRow(response)
                } else {
                console.log("Error in network request: " + req.statusText);
            }
        });
        
        req.send(JSON.stringify(userEntry));
    }
    
    event.preventDefault();
}

var change = (event) => {
    // update hidden button value + the text of the dropdown menu
    if (event.target.parentElement.id == 'categoryDrop'){
        document.getElementById("categoryName").value = event.target.value;
        document.getElementById("categorydropdown").innerHTML = event.target.innerHTML;
    } else {
        document.getElementById("beerName").value = event.target.value;
        document.getElementById("beerdropdown").innerHTML = event.target.innerHTML;
    }
}