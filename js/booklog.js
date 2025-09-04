            const tagContainer = document.getElementById("tagContainer");
            const badgeInput = document.getElementById("badgeInput");
            const hiddenTags = document.getElementById("hiddenTags");

                searchInput.addEventListener("focus", () => {
                  tagContainer.style.display = "block";
                });

                document.addEventListener("click", (event) => {
                  const isClickInside =
                    badgeInput.contains(event.target) ||
                    tagContainer.contains(event.target);
                  if (!isClickInside) {
                    tagContainer.style.display = "none";
                  }
                });

                function updateHiddenTags() {
                  const tags = Array.from(
                    badgeInput.querySelectorAll(".tag-badge")
                  ).map((b) => b.dataset.tag);
                  hiddenTags.value = tags.join(" ");
                }

                function updateTagButtonStyles() {
                  const selectedTags = Array.from(
                    badgeInput.querySelectorAll(".tag-badge")
                  ).map((b) => b.dataset.tag);

                  document.querySelectorAll(".tag-btn").forEach((button) => {
                    const tag = button.textContent.trim();
                    if (selectedTags.includes(tag)) {
                      button.classList.add("tag-btn-selected");
                    } else {
                      button.classList.remove("tag-btn-selected");
                    }
                  });
                }

                function toggleTagBadge(tag) {
                  const existingBadge = Array.from(
                    badgeInput.querySelectorAll(".tag-badge")
                  ).find((b) => b.dataset.tag === tag);

                  if (existingBadge) {
                    existingBadge.remove();
                  } else {
                    const badge = document.createElement("span");
                    badge.className =
                      "badge rounded-pill badge-outline me-1 tag-badge";
                    badge.dataset.tag = tag;
                    badge.innerHTML = `${tag} <span class="ms-1 remove-btn" style="cursor:pointer;">&times;</span>`;

                    badge
                      .querySelector(".remove-btn")
                      .addEventListener("click", (event) => {
                        event.stopPropagation();
                        badge.remove();
                        updateHiddenTags();
                        updateTagButtonStyles();
                      });

                    badgeInput.insertBefore(badge, searchInput);
                  }

                  updateHiddenTags();
                  updateTagButtonStyles();
                }

                document.querySelectorAll(".tag-btn").forEach((button) => {
                  button.addEventListener("click", () => {
                    const tag = button.textContent.trim();
                    toggleTagBadge(tag);
                  });
                });
                searchInput.addEventListener("keydown", (event) => {
                  if (
                    event.key === "Backspace" &&
                    searchInput.value === "" // 入力欄が空のとき
                  ) {
                    const tagBadges = badgeInput.querySelectorAll(".tag-badge");
                    if (tagBadges.length > 0) {
                      const lastBadge = tagBadges[tagBadges.length - 1];
                      lastBadge.remove();
                      updateHiddenTags();
                      updateTagButtonStyles();
                    }
                  }
                });
                document
                  .querySelector(".search-form")
                  .addEventListener("submit", (event) => {
                    event.preventDefault(); // デフォルトの送信を防止
                    // タグ名とクエリパラメータのマッピング
                    const tagQueryMap = {
                      初心者向け: "1",
                      中級者向け: "2",
                      上級者向け: "3",
                      文学・評論: "4",
                      ビジネス: "5",
                      AWS: "6",
                      自己啓発: "7",
                      暮らし・健康: "8",
                      アート・デザイン: "9",
                      インフラ系: "10",
                      アプリ: "11",
                      コンサル: "12",
                      営業: "13",
                      マネジメント: "14",
                      データ: "15",
                      // 必要に応じて追加
                    };
                    // 選択されたタグを取得
          const selectedTags = Array.from(
            document.querySelectorAll(".tag-badge")
          ).map((badge) => badge.dataset.tag);

          // 対応するIDを取得
          const selectedIds = selectedTags
            .map((tag) => tagQueryMap[tag])
            .filter((id) => id !== undefined);

          // クエリパラメータを生成
          const queryString = selectedIds.length > 0 ? `?tags=${selectedIds.join(",")}` : "";

          // URLを設定して送信
          const form = event.target;
          const targetUrl = `/resources/booksearch.html${queryString}`;
          window.location.href = targetUrl;
                  });
    
      document.addEventListener("DOMContentLoaded", () => {
        const loginMember = 7;
        Promise.all([
          fetch("http://localhost:3000/logs").then((res) => res.json()),
          fetch("http://localhost:3000/books").then((res) => res.json()),
          fetch(`http://localhost:3000/members/${loginMember}`).then((res) =>
            res.json()
          ),
        ])
          .then(([logs, books, member]) => {
            const container = document.getElementById("logCardContainer");

            // memberIdが7のログだけ抽出
            console.log("取得したメンバーID:", member.id);
            console.log("取得したログ一覧:", logs);
            // 石倉さんの貸出履歴
            const filteredLogs = logs.filter(
              (log) => log.memberId === Number(member.id)
            );
            console.log(filteredLogs);

            filteredLogs.forEach((log) => {
              console.log(log.bookId);
              const book = books.find((b) => Number(b.id) === log.bookId);
              console.log("book", book);
              if (!book) return;

              const card = document.createElement("div");
              card.className = "card card-hover mb-4 shadow-sm border-0";
              card.style.maxWidth = "1200px";
              card.style.margin = "auto";

              card.innerHTML = `
                        <div class="row g-0">
                          <a href="bookDetail.html?id=${
                            book.id
                          }" class="stretched-link"></a>
                          <!-- 画像 -->
                          <div class="col-md-2 d-flex justify-content-center align-items-center py-2 px-1 border-end">
                            <img src="${
                              book.image
                            }" class="img-fluid rounded" alt="蔵書画像" style="max-height: 100px; width: 75px; height: 100px" />
                          </div>

                          <!-- タイトル -->
                          <div class="col-md-5 d-flex flex-column justify-content-center p-3 border-end">
                            <small class="text-muted fw-semibold">タイトル</small>
                            <h4 class="fw-bold text-dark mt-2 title-clamp-2">${
                              book.title
                            }</h4>
                          </div>

                          <!-- 貸出日 -->
                          <div class="col-md-2 d-flex flex-column justify-content-center p-3 border-end">
                            <small class="text-muted text-center fw-semibold">貸出日</small>
                            <h6 class="fw-bold text-primary text-center mt-2 mb-0">${
                              log.loanDate
                            }</h6>
                          </div>

                          <!-- 返却日 -->
                          <div class="col-md-2 d-flex flex-column justify-content-center p-3 border-end">
                            <small class="text-muted text-center fw-semibold">返却日</small>
                            <h6 class="fw-bold text-center mt-2 mb-0">
                              <span class="returnInfo">
                                ${log.returnDate || "ー"}<br/>（${
                log.returnLocation
              }）
                              </span>
                            </h6>
                          </div>

                          <!-- 返却ボタン -->
                            ${
                              log.returnFlag
                                ? `<div class="col-md-1 d-flex flex-column justify-content-center p-3 border-end">
                                    <span class="btn btn-outline-success mt-2 mt-sm-0">
                                      返却済
                                    </span>
                                  </div>`
                                : `<div class="col-md-1 d-flex flex-column justify-content-center p-3 border-end">
                                    <span class="btn bg-primary return-button mt-2 mt-sm-0" data-bs-toggle="modal" data-bs-target="#returnModal">
                                      返却する
                                    </span>
                                  </div>`
                            }
                        </div>
                      </div>`;

              container.appendChild(card);

              const returnBtn = card.querySelector(".return-button");
              if (returnBtn) {
                returnBtn.addEventListener("click", function () {
                  document.querySelectorAll(".card").forEach((c) => {
                    c.removeAttribute("data-active");
                  });
                  card.setAttribute("data-active", "true");
                  card.setAttribute("data-book-id", book.id);
                  card.setAttribute("data-log-id", log.id);
                });
              }
            });
          })
          .catch((error) => {
            console.error("データの取得に失敗しました:", error);
          });
      });
    

    
      // ID：confirmReturnにクリックイベントを追加（確定ボタンを押したときの処理）
      document
        .getElementById("confirmReturn")
        .addEventListener("click", function () {
          // 選択したカードを特定
          const activeCard = document.querySelector(
            ".card[data-active='true']"
          );
          console.log(activeCard);
          if (!activeCard) return;

          // 今日の日付を取得
          const today = new Date();
          const formattedDate =
            today.getFullYear() +
            "/" +
            String(today.getMonth() + 1).padStart(2, "0") +
            "/" +
            String(today.getDate()).padStart(2, "0");

          // 返却日＋場所の表示を日付だけに置き換える
          const returnInfoEl = activeCard.querySelector(".returnInfo");

          // ユーザが入力した評価と難易度とコメントの取得
          const rating = document.getElementById("rating").value;
          const difficulty =
            document.querySelector('input[name="level"]:checked')?.value || "";
          const comment = document.getElementById("comment").value;
          const bookId = parseInt(activeCard.getAttribute("data-book-id"));
          const logId = parseInt(activeCard.getAttribute("data-log-id"));

          // 最後のレビューIDを取得して新しいIDを決定（仮にAPIがIDを自動生成しない場合）
          fetch("http://localhost:3000/reviews")
            .then((response) => response.json())
            .then((reviews) => {
              const maxId =
                reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) : 0;
              const newId = maxId + 1;
              const memberId = 7;

              // 新しいレビューオブジェクトを作成
              const newReview = {
                id: String(newId),
                memberId: parseInt(memberId),
                bookId: parseInt(bookId),
                stars: parseInt(rating),
                difficulty: parseInt(difficulty),
                comment: comment,
              };

              // POSTリクエストでレビューを追加（reviewsに新規データ追加）
              fetch("http://localhost:3000/reviews", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newReview),
              })
                .then((res) => {
                  if (!res.ok) throw new Error("レビューの追加に失敗しました");
                  return res.json();
                })
                .then((data) => {
                  console.log("レビュー追加成功:", data);
                  fetch(`http://localhost:3000/logs/${logId}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      returnFlag: true,
                      returnDate: String(formattedDate),
                    }),
                  })
                    .then((res) => {
                      debugger;
                      if (!res.ok) throw new Error("ログの更新に失敗しました");
                      return res.json();
                    })
                    .then((updatedLog) => {
                      console.log("ログ更新成功:", updatedLog);
                      if (returnInfoEl) {
                        returnInfoEl.textContent = formattedDate;
                      }
                      const modal = bootstrap.Modal.getInstance(
                        document.getElementById("returnModal")
                      );
                      modal.hide();
                    })
                    .catch((error) => {
                      console.error("ログ更新エラー:", error);
                    });
                })
                .catch((error) => {
                  console.error("エラー:", error);
                });
            });
        });
    