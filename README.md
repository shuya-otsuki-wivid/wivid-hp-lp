# Wivid ハイパフォーマー紹介ツール

Career Designerがユーザーに紹介できるハイパフォーマー情報を管理・閲覧するための社内ツールです。

---

## 🌐 URL

- **本番サイト**: https://shuya-otsuki-wivid.github.io/wivid-hp-lp/
- **ログインページ**: https://shuya-otsuki-wivid.github.io/wivid-hp-lp/login.html
- **管理画面**: https://shuya-otsuki-wivid.github.io/wivid-hp-lp/admin.html
- **ログイン履歴**: https://shuya-otsuki-wivid.github.io/wivid-hp-lp/login-history.html

---

## 🔐 アクセス制限

**@wivid.co.jp のGoogleアカウント限定**でアクセス可能です。

- Firebase Authentication でGoogle認証
- 他のドメインのアカウントは自動的に拒否されます

---

## 📂 ファイル構成

```
wivid-hp-lp/
├── index.html              # ハイパフォーマー一覧ページ
├── login.html              # ログインページ
├── admin.html              # 管理画面（HP追加・編集・削除）
├── login-history.html      # ログイン履歴表示
├── style.css               # スタイルシート
├── script.js               # メインページのスクリプト
├── auth.js                 # Firebase認証ロジック
├── admin.js                # 管理画面のCRUDロジック
├── database-schema.md      # データベース設計ドキュメント
├── template.csv            # データ入力用CSVテンプレート
└── README.md               # このファイル
```

---

## 🎯 主な機能

### 1. ハイパフォーマー一覧（index.html）

- カード形式でハイパフォーマー情報を表示
- フィルター機能（役職レベル、紹介レベル、接触形式）
- レスポンシブデザイン
- スムーズなアニメーション

### 2. 管理画面（admin.html）

- ハイパフォーマー情報の **追加・編集・削除（CRUD）**
- リアルタイムでFirestoreと同期
- フォームバリデーション
- 公開/非公開ステータス管理

### 3. ログイン履歴（login-history.html）

- 全ユーザーのログイン履歴を表示
- 統計情報（総ログイン数、ユニークユーザー数、今日のログイン数）
- ブラウザ情報の表示

### 4. 認証機能（auth.js）

- Googleアカウント認証
- @wivid.co.jp ドメイン制限
- ログイン履歴の自動記録
- セッション管理

---

## 🗂️ データベース設計

### Firestore コレクション

#### 1. `high_performers`

ハイパフォーマー情報を管理

| フィールド | 説明 |
|-----------|------|
| company_name | 企業名 |
| company_size | 企業規模 |
| hp_name_1, hp_name_2 | HP氏名 |
| hp_role_1, hp_role_2 | HP役職 |
| position_level | 役職レベル（経営層/人事責任者） |
| introduction_level | 紹介レベル（B/B-/C+/C） |
| contact_format | 接触形式（個別面談/座談会/イベント） |
| sales_contact | 担当セールス |
| is_active | 公開ステータス |
| created_at, updated_at | 作成・更新日時 |

#### 2. `login_history`

ログイン履歴を記録

| フィールド | 説明 |
|-----------|------|
| user_email | ユーザーメールアドレス |
| user_name | ユーザー名 |
| user_id | ユーザーID |
| login_at | ログイン日時 |
| user_agent | ブラウザ情報 |

詳細は `database-schema.md` を参照してください。

---

## 🚀 デプロイ方法

### 1. コードを更新

```bash
cd ~/Desktop/wivid-hp-lp
git add -A
git commit -m "更新内容"
git push origin main
```

### 2. GitHub Pagesが自動デプロイ

- GitHub Actions で自動的にビルド・デプロイ
- 1〜3分で反映されます

### 3. 確認

- ハードリフレッシュ: `Cmd + Shift + R`
- またはシークレットモードでアクセス

---

## 📊 データ入力方法

### 方法1: 管理画面から直接入力（推奨）

1. https://shuya-otsuki-wivid.github.io/wivid-hp-lp/admin.html にアクセス
2. 「+ 新規追加」ボタンをクリック
3. フォームに情報を入力
4. 「保存」をクリック

### 方法2: CSVテンプレートを使用

1. `template.csv` をダウンロード
2. Google Spreadsheet にインポート
3. データを入力
4. 別途、Firestore同期スクリプトを実行（今後実装予定）

---

## 🔧 Firebaseセキュリティルール

### Firestore Rules

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

### Authentication Settings

- **承認済みドメイン**:
  - `localhost`
  - `wivid-hp-lp.firebaseapp.com`
  - `shuya-otsuki-wivid.github.io`

---

## 🎨 デザインカラー

| カラー | Hex | 用途 |
|--------|-----|------|
| **Wivid Navy** | `#022E49` | プライマリ |
| **Wivid Yellow** | `#FFF100` | アクセント |
| **Wivid Pink** | `#E4007F` | 経営層カード |
| **Wivid Blue** | `#00A0E9` | 人事責任者カード |

---

## 🛠️ トラブルシューティング

### ログインできない

- `@wivid.co.jp` のアカウントを使用しているか確認
- Firebaseの承認済みドメインに `shuya-otsuki-wivid.github.io` が追加されているか確認

### データが表示されない

- Firestoreのセキュリティルールが正しく設定されているか確認
- ブラウザのコンソールでエラーを確認

### 更新が反映されない

- ハードリフレッシュ: `Cmd + Shift + R`（Mac）/ `Ctrl + Shift + R`（Windows）
- シークレットモードでアクセス
- GitHub Actionsでデプロイが完了しているか確認

---

## 📞 サポート

問題や質問があれば、社内Slackまたは担当者に連絡してください。

---

## 📝 今後の拡張予定

- [ ] Google Spreadsheet → Firestore 自動同期
- [ ] メール通知機能（新規HP追加時）
- [ ] ダッシュボード（アクセス解析）
- [ ] HP推薦アルゴリズム（学生情報から最適なHPを提案）
- [ ] エクスポート機能（PDF/CSV）

---

**© 2025 Wivid Inc. Internal Tool**
