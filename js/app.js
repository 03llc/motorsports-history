/*
 * ============================================================
 * モータースポーツ史
 * 年表データの読み込み・表示
 * ============================================================
 *
 * data/timeline.json に保存されている歴史データを読み込み、
 * 年代順に並べてHTMLへ表示します。
 *
 * 歴史データそのものはHTMLには書かず、
 * timeline.json 側で管理する方針です。
 * ============================================================
 */


/*
 * JSONデータを読み込む関数
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
     * ブラウザのConsoleにも読み込んだデータを表示します。
     */
    console.log("モータースポーツ史データを読み込みました。");
    console.log(timelineData);


    /*
     * ----------------------------------------------------------
     * 年代順に並べ替える
     * ----------------------------------------------------------
     *
     * 画面に表示する date_text ではなく、
     * 機械処理用の time_span.start を使います。
     *
     * これが今回のデータ設計の重要なポイントです。
     */
    timelineData.sort((a, b) => {

      /*
       * start が存在しないデータは最後へ送ります。
       */
      if (!a.time_span.start) return 1;
      if (!b.time_span.start) return -1;


      /*
       * ISO形式の日付を比較します。
       */
      return new Date(a.time_span.start) - new Date(b.time_span.start);

    });


    /*
     * 並べ替えたデータを画面へ表示します。
     */
    displayTimeline(timelineData);

  } catch (error) {

    /*
     * エラー内容をConsoleへ表示します。
     */
    console.error("年表データの読み込みエラー:", error);


    /*
     * 利用者にもエラーが分かるように、
     * 年表エリアへメッセージを表示します。
     */
    const timelineList = document.getElementById("timeline-list");

    if (timelineList) {
      timelineList.innerHTML =
        "<p>年表データを読み込むことができませんでした。</p>";
    }

  }

}


/*
 * ============================================================
 * 年表をHTMLへ表示する関数
 * ============================================================
 */
function displayTimeline(timelineData) {

  /*
   * index.html に作った
   *
   * <div id="timeline-list">
   *
   * を取得します。
   */
  const timelineList = document.getElementById("timeline-list");


  /*
   * 表示場所が見つからなければ処理を終了します。
   */
  if (!timelineList) {
    console.error("timeline-list が見つかりません。");
    return;
  }


  /*
   * 「読み込んでいます...」という初期表示を消します。
   */
  timelineList.innerHTML = "";


  /*
   * timeline.json のデータを1件ずつ処理します。
   */
  timelineData.forEach((item) => {

    /*
     * 1件の歴史情報を囲むarticle要素を作ります。
     */
    const article = document.createElement("article");


    /*
     * spot / span をCSSで区別できるように
     * class名として付けておきます。
     *
     * 例：
     * timeline-item spot
     * timeline-item span
     */
    article.className =
      `timeline-item ${item.display.scale}`;


    /*
     * 表示用の日付を作ります。
     *
     * ここでは time_span.start ではなく、
     * 人間向けの display.date_text を使います。
     */
    const date = document.createElement("p");
    date.className = "timeline-date";
    date.textContent = item.display.date_text;


    /*
     * 出来事のタイトルを作ります。
     */
    const title = document.createElement("h3");
    title.textContent = item.title;


    /*
     * 出来事の説明文を作ります。
     */
    const description = document.createElement("p");
    description.className = "timeline-description";
    description.textContent = item.description;


    /*
     * articleの中へ、
     *
     * 日付
     * ↓
     * タイトル
     * ↓
     * 説明
     *
     * の順番で追加します。
     */
    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(description);


    /*
     * 完成した1件の歴史情報を
     * 年表全体へ追加します。
     */
    timelineList.appendChild(article);

  });

}


/*
 * ============================================================
 * ページ読み込み時の開始処理
 * ============================================================
 *
 * index.html から app.js が読み込まれたら、
 * timeline.json の読み込みを開始します。
 */
loadTimeline();
