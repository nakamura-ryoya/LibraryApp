// =========================
// 要素参照
// =========================
const tagContainer = document.getElementById("tagContainer");
const badgeInput = document.getElementById("badgeInput");
const hiddenTags = document.getElementById("hiddenTags");
const searchInput = document.getElementById("searchInput");

// タグ名とIDのマッピング
const tagQueryMap = {
  初心者向け: "1",
  中級者向け: "2",
  上級者向け: "3",
  "文学・評論": "4",
  ビジネス: "5",
  AWS: "6",
  自己啓発: "7",
  "暮らし・健康": "8",
  "アート・デザイン": "9",
  インフラ系: "10",
  アプリ: "11",
  コンサル: "12",
  営業: "13",
  マネジメント: "14",
  データ: "15",
};

// =========================
// タグ選択 UI
// =========================
function updateHiddenTags() {
  const tags = Array.from(badgeInput.querySelectorAll(".tag-badge")).map(
    (b) => b.dataset.tag
  );
  hiddenTags.value = tags.join(" ");
}

function updateTagButtonStyles() {
  const selectedTags = Array.from(
    badgeInput.querySelectorAll(".tag-badge")
  ).map((b) => b.dataset.tag);

  document.querySelectorAll(".tag-btn").forEach((button) => {
    const tag = button.textContent.trim();
    button.classList.toggle("tag-btn-selected", selectedTags.includes(tag));
  });
}

function toggleTagBadge(tag) {
  const existing = Array.from(badgeInput.querySelectorAll(".tag-badge")).find(
    (b) => b.dataset.tag === tag
  );

  if (existing) {
    existing.remove();
  } else {
    const badge = document.createElement("span");
    badge.className = "badge rounded-pill badge-outline me-1 tag-badge";
    badge.dataset.tag = tag;
    badge.innerHTML = `${tag} <span class="ms-1 remove-btn" style="cursor:pointer;">&times;</span>`;

    badge.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      badge.remove();
      updateHiddenTags();
      updateTagButtonStyles();
      updateCategoryBadgeStyles();
    });

    badgeInput.insertBefore(badge, searchInput);
  }

  updateHiddenTags();
  updateTagButtonStyles();
  updateCategoryBadgeStyles();
}

function updateCategoryBadgeStyles() {
  const selectedTags = Array.from(
    badgeInput.querySelectorAll(".tag-badge")
  ).map((b) => b.dataset.tag);

  document.querySelectorAll(".category-badge").forEach((badge) => {
    if (selectedTags.includes(badge.dataset.tag)) {
      badge.classList.remove("badge-outline");
      badge.classList.add("bg-primary", "text-white");
    } else {
      badge.classList.add("badge-outline");
      badge.classList.remove("bg-primary", "text-white");
    }
  });
}

// =========================
// イベント登録
// =========================
searchInput.addEventListener(
  "focus",
  () => (tagContainer.style.display = "block")
);

document.addEventListener("click", (e) => {
  if (!badgeInput.contains(e.target) && !tagContainer.contains(e.target)) {
    tagContainer.style.display = "none";
  }
});

document.querySelectorAll(".tag-btn").forEach((btn) => {
  btn.addEventListener("click", () => toggleTagBadge(btn.textContent.trim()));
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Backspace" && searchInput.value === "") {
    const badges = badgeInput.querySelectorAll(".tag-badge");
    if (badges.length > 0) {
      badges[badges.length - 1].remove();
      updateHiddenTags();
      updateTagButtonStyles();
      updateCategoryBadgeStyles();
    }
  }
});

document.querySelector(".search-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedTags = Array.from(document.querySelectorAll(".tag-badge")).map(
    (b) => b.dataset.tag
  );
  const selectedIds = selectedTags.map((t) => tagQueryMap[t]).filter(Boolean);

  const query = selectedIds.length > 0 ? `?tags=${selectedIds.join(",")}` : "";
  window.location.href = `/resources/booksearch.html${query}`;
});

// =========================
// ページロード時にタグ復元
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tagsParam = params.get("tags");

  if (tagsParam) {
    tagsParam.split(",").forEach((id) => {
      const tag = Object.keys(tagQueryMap).find((k) => tagQueryMap[k] === id);
      if (tag) toggleTagBadge(tag);
    });
  }
});

// =========================
// ログイン中のメンバーを表示
// =========================
fetch(`http://localhost:3000/members/7`)
  .then((res) => res.json())
  .then((member) => {
    document.getElementById("loginMember").textContent = `${member.name}`;
  })
  .catch((err) => console.error("メンバー情報取得エラー:", err));

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
      filteredLogs.sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate));
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
                                ${log.returnDate || "ー"}</span><br/>（${
          log.returnLocation
        }）
                              
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

// 確定ボタンを押したときの処理
// 評価と難易度が選択されているかのチェック
//
document.addEventListener("DOMContentLoaded", () => {
  const ratingSelect = document.getElementById("rating");
  const levelRadios = document.querySelectorAll("input[name='level']");
  const confirmButton = document.getElementById("confirmReturn");
  const ratingError = document.getElementById("ratingError");
  const levelError = document.getElementById("levelError");

  confirmButton.addEventListener("click", () => {
    // --- バリデーション ---
    const ratingSelected = ratingSelect.value !== "0";
    const levelSelected = Array.from(levelRadios).some(
      (radio) => radio.checked
    );

    let hasError = false;

    if (!ratingSelected) {
      ratingError.textContent = "評価（星）を選択してください。";
      ratingError.style.display = "block";
      hasError = true;
    } else {
      ratingError.textContent = "";
      ratingError.style.display = "none";
    }

    if (!levelSelected) {
      levelError.textContent = "難易度を選択してください。";
      levelError.style.display = "block";
      hasError = true;
    } else {
      levelError.textContent = "";
      levelError.style.display = "none";
    }

    // エラーがあれば処理中断
    if (hasError) return;

    // --- レビュー送信処理 ---
    const activeCard = document.querySelector(".card[data-active='true']");
    if (!activeCard) return;

    const today = new Date();
    const formattedDate =
      today.getFullYear() +
      "/" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "/" +
      String(today.getDate()).padStart(2, "0");

    const returnInfoEl = activeCard.querySelector(".returnInfo");
    const rating = document.getElementById("rating").value;
    const difficulty =
      document.querySelector('input[name="level"]:checked')?.value || "";
    const comment = document.getElementById("comment").value;
    const bookId = parseInt(activeCard.getAttribute("data-book-id"));
    const logId = parseInt(activeCard.getAttribute("data-log-id"));

    const btnContainer =
      activeCard.querySelector(".return-button").parentElement;
    btnContainer.innerHTML = `<span class="btn btn-outline-success mt-2 mt-sm-0">
                                      返却済
                                    </span>`;

    // reviewsテーブルへの書き込み
    fetch("http://localhost:3000/reviews")
      .then((response) => response.json())
      .then((reviews) => {
        const maxId =
          reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) : 0;
        const newId = maxId + 1;
        const memberId = 7;

        const newReview = {
          id: String(newId),
          memberId: memberId,
          bookId: bookId,
          stars: parseInt(rating),
          difficulty: parseInt(difficulty),
          comment: comment,
        };

        return fetch("http://localhost:3000/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newReview),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("レビューの追加に失敗しました");
        return res.json();
      })
      .then(() => {
        return fetch(`http://localhost:3000/logs/${logId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            returnFlag: true,
            returnDate: formattedDate,
          }),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("ログの更新に失敗しました");
        return res.json();
      })
      // .then((updatedLog) => {
      //   console.log("ログ更新成功:", updatedLog);
      //   if (returnInfoEl) {
      //     returnInfoEl.textContent = formattedDate;
      //   }
      //   const modal = bootstrap.Modal.getInstance(
      //     document.getElementById("returnModal")
      //   );
      //   modal.hide();
      // })
      .then((updatedLog) => {
        console.log("ログ更新成功:", updatedLog);
        if (returnInfoEl) {
          returnInfoEl.textContent = formattedDate;
        }

        // 🟡 返却場所が「虎ノ門」の場合、booksテーブルのlibrary1を"1"に更新
        if (updatedLog.returnLocation === "虎ノ門") {
          fetch(`http://localhost:3000/books/${bookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ library1: "1" }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("library1の更新に失敗しました");
              return res.json();
            })
            .then((updatedBook) => {
              console.log("library1更新成功:", updatedBook);
            })
            .catch((error) => {
              console.error("library1更新エラー:", error);
            });
        }

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("returnModal")
        );
        modal.hide();
      })
      .catch((error) => {
        console.error("エラー:", error);
      });
  });
});

// =========================
// 星評価 UI
// =========================
(function () {
  const stars = Array.from(document.querySelectorAll(".star"));
  const input = document.getElementById("rating");
  const readout = document.getElementById("readout");

  function paint(value) {
    stars.forEach((s, i) => {
      const on = i < value;
      s.classList.toggle("active", on);
      s.setAttribute("aria-checked", i + 1 === value ? "true" : "false");
    });
    input.value = value;
    readout.textContent = value ? `${value} / 5` : "未選択";
  }

  stars.forEach((star) => {
    const v = Number(star.dataset.value);
    star.addEventListener("mouseenter", () => paint(v));
    star.addEventListener("click", () => paint(v));
    star.addEventListener("touchstart", () => paint(v), { passive: true });
    star.addEventListener("focus", () => paint(v));
  });

  document.querySelector(".rating").addEventListener("keydown", (e) => {
    let v = Number(input.value) || 0;
    if (e.key === "ArrowRight") {
      v = Math.min(5, v + 1);
      paint(v);
      e.preventDefault();
    }
    if (e.key === "ArrowLeft") {
      v = Math.max(0, v - 1);
      paint(v);
      e.preventDefault();
    }
  });

  paint(Number(input.value));
})();
