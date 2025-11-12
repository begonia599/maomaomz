/**
 * 全局类型声明 - 为现有代码提供类型支持
 * 这个文件只添加类型声明，不会改变任何运行时行为
 */

declare global {
  interface Window {
    // SillyTavern 相关
    SillyTavern?: {
      chat?: any[];
      getContext?: () => { chatId?: string };
      getCurrentChatId?: () => string;
      chatId?: string;
      eventSource?: {
        on: (event: string, callback: () => void) => void;
      };
      eventTypes?: {
        CHAT_CHANGED: string;
      };
      getRequestHeaders?: () => Record<string, string>;
    };

    // 全局函数
    getLastMessageId?: () => number;
    getChatMessages?: (range: string) => any[];
    getScriptId?: () => string;

    // 其他全局变量
    tavern_events?: {
      CHAT_CHANGED: string;
    };

    // API 相关
    api_server?: string | HTMLElement;
    main_api?: string;

    // zod (插件暴露的)
    z?: typeof import('zod').z;
  }
}

// Vue 事件类型增强
declare module '@vue/runtime-dom' {
  interface HTMLElementEventMap {
    mouseenter: MouseEvent;
    mouseleave: MouseEvent;
  }
}

// 扩展 EventTarget 接口以支持 style 属性
declare global {
  interface EventTarget {
    style?: CSSStyleDeclaration;
  }
}

export {};
