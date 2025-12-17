# ハイパフォーマーリストLP 開発記録

**プロジェクト名**: Wivid ハイパフォーマー紹介ツール  
**開発期間**: 2025年12月16日  
**開発者**: 大槻修也  
**目的**: Career Designerが就活生に紹介できるハイパフォーマー情報を管理・閲覧するための社内ツール

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [実装した機能](#実装した機能)
3. [技術スタック](#技術スタック)
4. [データベース設計](#データベース設計)
5. [開発の経緯](#開発の経緯)
6. [使い方](#使い方)
7. [URL一覧](#url一覧)
8. [トラブルシューティング](#トラブルシューティング)

---

## 🎯 プロジェクト概要

### 目的

Career Designerがユーザー（就活生）に対して、企業のハイパフォーマー（経営層・人事責任者など）を紹介するための社内ツール。

### 実現したいこと

1. ハイパフォーマーの情報が揃っている
2. ハイパフォーマーに会える条件が明確になっている
3. ハイパフォーマーとの接触の場に関する情報が揃っている
4. ハイパフォーマーと話すことによって得られる知見や示唆が言語化されている
5. Career Designerがハイパフォーマーの情報を見て、ユーザーに紹介できる状態になっている

### アクセス制限

- **@wivid.co.jp** のGoogleアカウント限定
- Firebase Authentication による認証
- 他のドメインは自動的に拒否

---

## ✅ 実装した機能

### 1. 認証機能
- **Google認証**（Firebase Authentication）
- **ドメイン制限**（@wivid.co.jp のみ許可）
- **ログイン履歴記録**（自動記録）
- **セッション管理**

### 2. ハイパフォーマー一覧表示
- **カード形式**での表示
- **フィルター機能**
  - 役職レベル（経営層、人事責任者、事業責任者、マネージャー、リーダー、特別表彰受賞者）
  - 紹介レベル（B → B- → C+ → C）
  - 接触形式（個別面談、座談会/イベント）
- **静的データ + 動的データ**のハイブリッド表示
- **レスポンシブデザイン**（PC・スマホ対応）

### 3. 管理画面（CRUD機能）
- **新規追加**: ハイパフォーマー情報の登録
- **編集**: 既存データの更新
- **削除**: データの削除
- **公開/非公開**: ステータス管理

### 4. CSV一括インポート
- **CSVアップロード**（ドラッグ&ドロップ対応）
- **プレビュー機能**（インポート前に確認）
- **一括登録**（Firestoreに自動保存）
- **プログレスバー**（進捗表示）
- **エラーハンドリング**

### 5. ログイン履歴
- **全ログイン記録**の表示
- **統計情報**
  - 総ログイン数
  - ユニークユーザー数
  - 今日のログイン数
  - 直近のログイン時刻
- **ブラウザ情報**の記録

### 6. デザイン
- **Wividブランドカラー**適用
  - Wivid Navy (#022E49)
  - Wivid Yellow (#FFF100)
  - Wivid Pink (#E4007F)
  - Wivid Blue (#00A0E9)
- **役職レベル別カラー**
- **スムーズなアニメーション**
- **モダンなUI/UX**

---

## 🛠️ 技術スタック

### フロントエンド
- **HTML5**
- **CSS3**（カスタムプロパティ使用）
- **JavaScript ES6+**（ES Modules）

### バックエンド
- **Firebase Authentication**（Google認証）
- **Cloud Firestore**（NoSQLデータベース）
- **Firebase Analytics**（アクセス解析）

### ホスティング
- **GitHub Pages**（静的サイトホスティング）
- **GitHub Actions**（自動デプロイ）

### 開発ツール
- **Git/GitHub**（バージョン管理）
- **Cursor AI**（開発支援）

---

## 🗂️ データベース設計

### Firestore コレクション

#### 1. `high_performers`

ハイパフォーマー情報を管理

| フィールド名 | データ型 | 説明 |
|-------------|---------|------|
| company_name | string | 企業名 ✅ 必須 |
| company_size | string | 企業規模 |
| industry | string | 業界 |
| hp_name_1 | string | HP氏名1 ✅ 必須 |
| hp_role_1 | string | HP役職1 |
| hp_name_2 | string | HP氏名2 |
| hp_role_2 | string | HP役職2 |
| position_level | string | 役職レベル ✅ 必須 |
| age_range | string | 年齢層 |
| background | text | 経歴 |
| achievements | text | 成果・特徴 |
| introduction_level | string | 紹介レベル（B/B-/C+/C）✅ 必須 |
| education_requirement | text | 学歴要件 |
| experience_requirement | text | 経験要件 |
| selection_status | text | 選考状況要件 |
| student_mindset | text | 志向性要件 |
| additional_notes | text | 補足条件 |
| contact_format | string | 接触形式 ✅ 必須 |
| contact_format_detail | text | 接触形式詳細 |
| first_contact_person | string | 初回対応者 |
| special_contact_note | text | 特記事項 |
| insights | text | 得られる知見 |
| learning_points | string | 学べるポイント |
| recommended_for | text | 推奨学生タイプ |
| sales_contact | string | 担当セールス ✅ 必須 |
| sales_email | string | セールスメール |
| introduction_flow | text | 紹介フロー |
| lead_time | string | リードタイム |
| is_active | boolean | 公開ステータス ✅ 必須 |
| created_at | timestamp | 作成日時 |
| created_by | string | 作成者 |
| updated_at | timestamp | 更新日時 |
| updated_by | string | 更新者 |

#### 2. `login_history`

ログイン履歴を記録

| フィールド名 | データ型 | 説明 |
|-------------|---------|------|
| user_email | string | ユーザーメールアドレス |
| user_name | string | ユーザー名 |
| user_id | string | ユーザーID |
| login_at | timestamp | ログイン日時 |
| user_agent | string | ブラウザ情報 |

### Firestoreセキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ハイパフォーマー情報
    match /high_performers/{document} {
      allow read: if request.auth != null && request.auth.token.email.matches('.*@wivid\\.co\\.jp$');
      allow write: if request.auth != null && request.auth.token.email.matches('.*@wivid\\.co\\.jp$');
    }
    
    // ログイン履歴
    match /login_history/{document} {
      allow read: if request.auth != null && request.auth.token.email.matches('.*@wivid\\.co\\.jp$');
      allow write: if request.auth != null && request.auth.token.email.matches('.*@wivid\\.co\\.jp$');
    }
  }
}
```

---

## 📖 開発の経緯

### Phase 1: 初期LP作成
1. カードリスト型LPの基本設計
2. 17社のハイパフォーマー情報を静的HTMLで実装
3. フィルター機能の実装
4. Wividブランドカラーの適用

### Phase 2: Firebase認証実装
1. Firebase プロジェクト作成
2. Google認証の設定
3. @wivid.co.jp ドメイン制限の実装
4. ログインページの作成
5. 認証チェック機能の実装

### Phase 3: データベース化
1. Firestore データベース作成
2. セキュリティルールの設定
3. データベーススキーマ設計
4. 管理画面（CRUD）の実装

### Phase 4: ログイン履歴機能
1. ログイン時の自動記録機能
2. ログイン履歴表示ページの作成
3. 統計情報の表示

### Phase 5: CSV一括インポート
1. CSVアップロード機能
2. プレビュー機能
3. 一括登録機能
4. プログレスバー実装

### Phase 6: 役職レベル拡張
1. 役職レベルを2種類から6種類に拡張
2. 役職レベル別カラーの設定
3. フィルター機能の更新

### Phase 7: データ統合
1. 静的データと動的データのハイブリッド表示
2. 既存17社のデータ維持
3. Firestoreからの動的読み込み追加

---

## 📚 使い方

### 1. ログイン

1. https://shuya-otsuki-wivid.github.io/wivid-hp-lp/login.html にアクセス
2. **「Googleでログイン」**をクリック
3. **@wivid.co.jp** のアカウントを選択
4. ログイン成功 → HP一覧ページへ自動リダイレクト

### 2. ハイパフォーマーを探す

1. HP一覧ページでフィルターを使用
2. **役職レベル**: 経営層、人事責任者、事業責任者、マネージャー、リーダー、特別表彰受賞者
3. **紹介レベル**: B → B- → C+ → C
4. **接触形式**: 個別面談、座談会/イベント
5. 「詳細を見る」で紹介条件を確認

### 3. 個別にデータを追加

1. **管理画面**にアクセス
2. **「+ 新規追加」**をクリック
3. フォームに情報を入力
   - 必須項目: 企業名、HP氏名1、役職レベル、紹介レベル、接触形式、担当セールス
4. **「保存」**をクリック

### 4. CSV一括インポート

#### ステップ1: テンプレートをダウンロード

https://raw.githubusercontent.com/shuya-otsuki-wivid/wivid-hp-lp/main/template.csv

#### ステップ2: データを入力

- ExcelやGoogle Spreadsheetで編集
- UTF-8形式で保存

#### ステップ3: アップロード

1. **CSV一括インポート**ページにアクセス
2. CSVファイルをドラッグ&ドロップ（またはファイル選択）
3. プレビューでデータを確認
4. **「Firestoreにインポート」**をクリック

### 5. データを編集

1. **管理画面**にアクセス
2. 編集したいHPの**「編集」**ボタンをクリック
3. 情報を更新
4. **「保存」**をクリック

### 6. データを削除

1. **管理画面**にアクセス
2. 削除したいHPの**「削除」**ボタンをクリック
3. 確認ダイアログで**「OK」**

### 7. ログイン履歴を確認

1. **ログイン履歴**ページにアクセス
2. 統計情報と履歴一覧を確認

---

## 🔗 URL一覧

| ページ | URL | 説明 |
|--------|-----|------|
| **HP一覧** | https://shuya-otsuki-wivid.github.io/wivid-hp-lp/ | メインページ |
| **ログイン** | https://shuya-otsuki-wivid.github.io/wivid-hp-lp/login.html | Google認証 |
| **管理画面** | https://shuya-otsuki-wivid.github.io/wivid-hp-lp/admin.html | CRUD操作 |
| **CSV一括インポート** | https://shuya-otsuki-wivid.github.io/wivid-hp-lp/import.html | 一括登録 |
| **ログイン履歴** | https://shuya-otsuki-wivid.github.io/wivid-hp-lp/login-history.html | 利用状況 |
| **テンプレートCSV** | https://raw.githubusercontent.com/shuya-otsuki-wivid/wivid-hp-lp/main/template.csv | ダウンロード |

---

## 🚨 トラブルシューティング

### ログインできない

**症状**: ログインボタンをクリックしても認証エラー

**原因**:
- @wivid.co.jp 以外のアカウントを使用している
- Firebaseの承認済みドメインに設定されていない

**解決方法**:
1. @wivid.co.jp のアカウントを使用
2. Firebase Console → Authentication → Settings → Authorized domains を確認
3. `shuya-otsuki-wivid.github.io` が追加されているか確認

---

### データが表示されない

**症状**: HP一覧ページでカードが表示されない

**原因**:
- ブラウザのキャッシュが残っている
- デプロイが完了していない

**解決方法**:
1. **ハードリフレッシュ**: `Cmd + Shift + R`（Mac）/ `Ctrl + Shift + R`（Windows）
2. **シークレットモード**でアクセス
3. GitHub Actions でデプロイが完了しているか確認

---

### 更新が反映されない

**症状**: データを追加・編集しても表示されない

**原因**:
- ブラウザのキャッシュ
- Firestoreのセキュリティルールが正しくない

**解決方法**:
1. ハードリフレッシュ
2. ブラウザの開発者ツール（F12）でConsoleを確認
3. Firestoreのセキュリティルールを確認

---

### CSVインポートが失敗する

**症状**: CSVアップロード後、エラーが出る

**原因**:
- CSVの文字コードがUTF-8でない
- 必須項目が空欄
- フォーマットが間違っている

**解決方法**:
1. UTF-8で保存し直す
2. 必須項目（企業名、HP氏名1、役職レベル、紹介レベル、接触形式、担当セールス）を確認
3. `template.csv` と同じフォーマットか確認
4. ブラウザのConsoleでエラーメッセージを確認

---

## 📊 統計情報

### 開発時間
- **総開発時間**: 約4〜5時間
- **機能数**: 7つの主要機能
- **ファイル数**: 14ファイル
- **コード行数**: 約3,000行

### データ量
- **静的データ**: 17社
- **データベース**: Firestore（無制限）
- **認証**: Firebase Authentication

---

## 🎨 デザイン仕様

### カラーパレット

#### ブランドカラー
- **Wivid Navy**: #022E49（プライマリ）
- **Wivid Yellow**: #FFF100（アクセント）
- **Wivid Pink**: #E4007F
- **Wivid Blue**: #00A0E9

#### 役職レベル別カラー
- **経営層**: ピンク系グラデーション
- **人事責任者**: ブルー系グラデーション
- **事業責任者**: ライトブルー
- **マネージャー**: グリーン
- **リーダー**: イエロー
- **特別表彰受賞者**: オレンジ

### フォント
- **日本語**: Noto Sans JP
- **英語**: Playfair Display（タイトル用）

### レイアウト
- **グリッドシステム**: CSS Grid
- **カードデザイン**: Material Design風
- **レスポンシブ**: モバイルファースト

---

## 🔐 セキュリティ

### 認証
- Firebase Authentication（Google OAuth）
- ドメイン制限（@wivid.co.jp のみ）
- セッション管理

### データベース
- Firestoreセキュリティルール
- 認証済みユーザーのみアクセス可能
- ドメイン制限（@wivid.co.jp のみ）

### ホスティング
- HTTPS強制（GitHub Pages）
- CORS設定

---

## 🚀 今後の拡張可能性

### 機能拡張
- [ ] 管理者権限の階層化（管理者/一般ユーザー）
- [ ] メール通知機能（新規HP追加時）
- [ ] ダッシュボード（アクセス解析）
- [ ] HP推薦アルゴリズム（学生情報から最適なHPを提案）
- [ ] エクスポート機能（PDF/Excel）
- [ ] Google Spreadsheet連携（自動同期）
- [ ] 検索機能（全文検索）
- [ ] タグ機能（業界・スキルタグ）

### データ拡張
- [ ] 学生紹介履歴の記録
- [ ] 面談フィードバックの保存
- [ ] HP評価システム
- [ ] 紹介成功率の分析

---

## 📝 開発メモ

### 技術的な学び

#### 1. Firebaseの活用
- Firebase Authentication の Google認証実装
- Firestore のセキュリティルール設定
- リアルタイムデータベースの構築

#### 2. GitHub Pagesでのデプロイ
- 静的サイトホスティング
- GitHub Actionsによる自動デプロイ
- カスタムドメインの設定可能性

#### 3. ハイブリッドデータ管理
- 静的HTML + Firestore の組み合わせ
- パフォーマンスとメンテナンス性のバランス

#### 4. CSV一括インポート
- FileReader APIの活用
- プログレスバーの実装
- エラーハンドリング

### 課題と解決

#### 課題1: 静的データと動的データの共存
- **問題**: 既存の17社データを残しながら、Firestoreからも読み込む
- **解決**: 既存カードを保持したまま、動的データを追加で表示

#### 課題2: GitHub Pages での Firebase 認証
- **問題**: ローカルでは動作するが、GitHub Pagesでは認証エラー
- **解決**: Firebaseの承認済みドメインに GitHub Pages のドメインを追加

#### 課題3: データのバージョン管理
- **問題**: 静的HTMLの更新でデータが消える
- **解決**: Git のコミット履歴から復元、static_cards.html を使用

---

## 📞 サポート

### 問い合わせ先
- 社内Slack
- 開発者: 大槻修也（otsuki@wivid.co.jp）

### ドキュメント
- README.md（プロジェクトルート）
- database-schema.md（データベース設計）
- このファイル（開発記録）

---

## 📜 ライセンス

© 2025 Wivid Inc. Internal Tool  
社内利用のみ、外部公開禁止

---

**最終更新日**: 2025年12月16日  
**バージョン**: 1.0.0

