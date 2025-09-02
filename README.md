## 参加方法

1. 以下の URL から Git をインストール  
   https://gitforwindows.org/  
   (※インストール手順はこちらを参考に！：https://qiita.com/takeru-hirai/items/4fbe6593d42f9a844b1c)
2. Git Hub のアカウントを作成する（ある人はスキップ）  
   Git Hub のアカウント作成はこちらから：https://github.com/signup?source=form-home-signup&user_email=
   ※ユーザを作成したら、ユーザー名を教えてください
3. Git Bash（Git をインストール時に自動でインストールされてるはず）を起動し、以下のコマンドを実行

```bash
git config --global user.name "（自分の名前）"
git config --global user.email "（社内メール）"
ssh-keygen
```

4. VsCode を開き、作業ディレクトリからターミナルで以下のコマンドを実行

```bash
git remote add origin https://github.com/nakamura-ryoya/LibraryApp.git
git remote -v
```

実行後、以下が表示されれば OK

```bash
origin  https://github.com/nakamura-ryoya/LibraryApp.git (fetch)
origin  https://github.com/nakamura-ryoya/LibraryApp.git (push)
```

5. ctrl+shift+p でコマンドパレットを開き、「Git: クローン」と検索
6. リポジトリ URL（<https://github.com/nakamura-ryoya/LibraryApp.git>）を指定し、デスクトップで開く
7. デスクトップに「LibraryApp」フォルダがあれば環境構築完了！

## json サーバーの起動方法

1. 以下の URL から Node.js をインストール  
   インストーラ：<https://nodejs.org/ja/>  
   （必ず参照：<https://qiita.com/ryome/items/eec08b28aff294e8c3d6>）  
   ※npm などががうまく機能しない場合は、npm.cmd で実行してください。その他、コマンドがうまく認識されないときは、VsCode を再起動するとうまくいくかも？
2. 以下のコマンドを作業ディレクトリで実行

```bash
npm.cmd install -g json-server
json-server.cmd --watch jsons/db.json --port 3000
```

無事 json サーバーが立ち上がると以下の表示が出るはず

```bash
JSON Server started on PORT :3000
Press CTRL-C to stop
Watching jsons/db.json...

♡⸜(˶˃ ᵕ ˂˶)⸝♡

Index:
http://localhost:3000/

Static files:
Serving ./public directory if it exists

Endpoints:
http://localhost:3000/posts
http://localhost:3000/comments
http://localhost:3000/profile
```

3. index.html を開いて、書籍一覧に書籍が 2 冊表示されれば OK
