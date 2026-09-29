/*
 * ============================================================
 * モータースポーツ史
 * 年表データの読み込み・表示・カテゴリー自動生成・典拠表示
 * ============================================================
 */


/*
 * 読み込んだ全データを保持します。
 */
let allTimelineData = [];


/*
 * ============================================================
 * カテゴリー名の日本語表示
 * ============================================================
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
     * 最初は全件表示
     */
    displayTimeline(allTimelineData);


    /*
     * JSONからカテゴリーを自動生成
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
 * 年表を画面に表示
 * ============================================================
 */
function displayTimeline(timelineData) {

  const timelineList = document.getElementById("timeline-list");

  if (!timelineList) {
    console.error("timeline-list が見つかりません。");
    return;
  }

  /*
   * 現在の表示をいったん消します。
   */
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
   * 年表データを1件ずつ表示
   */
  timelineData.forEach((item) => {

    /*
     * ----------------------------------------------------------
     * 1件分のカード
     * ----------------------------------------------------------
     */
    const article = document.createElement("article");

    article.className =
      `timeline-item ${item.display.scale}`;


    /*
     * ----------------------------------------------------------
     * 日付
     * ----------------------------------------------------------
     */
    const date = document.createElement("p");

    date.className = "timeline-date";
    date.textContent = item.display.date_text;


    /*
     * ----------------------------------------------------------
     * タイトル
     * ----------------------------------------------------------
     */
    const title = document.createElement("h3");

    title.textContent = item.title;


    /*
     * ----------------------------------------------------------
     * 説明文
     * ----------------------------------------------------------
     */
    const description = document.createElement("p");

    description.className = "timeline-description";
    description.textContent = item.description;


    /*
     * ==========================================================
     * カテゴリータグ
     * ==========================================================
     */
    const categoryTags = document.createElement("div");

    categoryTags.className = "timeline-categories";


    if (Array.isArray(item.categories)) {

      item.categories.forEach((category) => {

        const tag = document.createElement("span");

        tag.className = "timeline-category-tag";

        tag.textContent =
          categoryLabels[category] || category;

        categoryTags.appendChild(tag);

      });

    }


    /*
     * ==========================================================
     * 典拠
     * ==========================================================
     *
     * sources にデータがある場合だけ表示します。
     */
    const sourceBox = document.createElement("div");

    sourceBox.className = "timeline-sources";


    if (Array.isArray(item.sources) && item.sources.length > 0) {

      /*
       * 「典拠」という見出し
       */
      const sourceTitle = document.createElement("p");

      sourceTitle.className = "timeline-sources-title";
      sourceTitle.textContent = "典拠";

      sourceBox.appendChild(sourceTitle);


      /*
       * sourcesを1件ずつ表示
       */
      item.sources.forEach((source) => {

        const sourceItem = document.createElement("p");

        sourceItem.className = "timeline-source-item";


        /*
         * 表示用文字列を作ります。
         */
        const parts = [];

        if (source.title) {
          parts.push(source.title);
        }

        if (source.author) {
          parts.push(source.author);
        }

        if (source.publisher) {
          parts.push(source.publisher);
        }

        if (source.year) {
          parts.push(String(source.year));
        }

        if (source.note) {
          parts.push(source.note);
        }


        /*
         * URLがある場合はリンク表示
         */
        if (source.url) {

          const link = document.createElement("a");

          link.href = source.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";

          link.textContent =
            source.title || "参照リンク";

          sourceItem.appendChild(link);


          /*
           * 資料名以外の情報を後ろに表示
           */
          const extraParts = parts.filter((part) => {
            return part !== source.title;
          });

          if (extraParts.length > 0) {

            sourceItem.append(
              document.createTextNode(
                " / " + extraParts.join(" / ")
              )
            );

          }

        } else {

          /*
           * URLがない場合
           */
          sourceItem.textContent =
            parts.length > 0
              ? parts.join(" / ")
              : "典拠情報未登録";

        }


        sourceBox.appendChild(sourceItem);

      });

    }


    /*
     * ==========================================================
     * カードに各要素を追加
     * ==========================================================
     */
    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(description);
    article.appendChild(categoryTags);
    article.appendChild(sourceBox);


    /*
     * 年表全体へ追加
     */
    timelineList.appendChild(article);

  });

}


/*
 * ============================================================
 * JSONからカテゴリーを集めてフィルターボタンを作る
 * ============================================================
 */
function createCategoryFilters(timelineData) {

  const filterContainer =
    document.getElementById("timeline-filters");

  if (!filterContainer) {
    console.error("timeline-filters が見つかりません。");
    return;
  }


  /*
   * 既存ボタンを空にします。
   */
  filterContainer.innerHTML = "";


  /*
   * カテゴリーを重複なしで収集
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
   * 配列へ変換して英字順
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

  allButton.classList.add("active");

  filterContainer.appendChild(allButton);


  /*
   * ----------------------------------------------------------
   * 各カテゴリーボタン
   * ----------------------------------------------------------
   */
  categories.forEach((category) => {

    const button = document.createElement("button");

    button.type = "button";
    button.dataset.category = category;

    button.textContent =
      categoryLabels[category] || category;

    filterContainer.appendChild(button);

  });


  /*
   * クリック処理を設定
   */
  setupCategoryFilters();

}


/*
 * ============================================================
 * カテゴリーフィルターのクリック処理
 * ============================================================
 */
function setupCategoryFilters() {

  const filterButtons =
    document.querySelectorAll("#timeline-filters button");


  filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const selectedCategory =
        button.dataset.category;


      /*
       * 「すべて」
       */
      if (selectedCategory === "all") {

        displayTimeline(allTimelineData);

      } else {

        /*
         * 指定カテゴリーだけ抽出
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
       * 選択中ボタンの表示切替
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
 * ページ読み込み時に開始
 * ============================================================
 */
loadTimeline();
