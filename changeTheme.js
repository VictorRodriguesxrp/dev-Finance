const button = document.querySelector('#change-theme *')
const html = document.querySelector('html')
let lightMode = localStorage.getItem('lightMode')

const enableLightMode = () => {
    html.classList.add('light-theme')
    localStorage.setItem('lightMode', 'enabled')
}

const disableLightMode = () => {
    html.classList.remove('light-theme')
    localStorage.setItem('lightMode', null)
}

lightMode === 'enabled' ? enableLightMode () : disableLightMode()

button.addEventListener('click', () => {
    lightMode = localStorage.getItem('lightMode')
    lightMode !== 'enabled' ? enableLightMode () : disableLightMode()
})
