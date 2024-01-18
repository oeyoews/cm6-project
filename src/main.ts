// @ts-nocheck
import {
  keymap,
  highlightActiveLine,
  lineNumbers,
  highlightActiveLineGutter,
  placeholder,
  highlightWhitespace,
  highlightTrailingWhitespace,
} from '@codemirror/view';
import {
  markdown,
  markdownLanguage,
  markdownKeymap,
} from '@codemirror/lang-markdown';
import './style.css';
import { Extension, Prec } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import {
  startCompletion,
  acceptCompletion,
  Completion,
  autocompletion,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete';

const tagOptions = [
  'constructor',
  'deprecated',
  'link',
  'param',
  'returns',
  'type',
].map((tag) => ({ label: '@' + tag, type: 'keyword' }));

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
  };
}

function myCompletions(context: CompletionContext): CompletionResult {
  console.log(context);
  let word = context.matchBefore(/\w*/);
  if (word.from == word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: [
      {
        label: '#😄 match',
        displayLabel: '😄 match',
        section: '(Tags)',
      },
      {
        label: 'one',
        displayLabel: 'one',
      },
    ],
    getMatch: (compltion: Completion, matched) => {
      console.log(matched);
      return matched as [];
    },
  };
}

new EditorView({
  doc: '/** Complete tags here\n    @pa\n */\n',
  extensions: [
    basicSetup,
    markdown(),
    markdownLanguage,
    markdownLanguage.data.of({
      autocompletion: completeJSDoc,
    }),
    autocompletion({
      // override: [myCompletions],
      closeOnBlur: false,
    }),
    keymap.of([
      {
        key: 'Tab',
        run: acceptCompletion,
      },
      {
        key: 'Ctrl-Space',
        run: startCompletion,
      },
    ]),
  ],
  parent: document.body,
});
