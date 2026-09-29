/*
 * ============================================================
 * モータースポーツ史
 * 年表データの読み込み・表示・カテゴリー自動生成
 * ============================================================
 *
 * data/timeline.json に保存されている歴史データを読み込み、
 *
 * 1. 年代順に並べる
 * 2. 年表として表示する
 * 3. JSON内のカテゴリーを自動収集する
 * 4. カテゴリーボタンを自動生成する
 * 5. カテゴリーで絞り込む
 *
 * という処理を行います。
 * ============================================================
 */


/*
 * ============================================================
 * 読み込んだ年表データを保持
 * ============================================================
 */
let allTimelineData = [];


/*
 * ============================================================
 * カテゴリー名の表示用ラベル
 * ============================================================
 *
 * JSONでは機械処理しやすい英語名を使い、
 * 画面では日本語名を表示します。
 *
 * 今後カテゴリーを追加した場合は、
 * 必要に応じてここへ日本語名を追加します。
 */
const categoryLabels = {
  history: "歴史",
  race: "レース",
  technology: "技術",
  driver: "ドライバー",
  team: "チーム",
  car: "車両",
  manufacturer: "メーカー",
  circuit: "サーキット",
  regulation: "レギュレーション",
  safety: "安全",
  culture: "文化",
  museum: "博物館",
  society: "社会"
};


/*
 * ============================================================
 * JSONデータを読み込む
 * ============================================================
 */
async function loadTimeline() {

  try {

    const response = await fetch("./data/timeline.json");

    if (!response.ok) {
      throw new Error(
        `timeline.json の読み込みに失敗しました: ${response.status}`
      );
    }

    const timelineData = await response.json();

    console.log("モータースポーツ史データを読み込みました。");
    console.log(timelineData);


    /*
     * ----------------------------------------------------------
     * 年代順に並べ替え
     * ----------------------------------------------------------
     */
    timelineData.sort((a, b) => {

      if (!a.time_span.start && !b.time_span.start) return 0;
      if (!a.time_span.start) return 1;
      if (!b.time_span.start) return -1;

      return new Date(a.time_span.start) - new Date(b.time_span.start);

    });


    /*
     * 全データを保存
     */
    allTimelineData = timelineData;


    /*
     * まず年表を全件表示
     */
    displayTimeline(allTimelineData);


    /*
     * JSONからカテゴリーを探して
     * フィルターボタンを自動生成
     */
    createCategoryFilters(allTimelineData);

  } catch (error) {

    console.error("年表データの読み込みエラー:", error);

    const timelineList = document.getElementById("timeline-list");

    if (timelineList) {
      timelineList.innerHTML =
        "<p>年表データを読み込むことができませんでした。</p>";
    }

  }

}


/*
 * ============================================================
 * 年表をHTMLへ表示
 * ============================================================
 */
function displayTimeline(timelineData) {

  const timelineList = document.getElementById("timeline-list");

  if (!timelineList) {
    console.error("timeline-list が見つかりません。");
    return;
  }

  timelineList.innerHTML = "";


  /*
   * 該当データが0件の場合
   */
  if (timelineData.length === 0) {

    const message = document.createElement("p");
    message.textContent = "該当する年表データはありません。";

    timelineList.appendChild(message);

    return;
  }


  /*
   * データを1件ずつ表示
   */
  timelineData.forEach((item) => {

    const article = document.createElement("article");

    article.className =
      `timeline-item ${item.display.scale}`;

    const date = document.createElement("p");
    date.className = "timeline-date";
    date.textContent = item.display.date_text;

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.className = "timeline-description";
    description.textContent = item.description;

    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(description);

    timelineList.appendChild(article);

  });

}


/*
 * ============================================================
 * JSONからカテゴリーを自動収集し、
 * フィルターボタンを作成
 * ============================================================
 */
function createCategoryFilters(timelineData) {

  /*
   * ボタンを置く場所
   */
  const filterContainer =
    document.getElementById("timeline-filters");

  if (!filterContainer) {
    console.error("timeline-filters が見つかりません。");
    return;
  }


  /*
   * 念のため、現在の内容を空にします。
   */
  filterContainer.innerHTML = "";


  /*
   * ----------------------------------------------------------
   * 全データからカテゴリーを集める
   * ----------------------------------------------------------
   *
   * Setを使うことで、
   * 同じカテゴリーが複数の出来事に入っていても
   * 重複せず1つだけ保持できます。
   */
  const categorySet = new Set();

  timelineData.forEach((item) => {

    if (!Array.isArray(item.categories)) {
      return;
    }

    item.categories.forEach((category) => {

      if (category) {
        categorySet.add(category);
      }

    });

  });


  /*
   * Setを配列へ変換します。
   *
   * 今のところは英字順に並べます。
   */
  const categories =
    Array.from(categorySet).sort();


  /*
   * ----------------------------------------------------------
   * 「すべて」ボタン
   * ----------------------------------------------------------
   */
  const allButton = document.createElement("button");

  allButton.type = "button";
  allButton.dataset.category = "all";
  allButton.textContent = "すべて";

  /*
   * 最初は「すべて」を選択状態にします。
   */
  allButton.classList.add("active");

  filterContainer.appendChild(allButton);


  /*
   * ----------------------------------------------------------
   * 各カテゴリーボタンを生成
   * ----------------------------------------------------------
   */
  categories.forEach((category) => {

    const button = document.createElement("button");

    button.type = "button";
    button.dataset.category = category;


    /*
     * categoryLabels に日本語名があれば日本語表示。
     *
     * 登録されていない新カテゴリーの場合は、
     * JSONのカテゴリー名をそのまま表示します。
     *
     * これにより、新しいカテゴリーをJSONへ追加しても
     * ボタン自体は必ず表示されます。
     */
    button.textContent =
      categoryLabels[category] || category;

    filterContainer.appendChild(button);

  });


  /*
   * ボタンを作った後、
   * クリック機能を設定します。
   */
  setupCategoryFilters();

}


/*
 * ============================================================
 * カテゴリーボタンのクリック処理
 * ============================================================
 */
function setupCategoryFilters() {

  const filterButtons =
    document.querySelectorAll("#timeline-filters button");


  filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const selectedCategory = button.dataset.category;


      /*
       * 「すべて」
       */
      if (selectedCategory === "all") {

        displayTimeline(allTimelineData);

      } else {

        /*
         * 選択されたカテゴリーを含むデータだけ抽出
         */
        const filteredData =
          allTimelineData.filter((item) => {

            return (
              Array.isArray(item.categories) &&
              item.categories.includes(selectedCategory)
            );

          });

        displayTimeline(filteredData);

      }


      /*
       * 選択中のボタンを切り替え
       */
      filterButtons.forEach((filterButton) => {
        filterButton.classList.remove("active");
      });

      button.classList.add("active");

    });

  });

}


/*
 * ============================================================
 * ページ読み込み時の開始処理
 * ============================================================
 */
loadTimeline();
