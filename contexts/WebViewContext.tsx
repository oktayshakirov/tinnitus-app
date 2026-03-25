import React, { createContext, useContext, useRef, ReactNode } from "react";
import { WebView } from "react-native-webview";

interface WebViewContextType {
  registerWebView: (id: string, ref: React.RefObject<WebView | null>) => void;
  unregisterWebView: (id: string) => void;
  getWebViewRef: (id: string) => React.RefObject<WebView | null> | null;
}

const WebViewContext = createContext<WebViewContextType | undefined>(undefined);

export function WebViewProvider({ children }: { children: ReactNode }) {
  const webViewRefs = useRef<Map<string, React.RefObject<WebView | null>>>(
    new Map()
  );

  const registerWebView = (id: string, ref: React.RefObject<WebView | null>) => {
    webViewRefs.current.set(id, ref);
  };

  const unregisterWebView = (id: string) => {
    webViewRefs.current.delete(id);
  };

  const getWebViewRef = (id: string) => {
    return webViewRefs.current.get(id) || null;
  };

  return (
    <WebViewContext.Provider
      value={{
        registerWebView,
        unregisterWebView,
        getWebViewRef,
      }}
    >
      {children}
    </WebViewContext.Provider>
  );
}

export function useWebView() {
  const context = useContext(WebViewContext);
  if (context === undefined) {
    throw new Error("useWebView must be used within a WebViewProvider");
  }
  return context;
}
