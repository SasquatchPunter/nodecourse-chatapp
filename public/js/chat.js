const socket = io()

//Elements
const $form = document.querySelector('#message-form')
const $formBox = $form.querySelector('input')
const $formButton = $form.querySelector('button')
const $shareButton = document.querySelector('#share-location')
const $messages = document.querySelector('#message-chain')

// Templates
const messageTemplate = document.querySelector('#message-chain_template').innerHTML
const locationTemplate = document.querySelector('#location_template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

function autoScroll(container) {
    /**
     * This function scrolls to the end of a newly inserted element only IF the user hasn't set the scroll somwhere
     * above the last element. Scrolling to the bottom means the function will continue to scroll to the end of
     * every element as it's inserted in the list (message chain or user list).
     */

    // Bottom element
    const $newElement = container.lastElementChild

    // Element style
    const newElementStyles = getComputedStyle($newElement)
    const newElementMargin = parseInt(newElementStyles.marginBottom)
    const newElementHeight = $newElement.offsetHeight + newElementMargin

    // Visible height
    const visibleHeight = container.offsetHeight

    const containerHeight = container.scrollHeight

    const scrollOffset = container.scrollTop + visibleHeight

    if (containerHeight - newElementHeight <= scrollOffset) {
        container.scrollTop = containerHeight
    }
}

// To run on startup
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('serverMsg', ({ author, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        author,
        message: text,
        stamp: moment(createdAt).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll($messages)
})

// Deliver location url on locationShare
socket.on('locationShare', ({ author, url, createdAt }) => {
    const html = Mustache.render(locationTemplate, {
        author,
        url,
        stamp: moment(createdAt).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll($messages)
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    const $sidebar = document.querySelector('#sidebar')
    $sidebar.innerHTML = html
    autoScroll($sidebar)
})

$form.addEventListener('submit', (e) => {
    e.preventDefault()

    if ($formBox.value) {
        $formButton.setAttribute('disabled', 'disabled')

        socket.emit('clientMsg', $formBox.value, (hint) => {
            $formButton.removeAttribute('disabled')
            $formBox.value = ''
            $formBox.focus()
            console.log(hint)
        })
    }
})

$shareButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $shareButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('userLoc', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, (hint) => {
            console.log(hint)
        })
        $shareButton.removeAttribute('disabled')
    }, (err) => {
        $shareButton.removeAttribute('disabled')
        return alert("Can't share location because you denied access!\nRefresh the app if you would like to share your location.")
    })
})

