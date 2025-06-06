export const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

export const formatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(formatUrl(url));
    return true;
  } catch {
    return false;
  }
};

export const shortenUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
};

export const getCurrentTab = async (): Promise<chrome.tabs.Tab | null> => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  } catch (error) {
    console.error('Error getting current tab:', error);
    return null;
  }
};

export const sendMessageToTab = async (tabId: number, message: any): Promise<any> => {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.error('Error sending message to tab:', error);
    return null;
  }
};

export const sendMessageToBackground = (message: any): Promise<any> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
};

export const getExtensionUrl = (path: string): string => {
  return chrome.runtime.getURL(path);
};

export const openOptionsPage = (): void => {
  chrome.runtime.openOptionsPage();
};

export const createNotification = (options: chrome.notifications.NotificationOptions): void => {
  // Ensure required properties are set to avoid TypeScript errors
  const completeOptions: chrome.notifications.NotificationOptions = {
    iconUrl: options.iconUrl || 'icons/icon-128.png',
    type: options.type || 'basic' as chrome.notifications.TemplateType,
    title: options.title || 'Arti AI Detector',
    message: options.message || '',
    ...options
  };
  
  // Use as any to bypass strict type checking since we've ensured all required fields are present
  chrome.notifications.create(completeOptions as any);
};
