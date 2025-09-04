(function () {
  const stars = Array.from(document.querySelectorAll(".star"));
  const input = document.getElementById("ratingVal");
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

  // ホバーした瞬間に確定（クリックやタッチでもOK）
  stars.forEach((star) => {
    const v = Number(star.dataset.value);
    star.addEventListener("mouseenter", () => paint(v)); // マウスを重ねるだけで確定
    star.addEventListener("click", () => paint(v)); // クリックでも変更
    star.addEventListener("touchstart", () => paint(v), {
      passive: true,
    }); // タッチ
    star.addEventListener("focus", () => paint(v)); // キーボードでフォーカス
  });

  // キーボード（← →）での変更
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

  // リセット時
  document
    .getElementById("reviewForm")
    .addEventListener("reset", () => setTimeout(() => paint(0)));
  // 初期描画
  paint(Number(input.value));
})();
