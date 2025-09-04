// booksearch.js

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
};

// =========================
// タグ選択 UI
// =========================
function updateHiddenTags() {
  const tags = Array.from(badgeInput.querySelectorAll(".tag-badge"))
    .map((b) => b.dataset.tag);
  hiddenTags.value = tags.join(" ");
}

function updateTagButtonStyles() {
  const selectedTags = Array.from(badgeInput.querySelectorAll(".tag-badge"))
    .map((b) => b.dataset.tag);

  document.querySelectorAll(".tag-btn").forEach((button) => {
    const tag = button.textContent.trim();
    button.classList.toggle("tag-btn-selected", selectedTags.includes(tag));
  });
}

function toggleTagBadge(tag) {
  const existing = Array.from(badgeInput.querySelectorAll(".tag-badge"))
    .find((b) => b.dataset.tag === tag);

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
  const selectedTags = Array.from(badgeInput.querySelectorAll(".tag-badge"))
    .map((b) => b.dataset.tag);

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
searchInput.addEventListener("focus", () => (tagContainer.style.display = "block"));

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

  const selectedTags = Array.from(document.querySelectorAll(".tag-badge"))
    .map((b) => b.dataset.tag);
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

// =========================
// 検索結果のカテゴリ表示件数を表示
// =========================
fetch("http://localhost:3000/categories")
  .then((res) => res.json())
  .then((categories) => {
    const params = new URLSearchParams(window.location.search);
    const tagIds = (params.get("tags") || "")
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    const selectedNames = categories
      .filter((cat) => tagIds.includes(Number(cat.id)))
      .map((cat) => `「${cat.category}」`);

    document.getElementById("selectedCategory").textContent =
      selectedNames.join("") || "すべて";
  });

fetch("http://localhost:3000/books")
  .then((res) => res.json())
  .then((books) => {
    const params = new URLSearchParams(window.location.search);
    const tagIds = (params.get("tags") || "")
      .split(",")
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    let filteredBooks = books;
    if (tagIds.length > 0) {
      filteredBooks = books.filter((book) =>
        tagIds.every((tagId) => book.category.includes(tagId))
      );
    }

    document.getElementById("resultBooksNumber").textContent =
      filteredBooks.length;
  });

// =========================
// 書籍データ取得と描画
// =========================
let allBooks = [];
let allCategories = [];
let filteredBooks = [];

function renderBooks(books, categories) {
  const container = document.getElementById("searchResult");
  container.innerHTML = "";

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.category]));

  books.forEach((book) => {
    // 評価（星）
    const stars = [];
    const fullStars = Math.floor(book.stars);
    const hasHalf = book.stars % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push('<i class="bi bi-star-fill text-warning"></i>');
    if (hasHalf) stars.push('<i class="bi bi-star-half text-warning"></i>');
    while (stars.length < 5) stars.push('<i class="bi bi-star text-warning"></i>');

    // 貸出状況
    const libraryStatus = [
      { name: "虎ノ門", status: book.library1 },
      { name: "新川", status: book.library2 },
      { name: "みなとみらい", status: book.library3 },
    ]
      .filter((lib) => lib.status !== "-1")
      .map((lib) => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <span>${lib.name}</span>
          ${lib.status === "1"
            ? `<span class="badge bg-success badge-fixed borrow-button"
                  data-book-id="${book.id}"
                  data-location="${lib.name}"
                  data-book-title="${book.title}">
                  借りる
                </span>`
            : `<span class="badge bg-danger badge-fixed">貸出中</span>`}
        </div>
      `)
      .join("");

    // カテゴリ
    const categoryBadges = (book.category || [])
      .map((id) => {
        const name = categoryMap[id];
        return name
          ? `<span class="badge rounded-pill badge-outline me-1 category-badge" data-tag="${name}" data-id="${id}">${name}</span>`
          : "";
      })
      .join("");

    // カードHTML
    const card = `
      <div class="card card-hover search-card mb-4 shadow-sm border-0" style="cursor: pointer" data-id="${book.id}">
        <div class="row g-0 align-items-stretch">
          <div class="col-md-3 d-flex justify-content-center align-items-center py-2 px-1 border-end">
            <img src="${book.image}" class="img-fluid rounded" alt="蔵書画像" />
          </div>
          <div class="col-md-6 p-3 border-end text-block">
            <h4 class="fw-bold mb-2 title-clamp-2">${book.title}</h4>
            <p class="rating mb-2">
              <strong>評価：</strong>
              ${stars.join("")}
              <span class="text-muted small mx-1">${book.stars} (${book.reviews}件)</span>
            </p>
            <p class="card-text tag-group">${categoryBadges}</p>
          </div>
          <div class="col-md-3 d-flex flex-column justify-content-center p-3">
            ${libraryStatus}
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", card);
  });

  if (books.length === 0) {
    container.innerHTML = "<p class='text-muted'>該当する本が見つかりませんでした。</p>";
  }

  // カテゴリバッジにイベント登録
  document.querySelectorAll(".category-badge").forEach((badge) => {
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTagBadge(badge.dataset.tag);

      const selectedTags = Array.from(document.querySelectorAll(".tag-badge"))
        .map((b) => b.dataset.tag);
      const selectedIds = selectedTags.map((t) => tagQueryMap[t]).filter(Boolean);
      const query = selectedIds.length > 0 ? `?tags=${selectedIds.join(",")}` : "";

      window.location.href = `/resources/booksearch.html${query}`;
    });
  });

  // カードクリックで詳細ページへ遷移
  document.querySelectorAll(".search-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".badge-fixed") || e.target.closest("[data-bs-toggle]")) {
        return;
      }
      const id = card.getAttribute("data-id");
      window.location.href = `/resources/bookDetail.html?id=${id}`;
    });
  });

  updateCategoryBadgeStyles();
}

// 初期データ取得
Promise.all([
  fetch("http://localhost:3000/books").then((res) => res.json()),
  fetch("http://localhost:3000/categories").then((res) => res.json()),
])
  .then(([books, categories]) => {
    allBooks = books;
    allCategories = categories;

    const params = new URLSearchParams(window.location.search);
    const tagIds = params.get("tags")?.split(",").map(Number).filter((id) => !isNaN(id)) || [];

    filteredBooks = tagIds.length
      ? allBooks.filter((b) => tagIds.every((id) => b.category.includes(id)))
      : allBooks;

    renderBooks(filteredBooks, allCategories);
  })
  .catch((err) => console.error("データ取得エラー:", err));

// =========================
// ソート処理
// =========================
function handleSortChange() {
  const sortValue = document.getElementById("sortSelect").value;

  let sortedBooks = [...filteredBooks];
  if (sortValue === "high") {
    sortedBooks.sort((a, b) => b.stars - a.stars);
  } else if (sortValue === "low") {
    sortedBooks.sort((a, b) => a.stars - b.stars);
  }
  renderBooks(sortedBooks, allCategories);
}

let selectedLocation = null;
let lastLogId = null;
let currentBook = null;

// 「借りる」ボタンクリック処理
document.addEventListener("click", (e) => {
  const target = e.target.closest(".borrow-button");
  if (!target) return;

  const bookId = Number(target.dataset.bookId);
  const location = target.dataset.location;
  const title = target.dataset.bookTitle;

  fetch("http://localhost:3000/logs")
    .then((res) => res.json())
    .then((logs) => {
      const maxId = logs.reduce((max, log) => Math.max(max, log.id || 0), 0);
      const newId = maxId + 1;
      lastLogId = String(newId);

      const logData = {
        id: lastLogId,
        memberId: 7,
        bookId: bookId,
        loanDate: new Date().toISOString().slice(0, 10), // 今日の日付
        returnDate: null,
        returnLocation: location,
        returnFlag: false,
      };

      // booksテーブルを更新
      let updateField = {};
      if (location === "虎ノ門") updateField = { library1: "0" };
      if (location === "新川") updateField = { library2: "0" };
      if (location === "みなとみらい") updateField = { library3: "0" };

      return fetch(`http://localhost:3000/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateField),
      })
        .then(() =>
          fetch("http://localhost:3000/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logData),
          })
        )
        .then(() => {
          selectedLocation = location;
          showBorrowToast(title, bookId);
        });
    })
    .catch((err) => {
      console.error("借りる処理に失敗:", err);
      alert("借りる処理に失敗しました");
    });
});

// 借りた通知トースト
function showBorrowToast(title, bookId) {
  const container = document.getElementById("toast-container") || (() => {
    const div = document.createElement("div");
    div.id = "toast-container";
    div.className = "toast-container position-fixed start-50 translate-middle-x bottom-0 p-3";
    document.body.appendChild(div);
    return div;
  })();

  const toast = document.createElement("div");
  toast.className =
    "toast fade show text-bg-secondary border-0 fs-6 px-4 py-3 rounded shadow";
  toast.innerHTML = `
    <div class="d-flex justify-content-between align-items-center w-100">
      <div class="toast-body"><strong>『${title}』を借りました。</strong></div>
      <button type="button" class="btn btn-outline-light me-2" id="cancelBorrow">取り消す</button>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toast);

  // 取り消し処理
  toast.querySelector("#cancelBorrow").addEventListener("click", () => {
    if (!lastLogId) return;

    fetch(`http://localhost:3000/logs/${lastLogId}`, { method: "DELETE" })
      .then(() => {
        let updateField = {};
        if (selectedLocation === "虎ノ門") updateField = { library1: "1" };
        if (selectedLocation === "新川") updateField = { library2: "1" };
        if (selectedLocation === "みなとみらい") updateField = { library3: "1" };

        return fetch(`http://localhost:3000/books/${bookId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateField),
        });
      })
      .then(() => {
        toast.remove();
        alert("借りる処理を取り消しました");
        lastLogId = null;
      })
      .catch(() => alert("取り消しに失敗しました"));
  });

  new bootstrap.Toast(toast, { autohide: false }).show();
}
