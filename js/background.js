// Funkcja pomocnicza do ponawiania prób z opóźnieniem
async function moveTabWithRetry(tabId, index, retries = 5) {
  try {
    await chrome.tabs.move(tabId, { index });
  } catch (error) {
    if (retries > 0 && error.message.includes('cannot be edited')) {
      // Czekaj 100ms i ponów próbę
      await new Promise(resolve => setTimeout(resolve, 100));
      await moveTabWithRetry(tabId, index, retries - 1);
    } else {
      console.error('Nie udało się przesunąć karty:', error);
    }
  }
}

// Obsługa aktywacji karty
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Sprawdź ustawienie w storage
  chrome.storage.sync.get(['topSortSwitch', 'oneSortSwitch'], async (result) => {
    if (!result.topSortSwitch && !result.oneSortSwitch) return; // Jeśli wyłączone, nie rób nic

    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab.pinned) return;  // Jeśli karta jest przypięta, nie rób nic

    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const pinnedCount = allTabs.filter(t => t.pinned).length;
    let targetIndex = tab.index; // Domyślnie na końcu listy

    if (result.topSortSwitch) targetIndex = pinnedCount;
    if (result.oneSortSwitch) targetIndex = Math.max(pinnedCount, targetIndex - 1);

    if (tab.index !== targetIndex) {
      await moveTabWithRetry(tab.id, targetIndex);
    }
  });
});

// Reszta kodu pozostaje bez zmian
