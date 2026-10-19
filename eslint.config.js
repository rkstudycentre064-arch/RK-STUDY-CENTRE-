import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  },
  {
    ...firebaseRulesPlugin.configs['flat/recommended'],
    files: ['firestore.rules', 'DRAFT_firestore.rules'],
  }
];
