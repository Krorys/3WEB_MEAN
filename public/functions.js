function logInLoggedUserAnimation() {
    
    //guestForm.innerHTML = ""; //Empty login form
    loggedUsersList.style.display = 'initial';
    chat.style.display = 'initial';

    setTimeout(function() {
        loggedUsersList.style.opacity = '1';
        chat.style.opacity = '1';
        messageInput.focus();
        
    }, 500);
    
    document.getElementById('fromUser').innerText = '@'+loggedUsername;
}

function logInNewUserAnimation() {
    
    guestForm.style.opacity = '0';
    loggedUsersList.style.opacity = '1';
    chat.style.opacity = '1';
    setTimeout(function() {
        guestForm.style.display = 'none';
        //guestForm.innerHTML = ""; //Empty login form
        chat.style.display = 'initial';
        loggedUsersList.style.display = 'initial';
        messageInput.focus();
    }, 500);
    
    document.getElementById('fromUser').innerText = '@'+loggedUsername;
}

function firstLogAnimation() {
    
    guestForm.style.display = 'block';
    
    setTimeout(function() {
        guestForm.style.opacity = '1';
    }, 500);
}

function checkAlreadyLogged() {
    if(localStorage.getItem('username') != undefined) {
        socket.emit('logIn', localStorage.getItem('username'));
        isAlreadyLogged = true;
    }
    else {
        firstLogAnimation();
        isAlreadyLogged = false;
    }
}

//Never used
// function scrollToBottom() {
//     lastElementTop = document.querySelector('#chatContainer div:last-child').offsetTop;
//     // scrollAmount = lastElementTop - 200 ;
//     chatContainer.animate({scrollTop: lastElementTop * 10}, 0);
// }