// once page is loaded, initialize and listen to events
document.addEventListener("DOMContentLoaded", () => {
    initialize();
    document.getElementById('Add').addEventListener('click', addBeer);
    document.getElementById('table-body').addEventListener('click', deleteRow);
    document.getElementById('table-body').addEventListener('click', editRow);
    document.getElementById('breweryDrop').addEventListener('click', breweryChange);
});

var initialize = () => {
    // perform an impossible deletion that allows for initialization of the page :)
    var req = new XMLHttpRequest();
    // row value
    var userEntry = {"beer_id": null, "brewery": 'dddd'};

    req.open("delete", "/beers", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load', () => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addRowDropdown(response)
            } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(userEntry));
}

var addBeer = (event) => {
    var req = new XMLHttpRequest();
    var userEntry = {"beer_name": document.getElementById("beer_name").value,
                    "brewery": document.getElementById("brewery").value,
                    "abv": document.getElementById("abv").value,
                    "ibu": document.getElementById("ibu").value};

   
    var keys = Object.keys(userEntry);
    keys.forEach(e => {
        // empty out the input boxes
        if(e !== "units"){
            document.getElementById(e).value = null;
        }
    })

    req.open("post", "/beers", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load',() => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addRowDropdown(response)
            } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    
    req.send(JSON.stringify(userEntry));

    // prevent page from reloading
    event.preventDefault();
};

var addRowDropdown = (data) => {
    // re-add these values each time for the table
    document.getElementById("table-body").innerHTML = null;

    // parse data and iterate
    var parsedData = JSON.parse(data);
    var breweries = {};
    parsedData.rows.forEach(e => {
                
        // update this array on each iteration for the below values
        var oneBeer = [e.beer_name, e.brewery, e.abv, e.ibu, e.avg_rating];
        breweries[e.brewery]=null;
        
        // create new Rows within the table body
        var newRow = document.createElement("tr");
        document.getElementById("table-body").appendChild(newRow);

        // create an appropriate amount of columns for my data
        for(var i = 0; i<6; i++){
            var newTd = document.createElement("td");
            if(i!=5){
                newTd.innerText = oneBeer[i];
            }
            // last column is a special one for forms only
            else if(i==5){
                // this form contains a hidden input, and two buttons
                for(var j = 0; j<3; j++){

                    newInput = document.createElement("input");

                    if(j==0){
                        newInput.setAttribute("type", "hidden");
                        newInput.name = "id";
                        newInput.value = e.beer_id;
                    } else if (j==1){
                        newInput.setAttribute("type", "submit");
                        newInput.classList.add("btn", "btn-warning");
                        newInput.value = "Edit";
                        newInput.name = "Edit";
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

    // re-add these values to Brewery dropdown
    document.getElementById("breweryDrop").innerHTML = null;
    breweries = Object.keys(breweries);
    
    for(var i = 0; i<breweries.length; i++){
        // Add option to clear filters
        if(i==0){
            var newList = document.createElement("a");
            newList.classList.add("dropdown-item");
            newList.innerHTML = 'View All';
            document.getElementById("breweryDrop").appendChild(newList);
        }
        // Add option for each brewery
        var newList = document.createElement("a");
        newList.classList.add("dropdown-item");
        newList.innerHTML = breweries[i];
        document.getElementById("breweryDrop").appendChild(newList);
        
    };
        
};

var deleteRow = (event) => {
    if(event.target.name === 'Remove') {
        var req = new XMLHttpRequest();
        // row value
        var beer_id = event.target.parentElement.children[0].value;
        var userEntry = {"beer_id": beer_id};

        req.open("delete", "/beers", true);
        req.setRequestHeader('Content-Type', 'application/json');

        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400){
                var response = req.responseText;
                addRowDropdown(response)
                } else {
                console.log("Error in network request: " + req.statusText);
            }
        });
        
        req.send(JSON.stringify(userEntry));
    }
    
    event.preventDefault();
}

var editRow = (event) => {
    if(event.target.value === 'Edit') {
        event.target.value = 'Done';
        // row value, array to store exercises, rowChange = the target element for the column
        var beer_id = event.target.parentElement.children[0].value;
        var items = ['beer_name', 'brewery', 'abv', 'ibu'];
        var rowChange = event.target.parentElement.parentElement;

        // update each row to become a form
        for (var i = 0; i<4; i++){
            // add current value in as a placeholder
            var itemValue = rowChange.children[i].innerText;

            // create forms for each column
            newInput = document.createElement("input");
            newInput.classList.add("form-control");
            newInput.value = itemValue;
            newInput.name = items[i];
            
            if(i==0 || i==1){
                // for exercise
                newInput.setAttribute("type", "text");
            } else{
                // just numbers input type
                newInput.setAttribute("type", "number");
                newInput.setAttribute("min", 0);
                if(i==2){
                    newInput.setAttribute("step", 0.01);
                };
            }

            // clear out the column and add the forms
            rowChange.children[i].innerText = null;
            rowChange.children[i].appendChild(newInput);
        };
         

        // create an additional event listener to perform the request
        event.target.addEventListener('click', () => {
            if(event.target.value === 'Done'){
                var userEntry = {"beer_name": rowChange.children[0].children[0].value,
                    "brewery": rowChange.children[1].children[0].value,
                    "abv": rowChange.children[2].children[0].value,
                    "ibu": rowChange.children[3].children[0].value,
                    "beer_id": beer_id
                };

                event.target.value = "Edit";

                var req = new XMLHttpRequest();
                req.open("PUT", "/beers", true);
                req.setRequestHeader('Content-Type', 'application/json');
                req.addEventListener('load',function(){
                    if(req.status >= 200 && req.status < 400){
                        var response = req.responseText;
                        addRowDropdown(response);
                        } else {
                        console.log("Error in network request: " + req.statusText);
                    }
                });
                req.send(JSON.stringify(userEntry));   
            }
        });
        
        

    }
    event.preventDefault();
}

var breweryChange = (event) => {
    console.log(event.target.innerHTML);
}