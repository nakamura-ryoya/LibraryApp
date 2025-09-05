// booksearch.js

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

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, c.category])
  );

  books.forEach((book) => {
    // 評価（星）
    const stars = [];
    const fullStars = Math.floor(book.stars);
    const hasHalf = book.stars % 1 !== 0;
    for (let i = 0; i < fullStars; i++)
      stars.push('<i class="bi bi-star-fill text-warning"></i>');
    if (hasHalf) stars.push('<i class="bi bi-star-half text-warning"></i>');
    while (stars.length < 5)
      stars.push('<i class="bi bi-star text-warning"></i>');

    // 貸出状況
    const libraryStatus = [
      { name: "虎ノ門", status: book.library1 },
      { name: "新川", status: book.library2 },
      { name: "みなとみらい", status: book.library3 },
    ]
      .filter((lib) => lib.status !== "-1")
      .map(
        (lib) => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <span>${lib.name}</span>
          ${
            lib.status === "1"
              ? `<span class="badge bg-success badge-fixed borrow-button"
                  data-book-id="${book.id}"
                  data-location="${lib.name}"
                  data-book-title="${book.title}">
                  借りる
                </span>`
              : `<span class="badge bg-danger badge-fixed">貸出中</span>`
          }
        </div>
      `
      )
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

    // お気に入りに追加or削除を絶対に切り替える！
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".favorite-btn, .remove-favorite");
      if (!btn) return;

      e.stopPropagation(); // カード遷移を防ぐ
      const bookId = btn.dataset.id;
      const favoritesKey = "favorites";
      let favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];

      const isFavorite = favorites.includes(bookId);

      if (isFavorite) {
        // 削除処理
        favorites = favorites.filter((id) => id !== bookId);
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));

        // ボタンを「追加」に切り替え
        btn.innerHTML = `<i class="bi bi-heart"></i> お気に入りに追加`;
        btn.classList.remove("btn-outline-secondary", "remove-favorite");
        btn.classList.add("btn-outline-danger", "favorite-btn");
      } else {
        // 追加処理
        favorites.push(bookId);
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));

        // ボタンを「削除」に切り替え
        btn.innerHTML = `<i class="bi bi-x"></i> お気に入りから削除`;
        btn.classList.remove("btn-outline-danger", "favorite-btn");
        btn.classList.add("btn-outline-secondary", "remove-favorite");
      }
    });

    // お気に入り追加or削除
    const favoritesKey = "favorites";
    let favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    const isFavorite = favorites.includes(book.id);

    const buttonHTML = isFavorite
      ? `<button class="btn btn-outline-secondary btn-sm mt-2 remove-favorite" data-id="${book.id}"
  style="width: 170px;">
       <i class="bi bi-x"></i> お気に入りから削除
     </button>`
      : `<button class="btn btn-outline-danger btn-sm mt-2 favorite-btn" data-id="${book.id}"
  style="width: 170px;">
       <i class="bi bi-heart"></i> お気に入りに追加
     </button>`;

    // カードHTML
    const card = `
      <div class="card card-hover search-card mb-4 shadow-sm border-0" style="cursor: pointer" data-id="${
        book.id
      }">
        <div class="row g-0 align-items-stretch">
          <div class="col-md-3 d-flex justify-content-center align-items-center py-2 px-1 border-end">
            <img src="${book.image}" class="img-fluid rounded" alt="蔵書画像" />
          </div>
          <div class="col-md-6 p-3 border-end text-block">
            <h4 class="fw-bold mb-2 title-clamp-2">${book.title}</h4>
            <p class="rating mb-2">
              <strong>評価：</strong>
              ${stars.join("")}
              <span class="text-muted small mx-1">${book.stars} (${
      book.reviews
    }件)</span>
            </p>
            <p class="card-text tag-group">${categoryBadges}</p>
             ${buttonHTML} 
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
    container.innerHTML =
      "<p class='text-muted'>該当する本が見つかりませんでした。</p>";
  }

  // カテゴリバッジにイベント登録
  document.querySelectorAll(".category-badge").forEach((badge) => {
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTagBadge(badge.dataset.tag);

      const selectedTags = Array.from(
        document.querySelectorAll(".tag-badge")
      ).map((b) => b.dataset.tag);
      const selectedIds = selectedTags
        .map((t) => tagQueryMap[t])
        .filter(Boolean);
      const query =
        selectedIds.length > 0 ? `?tags=${selectedIds.join(",")}` : "";

      window.location.href = `/resources/booksearch.html${query}`;
    });
  });

  // カードクリックで詳細ページへ遷移
  document.querySelectorAll(".search-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        e.target.closest(".badge-fixed") ||
        e.target.closest("[data-bs-toggle]") ||
        e.target.closest(".favorite-btn") || // ← 追加！
        e.target.closest(".remove-favorite") // ← 追加！
      ) {
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
    const tagIds =
      params
        .get("tags")
        ?.split(",")
        .map(Number)
        .filter((id) => !isNaN(id)) || [];

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
          renderLibraryList();
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
  const container =
    document.getElementById("toast-container") ||
    (() => {
      const div = document.createElement("div");
      div.id = "toast-container";
      div.className =
        "toast-container position-fixed start-50 translate-middle-x bottom-0 p-3";
      document.body.appendChild(div);
      return div;
    })();

  const toast = document.createElement("div");
  toast.className =
    "toast fade animate-slide-up align-items-center custom-width text-bg-secondary border-0 show fs-5 px-4 py-3 rounded shadow";
  toast.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
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
        if (selectedLocation === "みなとみらい")
          updateField = { library3: "1" };

        return fetch(`http://localhost:3000/books/${bookId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateField),
        });
      })
      .then(() => {
        toast.remove();
        renderLibraryList();
        showToast("借りる処理を取り消しました", "outline-secondary");
        lastLogId = null;
      })
      .catch(() => alert("取り消しに失敗しました"));
  });

  new bootstrap.Toast(toast, { autohide: false }).show();
}

function renderLibraryList() {
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
      renderBooks(filteredBooks, allCategories);
    })
    .catch((err) => {
      console.error("蔵書情報の取得に失敗:", err);
      alert("蔵書情報の取得に失敗しました");
    });
}

function showToast(message, type = "dark") {
  const toastContainer = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast fade animate-slide-up custom-width align-items-center text-bg-${type} border-0 show fs-5 px-4 py-3 rounded shadow`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        `;

  toastContainer.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
}
