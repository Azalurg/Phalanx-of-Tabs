document.addEventListener('DOMContentLoaded', () => {
    const tabsList = document.getElementById('tabsList');
    
    // Załaduj listę kart
    chrome.tabs.query({currentWindow: true}, tabs => {
      renderTabs(tabs);
    });
  
    // Obsługa sortowania
    document.getElementById('sortAZ').addEventListener('click', () => sortTabs('az'));
  });
  
  function renderTabs(tabs) {
    tabsList.innerHTML = '';
    tabs.forEach(tab => {
      const div = document.createElement('div');
      div.className = 'tab-item';
      
      // Skróć tytuł do 30 znaków
      const shortTitle = tab.title?.length > 30 
        ? tab.title.substring(0, 30) + '...' 
        : tab.title;
  
      div.innerHTML = `
        <div class="tab-content">
          <img class="favicon" src="${tab.favIconUrl}">
          <span class="title">${tab.pinned ? '📌 ' : ''}${shortTitle}</span>
        </div>
        <button class="pin-btn" data-tab-id="${tab.id}">
          ${tab.pinned ? 'Odepnij' : 'Przypnij'}
        </button>
      `;
      
      tabsList.appendChild(div);
    });  
  
    // Obsługa przycisków "Przypnij/Odepnij"
    document.querySelectorAll('.pin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = parseInt(btn.dataset.tabId);
        chrome.tabs.get(tabId, tab => {
          chrome.tabs.update(tabId, { pinned: !tab.pinned });
        });
      });
    });
  }
  
  function sortTabs(direction) {
    chrome.tabs.query({currentWindow: true}, tabs => {
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
        chrome.tabs.move(tabIds, {index: 0});
      }
  
      window.close();
    });
  }
  