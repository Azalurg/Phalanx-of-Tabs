document.addEventListener('DOMContentLoaded', () => {
  const topSortSwitch = document.getElementById('topSortSwitch');
  const oneSortSwitch = document.getElementById('oneSortSwitch');
  // Odczytaj stan z chrome.storage
  chrome.storage.sync.get(['topSortSwitch'], (result) => {
    topSortSwitch.checked = !!result.topSortSwitch;
  });

  topSortSwitch.addEventListener('change', () => {
    chrome.storage.sync.set({ topSortSwitch: topSortSwitch.checked, oneSortSwitch: false });
    oneSortSwitch.checked = false;
  });

  chrome.storage.sync.get(['oneSortSwitch'], (result) => {
    oneSortSwitch.checked = !!result.oneSortSwitch;
  });

  oneSortSwitch.addEventListener('change', () => {
    chrome.storage.sync.set({ oneSortSwitch: oneSortSwitch.checked, topSortSwitch: false });
    topSortSwitch.checked = false;
  });




  // Załaduj listę kart
  chrome.tabs.query({ currentWindow: true }, tabs => {
    renderTabs(tabs);
  });

  // Obsługa sortowania
  document.getElementById('sortAZ').addEventListener('click', () => sortTabs('az'));
});

function renderTabs(tabs) {
  const titleLength = 100;
  const tabsListContent = document.getElementById('tabsList');
  const pinnedTabsListContent = document.getElementById('pinnedTabsList');

  pinnedTabs = tabs.filter(t => t.pinned);
  notPinnedTabs = tabs.filter(t => !t.pinned);

  tabsListContent.innerHTML = '';
  pinnedTabsListContent.innerHTML = '';

  pinnedTabs.forEach(tab => {
    const li = document.createElement('li');
    li.className = 'tab-item pinned';

    // Skróć tytuł do 30 znaków
    const shortTitle = tab.title?.length > titleLength
      ? tab.title.substring(0, titleLength) + '...'
      : tab.title;

      li.innerHTML = `
          <button class="pin-btn-selector unpin-btn" data-tab-id="${tab.id}">
            <img class="favicon" src="${tab.favIconUrl}">
            <span class="title">${shortTitle}</span>
          </button>
      `;

    pinnedTabsListContent.appendChild(li);
  });

  notPinnedTabs.forEach(tab => {
    const li = document.createElement('li');
    li.className = 'tab-item';

    // Skróć tytuł do 30 znaków
    const shortTitle = tab.title?.length > titleLength
      ? tab.title.substring(0, titleLength) + '...'
      : tab.title;

    li.innerHTML = `
      <button class="pin-btn-selector pin-btn" data-tab-id="${tab.id}">
        <img class="favicon" src="${tab.favIconUrl}">
        <span class="title">${shortTitle}</span>
      </button>
      `;

    tabsListContent.appendChild(li);
  }
  );

  // Obsługa przycisków "Przypnij/Odepnij"
  document.querySelectorAll('.pin-btn-selector').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = parseInt(btn.dataset.tabId);
      chrome.tabs.get(tabId, tab => {
        chrome.tabs.update(tabId, { pinned: !tab.pinned });
        chrome.tabs.query({ currentWindow: true }, tabs => {
          renderTabs(tabs);
        });
      });
    });
  });
}

function sortTabs(direction) {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    // Rozdziel karty na przypięte i nieprzypięte
    const pinnedTabs = tabs.filter(t => t.pinned);
    const unpinnedTabs = tabs.filter(t => !t.pinned);

    // Sortuj tylko nieprzypięte
    const sorted = [...unpinnedTabs].sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    // Połącz karty: najpierw przypięte, potem posortowane
    const allTabs = [...pinnedTabs, ...sorted];
    const tabIds = allTabs.map(t => t.id);

    // Przesuń wszystkie karty
    if (tabIds.length > 0) {
      chrome.tabs.move(tabIds, { index: 0 });
    }

    window.close();
  });
}
