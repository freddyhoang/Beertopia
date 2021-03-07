// once page is loaded, initialize and listen to events
document.addEventListener("DOMContentLoaded", () => {
    initialize();
    document.getElementById('Add').addEventListener('click', addCategory);
    document.getElementById('table-body').addEventListener('click', deleteRow);
    document.getElementById('table-body').addEventListener('click', editRow);
    document.getElementById('alert-time').addEventListener('click', removeAlert);
});

var initialize = () => {
    // perform an impossible deletion that allows for initialization of the page :)
    var req = new XMLHttpRequest();

    // row value
    var userEntry = {"category_id": null};

    req.open("delete", "/categories", true);
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

var addCategory = (event) => {
    var req = new XMLHttpRequest();
    var userEntry = {"category": document.getElementById("category").value};
    console.log(userEntry, document.getElementById("category").value);
   
    var keys = Object.keys(userEntry);
    keys.forEach(e => {
        // empty out the input boxes
        if(e !== "units"){
            document.getElementById(e).value = null;
        }
    })

    req.open("post", "/categories", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load',() => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addRow(response)
        } else {
        alert();
        console.log("Error in network request: " + req.statusText);    
        }
    });
    
    req.send(JSON.stringify(userEntry));

    removeAlert();
    // prevent page from reloading
    event.preventDefault();
};

var addRow = (data) => {
    document.getElementById("table-body").innerHTML = null;

    // parse data and iterate
    var parsedData = JSON.parse(data);
    console.log(parsedData);
    parsedData.rows.forEach(e => {
                
        // update this array on each iteration for the below values
        var category = [e.category_name];
        
        // create new Rows within the table body
        var newRow = document.createElement("tr");
        document.getElementById("table-body").appendChild(newRow);

        // create an appropriate amount of columns for my data
        for(var i = 0; i<2; i++){
            var newTd = document.createElement("td");
            if(i==0){
                newTd.innerText = category[i];
                newTd.setAttribute('width', '800px');
            }
            // last column is a special one for forms only
            else if(i==1){
                // this form contains a hidden input, and two buttons
                for(var j = 0; j<3; j++){

                    newInput = document.createElement("input");

                    if(j==0){
                        newInput.setAttribute("type", "hidden");
                        newInput.name = "id";
                        newInput.value = e.category_id;
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
}

var deleteRow = (event) => {
    if(event.target.name === 'Remove') {
        var req = new XMLHttpRequest();
        // row value
        var category_id = event.target.parentElement.children[0].value;
        var userEntry = {"category_id": category_id};

        req.open("delete", "/categories", true);
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

var editRow = (event) => {
    if(event.target.value === 'Edit') {
        event.target.value = 'Done';
        // row value, array to store exercises, rowChange = the target element for the column
        var category_id = event.target.parentElement.children[0].value;
        var items = ['category_name'];
        var rowChange = event.target.parentElement.parentElement;

        // update each row to become a form
        for (var i = 0; i<1; i++){
            // add current value in as a placeholder
            var itemValue = rowChange.children[i].innerText;

            // create forms for each column
            newInput = document.createElement("input");
            newInput.classList.add("form-control");
            newInput.value = itemValue;
            newInput.name = items[i];
            
            if(i==0){
                // for exercise
                newInput.setAttribute("type", "text");
            } 

            // clear out the column and add the forms
            rowChange.children[i].innerText = null;
            rowChange.children[i].appendChild(newInput);
        };
         

        // create an additional event listener to perform the request
        event.target.addEventListener('click', () => {
            if(event.target.value === 'Done'){
                var userEntry = {"category_name": rowChange.children[0].children[0].value,
                    "category_id": category_id
                };

                event.target.value = "Edit";

                var req = new XMLHttpRequest();
                req.open("PUT", "/categories", true);
                req.setRequestHeader('Content-Type', 'application/json');
                req.addEventListener('load',function(){
                    if(req.status >= 200 && req.status < 400){
                        var response = req.responseText;
                        addRow(response);
                        } else {
                        alert();
                        console.log("Error in network request: " + req.statusText);
                    }
                });
                req.send(JSON.stringify(userEntry));   
            }
        });
    }
    event.preventDefault();
}

var alert = (event) => {
    var newAlert = document.createElement('div');
    var alertArea = document.getElementById('alert-time');
    alertArea.innerHTML = '';

    newAlert.innerHTML = "This category already exists! Cannot add an already existing category.";
    newAlert.classList = 'alert alert-danger alert-dismissible fade show';
    newAlert.role = 'alert';

    alertArea.append(newAlert);
}

var removeAlert = (event) => {
    document.getElementById('alert-time').innerHTML = '';
}