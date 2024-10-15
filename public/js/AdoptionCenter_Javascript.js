function displayDateTime(){
    let currentDate = new Date(); 
    document.getElementById("currentDateTime").textContent = currentDate.toLocaleString()
}

function validateFindForm(){
    let animalValue = document.querySelector('input[name="animal"]:checked');
    let breedValue = document.forms["FindForm"]["breed"].value;
    let ageValue = document.forms["FindForm"]["age"].value;
    let genderValue = document.querySelector('input[name="gender"]:checked');
    let getsAlongChecked = document.querySelectorAll('input[name="getsAlong[]"]:checked');

    if (!animalValue || breedValue == "" || ageValue == "" || !genderValue || getsAlongChecked.length == 0) {
        alert("Please fill all questions");
        return false;
    }
    return true; 
}

function validateGivePetForm(){
    let animalValue = document.querySelector('input[name="animal"]:checked');
    let breedValue = document.forms["GivePetForm"]["breed"].value;
    let ageValue = document.forms["GivePetForm"]["age"].value;
    let genderValue = document.querySelector('input[name="gender"]:checked');
    let getsAlongAnimalValue = document.querySelectorAll('input[name="getsAlong[]"]:checked');
    let suitableChildrenValue = document.querySelector('input[name="suitableChildren"]:checked');
    let praiseCommentValue = document.forms["GivePetForm"]["praiseComment"].value;
    let ownerFamilyNameValue = document.forms["GivePetForm"]["ownerFamilyName"].value;
    let ownerGivenNameValue = document.forms["GivePetForm"]["ownerGivenName"].value;
    let ownerEmail = document.forms["GivePetForm"]["ownerEmail"].value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!animalValue || breedValue == "" || ageValue == "" || !genderValue || getsAlongAnimalValue.length == 0
        || !suitableChildrenValue || praiseCommentValue == "" || ownerFamilyNameValue=="" || ownerGivenNameValue=="" || ownerEmail==""){
        alert("Please fill all fields");
        return false;
    }
    if (!emailPattern.test(ownerEmail)){
        alert("Please enter a valid email");
        return false;
    }
    return true; 
}

setInterval(displayDateTime, 1000);
displayDateTime(); 
