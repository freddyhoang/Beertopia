// once page is loaded, initialize and listen to events
document.addEventListener("DOMContentLoaded", () => {
    initialize();
    document.getElementById('Add').addEventListener('click', addSet);
    document.getElementById('table-body').addEventListener('click', deleteRow);
    document.getElementById('table-body').addEventListener('click', editRow);
    document.getElementById('alert-time').addEventListener('click', removeAlert);
    document.getElementById('ClearAll').addEventListener('click', clearAll);
});

var initialize = () => {
    // perform an impossible deletion that allows for initialization of the page :)
    var req = new XMLHttpRequest();
    // row value
    var userEntry = {"rowId": null};

    req.open("delete", "/", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load', () => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addRows(response)
            } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(userEntry));
}

var addSet = (event) => {
    var req = new XMLHttpRequest();
    var userEntry = {"exercise": document.getElementById("exercise").value,
                    "reps": document.getElementById("reps").value,
                    "weight": document.getElementById("weight").value,
                    "units": document.getElementById("units").value,
                    "date": document.getElementById("date").value};

    // if any of the below values are null - set an Alert
    if(!userEntry.exercise || !userEntry.units || !userEntry.date) {
        document.getElementById('alert-time').innerText = "You must enter an exercise, weight, and date, at the minimum!";
        document.getElementById('alert-time').classList.add("alert","alert-danger");
        return;
    } else {
        removeAlert();
    }

    var keys = Object.keys(userEntry);
    keys.forEach(e => {
        // update values to be null if not entered
        if(userEntry[e] !== null && userEntry[e] === ""){
            userEntry[e] = null;
        }
        // empty out the input boxes
        if(e !== "units"){
            document.getElementById(e).value = null;
        }
    })

    req.open("post", "/", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load',() => {
        if(req.status >= 200 && req.status < 400){
            var response = req.responseText;
            addRows(response)
            } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    
    req.send(JSON.stringify(userEntry));

    // prevent page from reloading
    event.preventDefault();
};

var addRows = (data) => {
    // re-add these values each time
    document.getElementById("table-body").innerHTML = null;

    // parse data and iterate
    var parsedData = JSON.parse(data);

    // holds set # 
    var idNum = 0;
    parsedData.rows.forEach(e => {
        // if date is null, set it to null, otherwise, set it to split
        if(e.date === null){
            date = null;
        } else {
            date = (e.date).split('T')[0];
        }
        
        // update this array on each iteration for the below values
        var oneSet = [e.id, e.exercise, e.reps, e.weight, e.units, date];
        
        // create new Rows within the table body
        var newRow = document.createElement("tr");
        document.getElementById("table-body").appendChild(newRow);
        
        // set # increase
        idNum++;

        // create an appropriate amount of columns for my data
        for(var i = 0; i<7; i++){
            var newTd = document.createElement("td");
            if(i==0){
                newTd.innerText = idNum;
            }
            // last column is a special one for forms only
            else if(i==6){
                // this form contains a hidden input, and two buttons
                for(var j = 0; j<3; j++){

                    newInput = document.createElement("input");

                    if(j==0){
                        newInput.setAttribute("type", "hidden");
                        newInput.name = "id";
                        newInput.value = e.id;
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
            } else {
                newTd.innerText = oneSet[i];
            }
            newRow.appendChild(newTd);
        };
    });

    
};

var deleteRow = (event) => {
    if(event.target.name === 'Remove') {
        var req = new XMLHttpRequest();
        // row value
        var rowId = event.target.parentElement.children[0].value;
        var userEntry = {"rowId": rowId};

        req.open("delete", "/", true);
        req.setRequestHeader('Content-Type', 'application/json');

        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400){
                var response = req.responseText;
                addRows(response)
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
        var rowId = event.target.parentElement.children[0].value;
        var items = ['', 'exercise', 'reps', 'weight', 'units', 'date'];
        var rowChange = event.target.parentElement.parentElement;

        // update each row to become a form
        for (var i = 1; i<6; i++){
            // add current value in as a placeholder
            var itemValue = rowChange.children[i].innerText;

            // create forms for each column
            newInput = document.createElement("input");
            newInput.classList.add("form-control");
            newInput.value = itemValue;
            newInput.name = items[i];
            
            if(i==1){
                // for exercise
                newInput.setAttribute("type", "text");
            } else if (i == 4) {
                // special drop-down for units
                newInput = document.createElement("select");
                newInput.classList.add("form-control");
                var options = ["Lbs", "Kg"];
                
                // creating options for the drop-down
                for(var j = 0; j<2; j++){
                    newOption = document.createElement("option");
                    newOption.innerText = options[j];
                    newOption.value = options[j];
                  
                    if(newOption.innerText == itemValue){
                        newOption.selected = true;
                    }
                    newInput.appendChild(newOption);
                }
            } else if (i == 5) {
                // for date
                newInput.setAttribute("type", "date");
            } else {
                // just numbers input type
                newInput.setAttribute("type", "number");
            }

            // clear out the column and add the forms
            rowChange.children[i].innerText = null;
            rowChange.children[i].appendChild(newInput);
        };
        

        // create an additional event listener to perform the request
        event.target.addEventListener('click', () => {
            if(event.target.value === 'Done'){
                var userEntry = {"exercise": rowChange.children[1].children[0].value,
                    "reps": rowChange.children[2].children[0].value,
                    "weight": rowChange.children[3].children[0].value,
                    "units": rowChange.children[4].children[0].value,
                    "date": rowChange.children[5].children[0].value, 
                    "rowId": rowId};

                event.target.value = "Edit";

                var req = new XMLHttpRequest();
                req.open("PUT", "/", true);
                req.setRequestHeader('Content-Type', 'application/json');
                req.addEventListener('load',function(){
                    if(req.status >= 200 && req.status < 400){
                        var response = req.responseText;
                        addRows(response);
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

var removeAlert = () => {
    document.getElementById('alert-time').classList.remove("alert","alert-danger");
    document.getElementById('alert-time').innerText = null;
}

var clearAll = (event) => {
    // trigger click events on each delete button in the table
    var rows = document.getElementById("table-body").children;

    for(var i = 0; i<rows.length; i++){
        rows[i].children[6].children[2].click();
    }

    event.preventDefault();
}