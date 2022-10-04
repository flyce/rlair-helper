// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get('lesson', ({ lesson }) => {
  document.getElementById('lesson').innerHTML = lesson;
});

chrome.storage.sync.get('progress', ({ progress }) => {
  document.getElementById('progress').innerHTML = progress;
})