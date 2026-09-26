# 讓路！汽車華容道

純 HTML、CSS、JavaScript 的汽車華容道遊戲，適合 GitHub Pages。不需要後端、API 金鑰或安裝 npm 套件。

## 遊玩

按住車輛並沿車身方向拖曳。車輛不會穿過其他車或超出棋盤。將紅車移到第三列最右側就會過關。一次連續滑動算一步，與題庫最少步數的定義相同。

- 476,118 題完整題庫，保留原 PDF 題號。
- 暖身、入門、進階、挑戰、專家、大師六種難度。
- 滑鼠選關、翻頁、隨機挑戰、復原、重玩與下一題，無須鍵盤輸入。
- 支援觸控拖曳及窄螢幕。
- 過關紀錄與最佳步數保存在目前瀏覽器的 localStorage；清除網站資料會移除紀錄，無跨裝置同步。

## 本機啟動

需要 Node.js 22 以上與 Python 3：

```sh
npm run dev
```

開啟 http://127.0.0.1:4173 。請透過 HTTP 開啟，直接雙擊 HTML 的 file:// 模式不支援模組及題庫讀取。

```sh
npm test
npm run build
```

靜態成品放在 `dist/`。所有遊戲及題庫資源皆使用相對路徑，支援 `https://帳號.github.io/儲存庫名稱/`。Google Fonts 無法連線時會使用系統字體。

## 部署到 GitHub Pages

1. 建立 GitHub repository，把本專案提交到 `main` 分支。保留 `data/`、`tests/`、`scripts/` 以及隱藏的 `.github/`、`.nojekyll`。
2. 到 repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
3. 推送 `main`，或在 **Actions → Deploy game to GitHub Pages → Run workflow** 手動執行。
4. 流程會測試、建置並部署 `dist/`，成功後在 Pages 設定頁或部署工作中取得網址。

若預設分支不叫 `main`，修改 `.github/workflows/pages.yml` 的 `branches`。

官方說明：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

原始題庫的 PDF 與 ZIP 不需要上傳（已用 `.gitignore` 排除）；它們不會包含在網站成品中。網站只需約 21 MB 的分片 JSON，每次按需載入 1,000 題（約 44 KB），沒有整份題庫的開場下載。

## 題庫來源與重新產生

資料來自使用者提供的 `汽車華容道題庫/資料/levels.json`，其說明標示來源為 [Michael Fogleman — Rush Hour](https://www.michaelfogleman.com/rush/)。每筆原始資料為 `[最少步數, 36字元棋盤, 可達狀態數]`。網站保留前兩欄，分成 477 份 JSON。

若本機仍有原始題庫，可執行 `python3 scripts/prepare_levels.py` 更新分片。一般部署不需要原始題庫。

`npm test` 會檢查全部題目的幾何形狀與難度範圍、碰撞與邊界、過關條件，並用 BFS 獨立驗算前十個代表題的最少步數。
