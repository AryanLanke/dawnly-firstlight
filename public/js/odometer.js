let currentDownloadCount = null;

// Renders the count as odometer digits; digits that changed roll when animate is true.
export function setDownloadCount(count, animate) {
  const formatted = Number(count).toLocaleString('en-US');
  const previous = currentDownloadCount === null ? '' : Number(currentDownloadCount).toLocaleString('en-US');
  const odometer = document.getElementById('live-counter');
  const pill = document.getElementById('download-count');

  odometer.innerHTML = '';
  for (let i = 0; i < formatted.length; i += 1) {
    const char = formatted[i];

    if (char === ',') {
      const comma = document.createElement('span');
      comma.className = 'odometer-comma';
      comma.textContent = ',';
      odometer.appendChild(comma);
      continue;
    }

    const digit = document.createElement('span');
    digit.className = 'odometer-digit';
    if (animate && currentDownloadCount !== null && previous[i] !== char) {
      digit.classList.add('is-rolling');
    }

    const value = document.createElement('span');
    value.textContent = char;
    digit.appendChild(value);
    odometer.appendChild(digit);
  }

  currentDownloadCount = Number(count);
  const noun = document.getElementById('download-noun');
  const label = Number(count) === 1 ? 'download' : 'downloads';
  if (noun) noun.textContent = label;
  pill.setAttribute('aria-label', formatted + ' ' + label);
}
