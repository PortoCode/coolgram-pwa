var appInstaller;
var btnInstallation = document.getElementById("btn-installation");
var syncToast = document.getElementById('syncToast');
var btnClose = document.getElementById('btnClose');
var btnCamera = document.getElementById('btnCamera');
var form = document.getElementById('form');
var btnNotification = document.getElementById('btn-notification');
var API_URL = 'http://localhost:3000/posts';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
        .then(function () {
            console.log('Service Worker Registered');
        });
}

// Declaração do appInstaller para uso na aplicação
window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    appInstaller = event;
    return false;
});

// Evento para disparar requisição de permissão para notificações
btnInstallation.addEventListener("click", function (e) {
    e.preventDefault();

    if (appInstaller) {
        appInstaller.prompt();

        appInstaller.userChoice.then(function (choiceResult) {
            if (choiceResult.outcome === "dismissed") {
                console.log("User canceled installation");
            } else {
                console.log("User added to home screen");
            }
        });

        appInstaller = null;
    }
});

function renderPost(title, content) {
    var cardWrapper = document.createElement('div');
    cardWrapper.classList.add('col');
    cardWrapper.classList.add('card-wrapper');

    var cardEl = document.createElement('div');
    cardEl.classList.add('card');

    var cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    var cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.innerHTML = title;

    var cardContent = document.createElement('p');
    cardContent.classList.add('card-text');
    cardContent.innerHTML = content;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardContent);

    cardEl.appendChild(cardBody);

    cardWrapper.appendChild(cardEl);

    document.getElementById('posts-injection-area').appendChild(cardWrapper);
}

var titleInput = document.getElementById('titleInput');
var contentInput = document.getElementById('contentInput');
var btnSubmit = document.getElementById('btnSubmit');

function resetForm() {
    titleInput.value = '';
    contentInput.value = '';
}

btnSubmit.addEventListener('click', function () {
    if (titleInput.value === '') {
        console.log('disparar um error');
    }
    if ('serviceWorker' in navigator & 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then(function (sw) {
                var post = {
                    id: Math.random(),
                    title: titleInput.value,
                    content: contentInput.value
                }
                writeData('sync-posts', post)
                    .then(function () {
                        return sw.sync.register('sync-new-posts');
                    })
                    .then(function () {
                        // realiza limpeza do form
                        btnClose.click();
                        resetForm();

                        // retorna um alerta para o usuario
                        var toastSync = new bootstrap.Toast(syncToast);
                        return toastSync.show();
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            });
    } else {
        createPost(titleInput.value, contentInput.value);
    }
});

function createPost(title, content) {
    fetch(API_URL,
        {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: Math.random(),
                title: title,
                content: content
            })
        })
        .then(function (res) {
            return res.json();
        })
        .then(async function (response) {
            renderPost(response.title, response.content);
        });
}

var networkDataReceived = false;

// fetch request pelo indexedDB
function getPostsFromCache() {
    if ('indexedDB' in window) {
        readAllData('posts')
            .then(function (data) {
                console.log('FROM CACHE');
                data.map(function (post) {
                    renderPost(post.title, post.content);
                });
            });
    }
}

function getPostsFromApi() {
    fetch(API_URL)
        .then(function (res) {
            return res.json();
        })
        .then(function (response) {
            if (response.length) {
                response.map(function (post) {
                    renderPost(post.title, post.content);
                });
            }
        });
}

getPostsFromCache();

if (!networkDataReceived) {
    getPostsFromApi();
}

function enableCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function (stream) {
                var videoEl = document.createElement('video');
                videoEl.classList.add('video-stream');
                videoEl.srcObject = stream;
                form.appendChild(videoEl);
                videoEl.onloadedmetadata = () => {
                    videoEl.play();
                };
            })
            .catch(function (error) {
                console.log('fail to access camera/microphone');
            });
    } else {
        console.log('not supported');
    }
}

btnCamera.addEventListener('click', function () {
    enableCamera();
});

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log('Latitude', latitude);
        console.log('Longitude', longitude);
    }, function (error) {
        console.log('error');
    });
} else {
    console.log('not supported');
}

function displayConfirmation() {
    var options = {
        body: 'Congratulations you subscribed to our notification service',
        icon: './src/images/icons/cg-icon-72x72.png',
        tag: 'dispatchNotification',
        actions: [
            { action: 'confirm', title: 'Ok' },
            { action: 'cancel', title: 'Cancel' },
        ]
    }
    navigator.serviceWorker.ready
        .then(function(sw) {
            sw.showNotification('Successfully subscribed', options);
        });
}

btnNotification.addEventListener('click', function () {
    if ('Notification' in window) {
        Notification.requestPermission(function (result) {
            if (result !== 'granted') {
                console.log('No permission');
            }

            displayConfirmation();
        })
    }
});