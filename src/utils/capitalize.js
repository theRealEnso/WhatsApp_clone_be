export const capitalizeFirstLetterInName = (name) => {
    const namesArray = name.split(" ");
    
    //iterate through the array, and return a new array with each word in the array that has the first letter uppercased
    // but if the word `the` is in the name, then leave it lowercased

    const updatedNames = namesArray.map((name) => {
        if(name.toLowerCase() === "the"){
            return name.toLowerCase();
        } else if (name.toLowerCase() === "bdo"){
            return name.toUpperCase();
        } else {
            return name[0].toUpperCase() + name.substring(1).toLowerCase()
        }
    })

    return updatedNames.join(" ");
};