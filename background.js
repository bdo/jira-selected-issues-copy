function formatSelectedIssuesAndCopyToClipboard() {
  function createClipboardDiv() {
    if (document.clipboardDiv) return document.clipboardDiv;

    const clipboardDiv = (document.clipboardDiv = document.createElement('div'));

    clipboardDiv.style.fontSize = '12pt'; // Prevent zooming on iOS

    // Reset box model
    clipboardDiv.style.border = '0';
    clipboardDiv.style.padding = '0';
    clipboardDiv.style.margin = '0';

    // Move element out of screen
    clipboardDiv.style.position = 'fixed';
    clipboardDiv.style['right'] = '-9999px';
    clipboardDiv.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';

    // more hiding
    clipboardDiv.setAttribute('readonly', '');
    clipboardDiv.style.opacity = 0;
    clipboardDiv.style.pointerEvents = 'none';
    clipboardDiv.style.zIndex = -1;
    clipboardDiv.setAttribute('tabindex', '0'); // so it can be focused
    clipboardDiv.innerHTML = '';

    document.body.appendChild(clipboardDiv);

    return clipboardDiv;
  }

  function copyHtmlToClipboard(html) {
    const clipboardDiv = createClipboardDiv();

    clipboardDiv.innerHTML = html;

    const focused = document.activeElement;
    clipboardDiv.focus();

    window.getSelection().removeAllRanges();
    const range = document.createRange();
    range.setStartBefore(clipboardDiv.firstChild);
    range.setEndAfter(clipboardDiv.lastChild);
    window.getSelection().addRange(range);

    var ok = false;
    try {
      if (!document.execCommand('copy')) console.error('execCommand returned false !');
    } catch (err) {
      console.error('execCommand failed ! exception ' + err);
    }

    focused.focus();
  }

  function createLinkSpec(item) {
    const key = item.dataset.issueKey;
    return {
      key,
      title: item.querySelector('.ghx-summary').textContent,
      points: item.querySelector('aui-badge,.aui-badge')?.textContent,
      href: `https://wbdprod.atlassian.net/browse/${key}`,
    };
  }

  function createLink({ key, title, points, href }) {
    return `<a href="${href}">${key} ${title}${points > 0 ? ` (${points}pts)` : ''}</a>`;
  }

  let html;
  if (document.location.pathname.match('^/browse/[A-Z]+-\\d+')) {
    const { href, pathname } = document.location;
    const key = pathname.split('/').at(-1);
    const title = document.querySelector('h1').textContent;
    const points = document.querySelector('[data-testid*="story-point"]')?.textContent;
    html = createLink({ key, title, href, points });
  } else {
    const selectedItems = Array.from(document.querySelectorAll('.js-issue.ghx-selected'));
    if (selectedItems.length === 0) {
      return;
    }
    if (selectedItems.length > 1) {
      const specs = selectedItems.map((item) => createLinkSpec(item));
      html = '<ul>\n' + specs.map((spec) => `  <li>${createLink(spec)}</li>`).join('\n') + '\n</ul>';
    } else {
      html = createLink(createLinkSpec(selectedItems[0]));
    }
  }

  console.log(html);
  copyHtmlToClipboard(html);
}

chrome.action.onClicked.addListener((tab) => {
  console.log('Clicking on the jira-selected-issues-copy plugin button');
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: formatSelectedIssuesAndCopyToClipboard,
  });
});
