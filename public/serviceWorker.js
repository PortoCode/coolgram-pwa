importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var API_URL = 'http://localhost:3000/posts';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/images/yosemite.jpg',
    '/src/images/icons/cg-icon-48x48.png',
    '/src/css/bootstrap.min.css',
    '/src/css/style.css',
    '/src/js/app.js',
    '/src/js/bootstrap.min.js'
]

var STATIC_CACHE_VERSION = 'static-3'
var DYNAMIC_CACHE_VERSION = 'dynamic';

self.addEventListener('install', function (event) {
    // console.log('Service Worker - Installing', event);
    event.waitUntil(
        caches.open(STATIC_CACHE_VERSION).then(function (cache) {
            // console.log('Precacheamento');
            cache.addAll(STATIC_FILES);
        })
    );
});

self.addEventListener('activate', function (event) {
    // console.log('Service Worker [Activate]', event);

    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                var promises = keyList.map(function (key) {
                    if (key !== STATIC_CACHE_VERSION) {
                        return caches.delete(key);
                    }
                })

                return Promise.all(promises);
            })
    );

    return self.clients.claim();
});

function isInArray(url, filesArray) {
    var cachedPath;
    if (url.indexOf(self.origin) === 0) {
        cachedPath = url.substring(self.origin.length);
    } else {
        cachedPath = url;
    }

    return filesArray.indexOf(cachedPath) > -1;
}

self.addEventListener('fetch', function (event) {
    // console.log('Service Worker [Fetch]', event);

    if (event.request.url.indexOf(API_URL) > -1) {
        event.respondWith(
            fetch(event.request)
                .then(function (res) {
                    var clonedRes = res.clone();
                    return clonedRes.json();
                })
                .then(function (data) {
                    for (var key in data) {
                        writeData('posts', data[key]);
                    }
                })
        );
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(function (res) {
                                // console.log(res);
                                return caches.open(DYNAMIC_CACHE_VERSION)
                                    .then(function (cache) {
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    });
                                // return res;
                            })
                        // .catch(function (error) {
                        //     return caches.open(STATIC_CACHE_VERSION)
                        //         .then(function (cache) {
                        //             console.log(cache);
                        //         });
                        // })
                    }
                })
        );
    }
});

self.addEventListener('sync', function (event) {
    console.log('Background Syncing', event);

    if (event.tag === 'sync-new-posts') {
        console.log('Syncing new posts');
        event.waitUntil(
            readAllData('sync-posts')
                .then(function (data) {
                    for (var stPost of data) {
                        fetch(API_URL,
                            {
                                method: 'POST',
                                headers: {
                                    'Access-Control-Allow-Origin': '*',
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                                body: JSON.stringify({
                                    id: stPost.id,
                                    title: stPost.title,
                                    content: stPost.content
                                })
                            })
                            .then(function (res) {
                                console.log('Data was synced', res);
                                if (res.ok) {
                                    res.json()
                                        .then(function (resData) {
                                            deleteItemFromData('sync-posts', resData.id);
                                        })
                                }
                            })
                            .catch(function (error) {
                                console.log('Error while posting sync', error);
                            });
                    }
                })
        );
    }
});