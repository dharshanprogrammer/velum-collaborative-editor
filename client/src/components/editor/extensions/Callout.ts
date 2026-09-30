import { Node, mergeAttributes } from '@tiptap/core';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { type: 'info' | 'warning' | 'success' | 'danger' }) => ReturnType;
      toggleCallout: (attributes?: { type: 'info' | 'warning' | 'success' | 'danger' }) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        rendered: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type || 'info';
    const bgClasses = {
      info: 'bg-semantic-info-bg border-semantic-info/40 text-text-primary',
      warning: 'bg-semantic-warning-bg border-semantic-warning/40 text-text-primary',
      success: 'bg-semantic-success-bg border-semantic-success/40 text-text-primary',
      danger: 'bg-semantic-danger-bg border-semantic-danger/40 text-text-primary',
    }[type as 'info' | 'warning' | 'success' | 'danger'];

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        class: `p-4 my-4 rounded-xl border flex gap-3 text-sm leading-relaxed ${bgClasses}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
    };
  },
});
