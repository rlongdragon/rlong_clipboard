# 線上剪貼簿
簡易的線上剪貼簿，使用 sqlite3 儲存資料。

[online demo](https://clipboard.rlongdragon.com/)

## API
```
[GET] / 網頁介面

[POST]/api/create 建立新剪貼簿
請求格式: {content: ""}

[GET] /api/get/[ID] 取得剪貼簿
回覆格式: {content: ""} 
```

## 架設
```
git clone https://github.com/rlongdragon/rlong_clipboard.git
cd rlong_clipboard
npm i
node server.js
```

建議使用 pm2 部屬
```
pm2 start server.js -n clipboard --max-restarts 10
```