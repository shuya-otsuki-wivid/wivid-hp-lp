# ハイパフォーマー管理データベース設計

## 📊 データベース構造

### メインテーブル: `high_performers`

ハイパフォーマー情報を1レコード1人（または1企業）で管理

---

## 🗂️ フィールド定義

### 【基本情報】

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|-------------|---------|------|------|-----|
| `id` | string | ✅ | 一意のID（自動生成） | `hp_001` |
| `company_name` | string | ✅ | 企業名 | `EZO CONSULTING GROUP` |
| `company_size` | string | | 企業規模 | `36名` |
| `industry` | string | | 業界 | `不動産コンサルティング` |
| `company_url` | string | | 企業URL | `https://example.com` |
| `is_active` | boolean | ✅ | 公開中かどうか | `true` / `false` |

---

### 【ハイパフォーマー情報】

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|-------------|---------|------|------|-----|
| `hp_names` | array[object] | ✅ | HP氏名（複数対応） | `[{name: "田中 雄土", role: "CEO"}, {name: "油井 航平", role: "COO"}]` |
| `position_level` | string | ✅ | 役職レベル | `経営層` / `人事責任者` |
| `position_detail` | string | | 役職詳細 | `代表取締役 CEO` |
| `age_range` | string | | 年齢層 | `30代後半` |
| `background` | text | | 経歴 | `早稲田大学卒。プロアルペンスキーヤーから...` |
| `achievements` | text | | 成果・特徴 | `全日本スキー選手権3位の実績...` |
| `profile_image` | string | | プロフィール画像URL | `https://...` |

---

### 【紹介条件】

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|-------------|---------|------|------|-----|
| `introduction_level` | string | ✅ | 紹介レベル | `B` / `B-` / `C+` / `C` |
| `education_requirement` | text | | 学歴要件 | `旧帝大早慶、海外大学、つくば・神戸・横国・一橋` |
| `experience_requirement` | text | | 経験要件 | `体育会系の部活動経験/主将・代表経験など` |
| `selection_status` | text | | 選考状況要件 | `外コン・外銀を受けている（惜しいところで落ちた層もOK）` |
| `student_mindset` | text | | 志向性要件 | `とにかくよく食べる子、体力がある、ストレス耐性がある` |
| `additional_notes` | text | | 補足条件 | `学歴を満たしていなくても、ビジネス経験があって超優秀な学生は相談可能` |

---

### 【接触形式】

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|-------------|---------|------|------|-----|
| `contact_format` | string | ✅ | 接触形式 | `個別面談` / `座談会` / `イベント` |
| `contact_format_detail` | text | | 接触形式詳細 | `①人事責任者カジュアル面談 ②役員ランチ会（複数学生）` |
| `first_contact_person` | string | | 初回対応者 | `代表取締役` |
| `special_contact_note` | text | | 特記事項 | `ウィビッドからの学生の質が高いと評価されており、初回から代表が対応してくれます` |

---

### 【得られる知見・示唆】

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|-------------|---------|------|------|-----|
| `insights` | text | | 得られる知見 | `不動産投資の目利き力、スポーツと経営の両立、キャリアの掛け算` |
| `learning_points` | array[string] | | 学べるポイント（箇条書き） | `["財務分析力", "経営判断力", "業界知識"]` |
| `recommended_for` | text | | どんな学生に推奨か | `起業志向、金融志望、体育会系` |

---

### 【紹介オペレーション】

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|-------------|---------|------|------|-----|
| `sales_contact` | string | ✅ | 担当セールス | `山本` / `堀内` / `勝守` / `佐々木` |
| `sales_email` | string | | 担当セールスメール | `yamamoto@wivid.co.jp` |
| `introduction_flow` | text | | 紹介フロー | `1. 学生情報を担当セールスに共有 2. セールスがHPと調整 3. 日程確定後、学生に連絡` |
| `lead_time` | string | | リードタイム | `約3営業日` |
| `preparation_materials` | text | | 事前準備資料 | `学生のガクチカ、志望業界、選考状況` |

---

### 【メタ情報】

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|-------------|---------|------|------|-----|
| `created_at` | timestamp | ✅ | 作成日時 | `2025-12-16T10:00:00Z` |
| `updated_at` | timestamp | ✅ | 更新日時 | `2025-12-16T15:30:00Z` |
| `created_by` | string | | 作成者 | `otsuki@wivid.co.jp` |
| `updated_by` | string | | 更新者 | `yamamoto@wivid.co.jp` |
| `tags` | array[string] | | タグ（検索用） | `["不動産", "金融", "スタートアップ"]` |

---

## 📝 データ入力フォーマット

### Google Spreadsheet推奨列

```
A: ID（自動）
B: 企業名 ✅
C: 企業規模
D: 業界
E: HP氏名1
F: HP役職1
G: HP氏名2
H: HP役職2
I: 役職レベル ✅（経営層/人事責任者）
J: 年齢層
K: 経歴
L: 成果・特徴
M: 紹介レベル ✅（B/B-/C+/C）
N: 学歴要件
O: 経験要件
P: 選考状況要件
Q: 志向性要件
R: 補足条件
S: 接触形式 ✅（個別面談/座談会/イベント）
T: 接触形式詳細
U: 得られる知見
V: 学べるポイント（カンマ区切り）
W: 推奨学生タイプ
X: 担当セールス ✅
Y: セールスメール
Z: 紹介フロー
AA: リードタイム
AB: 公開中 ✅（TRUE/FALSE）
```

---

## 🔄 データ運用フロー

```mermaid
graph LR
    A[セールスが情報入力] --> B[Spreadsheet]
    B --> C[データ検証]
    C --> D[Firestore同期]
    D --> E[サイトに自動反映]
    E --> F[CDが閲覧・紹介]
```

---

## 💡 次のステップ

1. **Google Spreadsheet作成** ← まずここから
2. **サンプルデータ入力**
3. **Firestoreへの同期スクリプト作成**
4. **サイトをFirestoreから動的表示に変更**
5. **管理画面UI作成（オプション）**

