import './style.css';

import { EditorView, basicSetup } from 'codemirror';
import { autocompletion } from '@codemirror/autocomplete';
import { CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';

const tagOptions = [
  'constructor',
  'deprecated',
  'link',
  'param',
  'returns',
  'type',
].map((tag) => ({
  label: '@' + tag + '😄', // emoji normal
  type: 'keyword',
  displayLabel: '😄' + tag, // use displayLabel for emoji bug: emoji error
}));

function completeJSDoc(context: CompletionContext) {
  let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (
    nodeBefore.name != 'BlockComment' ||
    context.state.sliceDoc(nodeBefore.from, nodeBefore.from + 3) != '/**'
  )
    return null;
  let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
  let tagBefore = /@\w*$/.exec(textBefore);
  if (!tagBefore && !context.explicit) return null;
  return {
    from: tagBefore ? nodeBefore.from + tagBefore.index : context.pos,
    options: tagOptions,
    validFor: /^(@\w*)?$/,
    // @ts-ignore
    getMatch: (x, y) => {
      return y;
    },
  };
}

import { javascriptLanguage } from '@codemirror/lang-javascript';

const jsDocCompletions = javascriptLanguage.data.of({
  autocomplete: completeJSDoc,
});

new EditorView({
  doc: '/** Complete tags here\n    @pa\n */\n',
  extensions: [
    basicSetup,
    javascriptLanguage,
    jsDocCompletions,
    autocompletion({
      closeOnBlur: false,
    }),
  ],
  parent: document.body,
});
