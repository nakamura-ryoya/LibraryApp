## 参加方法
1. 以下のURLからGitをインストール  
https://gitforwindows.org/
(※インストール手順はこちらを参考に！：https://qiita.com/takeru-hirai/items/4fbe6593d42f9a844b1c)
3. Git Hubのアカウントを作成する（ある人はスキップ）  
Git Hubのアカウント作成はこちらから：https://github.com/signup?source=form-home-signup&user_email=
※ユーザを作成したら、ユーザー名を教えてください
4. Git Bash（Gitをインストール時に自動でインストールされてるはず）を起動し、以下のコマンドを実行  
~~~bash
git config --global user.name "（自分の名前）"
git config --global user.email "（社内メール）"
ssh-keygen
~~~
4. VsCodeを開き、作業ディレクトリからターミナルで以下のコマンドを実行
~~~bash
git remote add origin https://github.com/nakamura-ryoya/LibraryApp.git
git remote -v
~~~
実行後、以下が表示されればOK
~~~bash
origin  https://github.com/nakamura-ryoya/LibraryApp.git (fetch)
origin  https://github.com/nakamura-ryoya/LibraryApp.git (push)
~~~
5. ctrl+shift+pでコマンドパレットを開き、「Git: クローン」と検索
6. リポジトリURL（<https://github.com/nakamura-ryoya/LibraryApp.git>）を指定し、デスクトップで開く
7. デスクトップに「LibraryApp」フォルダがあれば環境構築完了！
