"use strict";

$(document).ready(function(){
    window.localStorage.setItem("maxId", 0);
    if (window.localStorage.getItem("favDisplay") === null){
        window.localStorage.setItem("favDisplay", 0);
    }

    $("#add-contact-form").hide();
    $("#modal-index").hide();
    if (parseInt(window.localStorage.getItem("favDisplay")) == 0){
        $("#favourites-content").hide();
    }
    $("#search-bar").val("");

    $("#modal-submit-button").hide();
    $("#modal-save-button").hide();

    loadTable();
    loadFavourites();

    $("#toggle").click(function(){
        if ($("#add-contact-form").first().is( ":hidden" )){
            $("#add-contact-form").slideDown("slow", function(){
                $("#fname").focus();
            });
        }
        else {
            $("#add-contact-form").slideUp("slow", function(){});
        }
        
    })

    $("#favourites-display").click(function(){
        if ($("#favourites-content").first().is( ":hidden" )){
            $("#favourites-arrow").addClass("rotate-up");
            $("#favourites-content").slideDown("slow", function(){ });
            window.localStorage.setItem("favDisplay", 1);
        }
        else {
            $("#favourites-arrow").removeClass("rotate-up");
            $("#favourites-arrow").addClass("rotate-down");
            $("#favourites-content").slideUp("slow", function(){});
            window.localStorage.setItem("favDisplay", 0);
        }
    })

    $("#contacts-display").click(function(){
        if ($("#contacts-content").first().is( ":hidden" )){
            $("#contacts-display-arrow").addClass("rotate-up");
            $("#contacts-content").slideDown("slow", function(){ });
        }
        else {
            $("#contacts-display-arrow").removeClass("rotate-up");
            $("#contacts-display-arrow").addClass("rotate-down");
            $("#contacts-content").slideUp("slow", function(){});
        }
    })

    $("#contacts-table").click(function(event){
        const index = event.target.parentElement.rowIndex;
        contactDetails(index, event);
    })

    $("#contact-submit").click(function(event){
        event.preventDefault();
        let canSubmit = validateForm();
        if (canSubmit === true){
            console.log("can submit")
            const _name = $("#fname").val();
            const _surname = $("#lname").val();
            const _phone = $("#phone").val();
            const _email = $("#email").val();
            const _birthdate = $("#birthdate").val();
    
            console.log(_name + " " + _surname + " " + _phone + " " + _email + " " + _birthdate);
    
            const new_contact = {
                id: parseInt(window.localStorage.getItem("maxId")) + 1,
                name: _name,
                surname: _surname,
                phone: _phone.replace(/\s+/g, ''),
                email: _email,
                _birthdate: _birthdate,
                favourite: false
            };
    
            window.localStorage.setItem("maxId", parseInt(window.localStorage.getItem("maxId")) + 1);
            //maxId += 1;
    
            domAddContact(new_contact); 
            $("#add-contact-form").hide();   
        }
        else{
            alert("Nekatera polja imajo neveljavno vrednost! Kontakt ni bil dodan.");
        }
    })

    $(".bin").click(function(event){
        domRemoveContact(this);
    })

    $("#modal-edit-button").click(function(){
        editContact();
    })

    $("#modal-delete-button").click(function(event){
        let index = $("#modal-index").val();
        const del = window.confirm("Ali ste prepričani, da želite izbrisati ta kontakt?");
        if (del == true) {
            removeContact(index);
            const table = document.querySelector("#contacts-table");
            table.deleteRow(index);
            cancel();
        }
        
    })

    $("#modal-x-button").click(function(){
        cancel();
    })

    $("#modal-save-button").click(function(){
        console.log("saving...");
        saveEditContact()
    })
    
    $("#search-bar").bind('input keyup', function(){
        var $this = $(this);
        var delay = 400; // 2 seconds delay after last input
    
        clearTimeout($this.data('timer'));
        $this.data('timer', setTimeout(function(){
            $this.removeData('timer');
            let search_value = $("#search-bar").val();
            loadTable(search_value);
        }, delay));
    });
})

function saveEditContact(){
    let canSubmit = validateModal();
    if (canSubmit === true){
        let _name = $("#modal-name").val();
        let _surname = $("#modal-surname").val();
        let _phone = $("#modal-phone").val();
        let _email = $("#modal-email").val();
        let _birthdate = $("#modal-birthdate").val();
        let _favourite = $("#modal-favourite").prop("checked");

        const string = window.localStorage.getItem("contacts").toString();
        let array = JSON.parse(string);
        let index = $("#modal-index").val();
            
        array[index].name = _name;
        array[index].surname = _surname;
        array[index].phone = _phone;
        array[index].email = _email;
        array[index]._birthdate = _birthdate;
        array[index].favourite = _favourite;
        window.localStorage.setItem("contacts", JSON.stringify(array));
        location.reload();
    }
    else {
        alert("Nekatera polja imajo neveljavno vrednost! Kontakt ni bil dodan.");
    }
}

function cleanTables(){
    $("#contacts-table tr").remove();
    $("#favourites-table tr").remove();
}

function cancel(){
    $("#modal-name").prop("disabled", true);
    $("#modal-surname").prop("disabled", true);
    $("#modal-phone").prop("disabled", true);
    $("#modal-email").prop("disabled", true);
    $("#modal-birthdate").prop("disabled", true);
    $("#modal-favourite").prop("disabled", true);
    $("#id01").hide();
    $("#modal-save-button").hide();
}

function editContact(){
    $("#modal-name").prop("disabled", false);
    $("#modal-surname").prop("disabled", false);
    $("#modal-phone").prop("disabled", false);
    $("#modal-email").prop("disabled", false);
    $("#modal-birthdate").prop("disabled", false);
    $("#modal-favourite").prop("disabled", false);
    $("#modal-save-button").show();
}

function contactDetails(index, event){
    $("#modal-name").prop("disabled", true);
    $("#modal-surname").prop("disabled", true);
    $("#modal-phone").prop("disabled", true);
    $("#modal-email").prop("disabled", true);
    $("#modal-birthdate").prop("disabled", true);
    $("#modal-favourite").prop("disabled", true);

    document.getElementById('id01').style.display='block';
    const string = window.localStorage.getItem("contacts").toString();
    let array = JSON.parse(string);
    console.log(array[index]);

    const contact = array[index];
    $("#modal-index").val(index);
    $("#modal-name").val(contact["name"]);
    $("#modal-surname").val(contact["surname"]);
    $("#modal-phone").val(contact["phone"]);
    $("#modal-email").val(contact["email"]);
    $("#modal-birthdate").val(contact["_birthdate"]);
    $("#modal-favourite").prop("checked", contact["favourite"]);
    $("#modal-img").attr("href", "tel:" + contact["phone"]);
}

function domRemoveContact(element){
    const table = document.querySelector("#contacts-table");
    const index = element.parentElement.rowIndex;
    console.log("brisanje na indexu: " + index);
    if (index >= 0) {
        const del = window.confirm("Are you sure you want to delete " + index);
        if (del == true) {
            table.deleteRow(index);
        }
    }

    removeContact(index);
}

function removeContact(index) {
    const string = window.localStorage.getItem("contacts").toString();
    let array = JSON.parse(string);
    console.log(array[index]);
    
    if (index > -1){
        array.splice(index, 1)
    }

    window.localStorage.setItem("contacts", JSON.stringify(array));
}

function validateForm(){
    const name = $("#fname").val();
    if (name.length == 0){
        return false;
    }

    const surname = $("#lname").val();
    if (surname.length == 0){
        return false;
    }

    const phoneRegex = /^0\d{8}$/;
    const phone = $("#phone").val();
    if ((phone.length < 8) || (!phoneRegex.test(phone)) || phone.isNumerc){
        return false;
    }

    return true;
}

function validateModal(){
    const name = $("#modal-name").val();
    if (name.length == 0){
        return false;
    }

    const surname = $("#modal-surname").val();
    if (surname.length == 0){
        return false;
    }

    const phoneRegex = /^0\d{8}$/;
    const phone = $("#modal-phone").val();
    if ((phone.length < 8) || (!phoneRegex.test(phone)) || phone.isNumerc){
        return false;
    }

    return true;
}

function loadTable(search_value = ""){
    $("#contacts-not-found").hide();
    $("#contacts-content tr").remove();
    if (localStorage.getItem("contacts") === null) {
        //...
    }
    else {
        const string = window.localStorage.getItem("contacts").toString();
        let array = JSON.parse(string);
        let found = 0;
        array.forEach(contact => {
            if ((search_value == "") ||
                (contact["name"].toLowerCase().includes(search_value.toLowerCase())) ||
                (contact["phone"].includes(search_value)) ||
                (contact["surname"].toLowerCase().includes(search_value.toLowerCase()))){
                found += 1;
                const table = document.querySelector("#contacts-table");

                //new row
                const tr = document.createElement("tr");
                table.appendChild(tr);
    
                // add image
                const td_image = document.createElement("td");
                td_image.innerHTML = '<img src="src/icons/img.jpg" height="30" alt="">';
                tr.appendChild(td_image);
    
                //add surname
                const td_name = document.createElement("td");
                td_name.innerText = contact["name"] + " " + contact["surname"];
                td_name.id = "contact-name";
                tr.appendChild(td_name);
    
                //add phone numberyyy
                const td_phone = document.createElement("td");
                td_phone.innerHTML = '<a href="tel:' + contact["phone"] + '">' + contact["phone"] + '</a>';
                td_phone.id = "phone-number";
                tr.appendChild(td_phone);
            }      
        });
        if (found == 0) {
            $("#contacts-not-found").show();
        }
        if (array.length >= 1){
            window.localStorage.setItem("maxId", parseInt(array[array.length - 1].id));
        }
    }
}

function loadFavourites(){
    if (localStorage.getItem("contacts") === null) {
        //...
    }
    else {
        const string = window.localStorage.getItem("contacts").toString();
        let array = JSON.parse(string);
        let count = 0;
        array.forEach(contact => {
            const table = document.querySelector("#favourites-content");
            if (contact["favourite"] == true){
                               
                //new row
                const tr = document.createElement("tr");
                table.appendChild(tr);
    
                // add image
                const td_image = document.createElement("td");
                td_image.innerHTML = '<img src="src/icons/img.jpg" height="30" alt="">';
                tr.appendChild(td_image);
    
                //add surname
                const td_name = document.createElement("td");
                td_name.innerText = contact["name"] + " " + contact["surname"];
                td_name.id = "contact-name";
                tr.appendChild(td_name);
    
                //add phone number
                const td_phone = document.createElement("td");
                td_phone.innerHTML = '<a href="tel:' + contact["phone"] + '">' + contact["phone"] + '</a>';
                td_phone.id = "phone-number";
                tr.appendChild(td_phone);
    
                count += 1;
            }    
        });
        if (count == 0){
            const a = document.createElement("a");
            a.innerText = "Med priljubljenimi kontakti ni nobenih številk";
        }
    }
}

function domAddContact(contact){
    const table = document.querySelector("#contacts-table");
    const tr = document.createElement("tr");
    table.appendChild(tr);

    // add image
    const td_image = document.createElement("td");
    td_image.innerHTML = '<img src="src/icons/img.jpg" height="30" alt="">';
    tr.appendChild(td_image);

    //add surname
    const td_name = document.createElement("td");
    td_name.innerText = contact["name"] + " " + contact["surname"];
    td_name.id = "contact-name";
    tr.appendChild(td_name);

    //add phone number
    const td_phone = document.createElement("td");
    td_phone.innerHTML = '<a href="tel:' + contact["phone"] + '">' + contact["phone"] + '</a>';
    td_phone.id = "phone-number";
    tr.appendChild(td_phone);

    saveContact(contact);
}

function saveContact(contact){
    if (localStorage.getItem("contacts") === null) {
        window.localStorage.setItem("contacts", JSON.stringify([contact]));
    }
    else {
        const string = window.localStorage.getItem("contacts").toString();
        let array = JSON.parse(string);
        array.push(contact);
        window.localStorage.setItem("contacts", JSON.stringify(array));
    }
    loadTable();
}
