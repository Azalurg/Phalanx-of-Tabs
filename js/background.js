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
  const tab = await chrome.tabs.get(activeInfo.tabId);
  
  if (!tab.pinned) {
    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const pinnedCount = allTabs.filter(t => t.pinned).length;
    const targetIndex = pinnedCount;

    if (tab.index !== targetIndex) {
      // Użyj funkcji z ponawianiem prób
      await moveTabWithRetry(tab.id, targetIndex);
    }
  }
});

// Reszta kodu pozostaje bez zmian
