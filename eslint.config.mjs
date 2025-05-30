import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// 現在のファイルのディレクトリパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 従来のESLint設定ファイルをフラットコンフィグ形式に変換するための互換レイヤー
const compat = new FlatCompat({
  baseDirectory: __dirname, // プロジェクトのベースディレクトリを指定
  resolvePluginsRelativeTo: __dirname, // プラグイン解決の基準ディレクトリを指定
});

const eslintConfig = [
  // Next.js推奨のルールとTypeScript固有のルールを適用
  ...compat.extends(
    'eslint:recommended', // ESLintの推奨基本ルール（品質に関する一般的なルールを含む）
    'plugin:@typescript-eslint/recommended', // TypeScriptの推奨ルール（TS固有の品質チェック）
    'next/core-web-vitals', // Next.jsのWeb Vitals関連ルール（Next.js固有の品質チェック）
  ),

  // Prettierとの競合を避けるための設定。
  // これにより、ESLintのスタイルに関するルールがすべて無効化され、Prettierがフォーマットの責任を負います。
  // この設定は必ず最後に配置してください。
  ...compat.extends('prettier'),

  {
    // Lintの対象ファイルを指定
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // TypeScriptプロジェクトでは'@typescript-eslint/parser'を使用
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest', // 最新のECMAScriptバージョンをサポート
      sourceType: 'module', // ES Modulesを使用
      project: ['./tsconfig.json'], // TypeScriptプロジェクトのtsconfig.jsonを指定
    },
    rules: {
      // 未使用変数を警告（TypeScriptでは@typescript-eslint/no-unused-varsを使うため、ESLintの元ルールはオフ）
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // 不明なエクスポートのチェックをTypeScriptファイルでは無効化（Next.jsでfalse positiveを防ぐため）
      // Next.jsのrewritesやmiddlewareなどで発生しがち
      'import/no-unresolved': 'off',

      // その他のカスタム品質ルール（必要に応じて追加）
      // 例: console.logの使用を警告
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // デバッガーステートメントの使用を禁止
      'no-debugger': 'error',
      // returnがないPromiseの警告をしない（非同期処理でよくあるパターン）
      '@typescript-eslint/no-floating-promises': 'off', // 必要に応じて
      // 明示的なanyの使用を許可しない（厳密な型チェックのため）
      '@typescript-eslint/no-explicit-any': 'warn', // 'error' にしても良い
    },
  },
  {
    // `.js` や `.jsx` ファイルにおけるTypeScript関連ルールの無効化（必要であれば）
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];

export default eslintConfig;
