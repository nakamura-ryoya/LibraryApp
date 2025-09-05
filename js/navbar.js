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
      badge.classList.add("tag-btn-selected", "text-white");
    } else {
      badge.classList.add("badge-outline");
      badge.classList.remove("tag-btn-selected", "text-white");
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
