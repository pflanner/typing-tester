const modal = document.getElementById("stats-modal");
const modalText = document.getElementById("modal-text");
const closeX = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
function displayModal(text) {
    modal.style.display = "block";
}

function addLineToModal(text) {
    let paragraph = document.createElement("p");
    let textNode = document.createTextNode(text);

    paragraph.appendChild(textNode);
    modalText.appendChild(paragraph);
}

function clearModal() {
    while (modalText.lastChild) {
        modalText.removeChild(modalText.lastChild);
    }
}

function closeModal() {
    clearModal();
    modal.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
closeX.onclick = function() {
    closeModal();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}