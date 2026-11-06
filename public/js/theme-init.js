// Sets the saved theme before the first paint. Loaded as a classic, blocking script in <head>
// so the page never flashes the wrong colours.
(function () {
  var t = null;
  try { t = localStorage.getItem('dawnly-theme'); } catch (e) {}
  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
})();
