/*
 * ============================================================
 * モータースポーツ史
 * 年表データの読み込み・表示・カテゴリー絞り込み
 * ============================================================
 *
 * data/timeline.json に保存されている歴史データを読み込み、
 *
 * 1. 年代順に並べる
 * 2. 年表として表示する
 * 3. カテゴリーで絞り込む
 *
 * という処理を行います。
 * ============================================================
 */


/*
 * ============================================================
 * 読み込んだ年表データを保持する場所
 * ============================================================
 *
 * カテゴリーボタンを押したときにも同じデータを使えるよう、
 * 関数の外側に保存しておきます。
 */
let allTimelineData = [];


/*
 * ============================================================
 * JSONデータを読み込む
 * ============================================================
 */
async function loadTimeline() {

  try {

    /*
     * timeline.json を読み込みます。
     */
    const response = await fetch("./data/timeline.json");


    /*
     * ファイルが見つからないなど、
     * HTTPエラーが発生した場合は処理を止めます。
     */
    if (!response.ok) {
      throw new Error(
        `timeline.json の読み込みに失敗しました: ${response.status}`
      );
    }


    /*
     * JSONをJavaScriptの配列へ変換します。
     */
    const timelineData = await response.json();


    /*
     * 開発時の確認用です。
     */
    console.log("モータースポーツ史データを読み込みました。");
    console.log(timelineData);


    /*
     * ----------------------------------------------------------
     * 年代順に並べ替える
     * ----------------------------------------------------------
     *
     * 人間向けの display.date_text ではなく、
     * 機械処理用の time_span.start を使用します。
     */
    timelineData.sort((a, b) => {

      /*
       * start がないデータは最後へ送ります。
       */
      if (!a.time_span.start && !b.time_span.start) return 0;
      if (!a.time_span.start) return 1;
      if (!b.time_span.start) return -1;


      /*
       * ISO形式の日付を比較します。
       */
      return new Date(a.time_span.start) - new Date(b.time_span.start);

    });


    /*
     * 絞り込みに使えるよう、
     * 読み込んだ全データを保存します。
     */
    allTimelineData = timelineData;


    /*
     * 最初は全件表示します。
     */
    displayTimeline(allTimelineData);


    /*
     * カテゴリーボタンを使えるようにします。
     */
    setupCategoryFilters();

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
 * 年表をHTMLへ表示する
 * ============================================================
 */
function displayTimeline(timelineData) {

  const timelineList = document.getElementById("timeline-list");


  /*
   * 表示場所が存在しなければ終了します。
   */
  if (!timelineList) {
    console.error("timeline-list が見つかりません。");
    return;
  }


  /*
   * 現在表示されている内容をいったん消します。
   *
   * カテゴリーを変更するたびに、
   * 新しい絞り込み結果を描き直すためです。
   */
  timelineList.innerHTML = "";


  /*
   * 該当するデータが0件だった場合。
   */
  if (timelineData.length === 0) {

    const message = document.createElement("p");
    message.textContent = "該当する年表データはありません。";

    timelineList.appendChild(message);

    return;
  }


  /*
   * データを1件ずつ年表へ追加します。
   */
  timelineData.forEach((item) => {

    /*
     * 1件分のカード。
     */
    const article = document.createElement("article");


    /*
     * display.scale の spot / span を
     * classとして追加します。
     */
    article.className =
      `timeline-item ${item.display.scale}`;


    /*
     * 表示用の日付。
     */
    const date = document.createElement("p");
    date.className = "timeline-date";
    date.textContent = item.display.date_text;


    /*
     * タイトル。
     */
    const title = document.createElement("h3");
    title.textContent = item.title;


    /*
     * 説明文。
     */
    const description = document.createElement("p");
    description.className = "timeline-description";
    description.textContent = item.description;


    /*
     * カードへ追加します。
     */
    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(description);


    /*
     * 年表へカードを追加します。
     */
    timelineList.appendChild(article);

  });

}


/*
 * ============================================================
 * カテゴリーフィルターを準備する
 * ============================================================
 */
function setupCategoryFilters() {

  /*
   * index.html の
   *
   * data-category="..."
   *
   * を持つボタンをすべて取得します。
   */
  const filterButtons =
    document.querySelectorAll("#timeline-filters button");


  /*
   * 各ボタンにクリック処理を設定します。
   */
  filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

      /*
       * 押されたボタンのカテゴリーを取得します。
       *
       * 例：
       * all
       * history
       * race
       * technology
       */
      const selectedCategory = button.dataset.category;


      /*
       * 「すべて」が選ばれた場合は、
       * 元の全データをそのまま表示します。
       */
      if (selectedCategory === "all") {

        displayTimeline(allTimelineData);

      } else {

        /*
         * categories配列の中に、
         * 選択されたカテゴリーが含まれているデータだけを
         * 抽出します。
         *
         * 1つの出来事に複数カテゴリーが設定されていても
         * 正しく検索できます。
         */
        const filteredData = allTimelineData.filter((item) => {

          return (
            Array.isArray(item.categories) &&
            item.categories.includes(selectedCategory)
          );

        });


        /*
         * 絞り込み結果を表示します。
         */
        displayTimeline(filteredData);

      }


      /*
       * --------------------------------------------------------
       * どのボタンが選択されているかを記録
       * --------------------------------------------------------
       *
       * 後でCSSから見た目を変えられるように、
       * activeというclassを付けます。
       */

      filterButtons.forEach((filterButton) => {
        filterButton.classList.remove("active");
      });

      button.classList.add("active");

    });

  });


  /*
   * ページを開いた直後は
   * 「すべて」を選択状態にします。
   */
  const allButton =
    document.querySelector(
      '#timeline-filters button[data-category="all"]'
    );

  if (allButton) {
    allButton.classList.add("active");
  }

}


/*
 * ============================================================
 * ページ読み込み時の開始処理
 * ============================================================
 */
loadTimeline();
