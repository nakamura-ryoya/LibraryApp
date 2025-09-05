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
