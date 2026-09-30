// ============================================================
// モータースポーツ史
// app.js
// ============================================================
//
// このファイルでは、主に次の処理を行います。
//
// ・timeline.json から年表を表示
// ・年表のカテゴリ絞り込み
// ・people.json から人物を表示
// ・人物を生年順に並べる
// ・人物ライフラインを表示
// ・年表イベントを人物ライフラインへ重ねる
// ・イベント年をタップするとタイトル＋説明文を表示
// ・選択中イベントの縦線を強調
// ・circuits.json からサーキットを読み込む
// ・サーキットを開場順に表示
//
// ============================================================



// ============================================================
// 読み込んだデータを保持
// ============================================================
//
// JSONから取得したデータを、
// 他の関数からも利用できるように保存しておきます。
//
// ============================================================


// 年表データ
let allTimelineData = [];


// 人物データ
let allPeopleData = [];


// サーキットデータ
let allCircuitData = [];



// ============================================================
// カテゴリ名
// ============================================================
//
// timeline.json の categories に入っている英語キーを、
// 画面では日本語で表示します。
//
// ============================================================

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



// ============================================================
// 年表データを読み込む
// ============================================================

async function loadTimeline() {

  try {

    /*
     * data/timeline.json を読み込みます。
     */
    const response =
      await fetch(
        "./data/timeline.json"
      );


    /*
     * HTTPエラーの場合。
     */
    if (!response.ok) {

      throw new Error(
        "年表データを読み込めませんでした。"
      );
    }


    /*
     * JSONとして読み込みます。
     */
    const timelineData =
      await response.json();


    /*
     * 年表を古い順に並べます。
     *
     * time_span.start が早いものから表示します。
     */
    timelineData.sort(
      (a, b) => {

        const dateA =
          a.time_span?.start || "";

        const dateB =
          b.time_span?.start || "";

        return dateA.localeCompare(
          dateB
        );
      }
    );


    /*
     * 全体データとして保存します。
     */
    allTimelineData =
      timelineData;


    /*
     * 年表を画面表示します。
     */
    displayTimeline(
      allTimelineData
    );


    /*
     * カテゴリフィルターを作ります。
     */
    createCategoryFilters(
      allTimelineData
    );


    /*
     * people.json の方が先に読み込まれていた場合、
     * timeline.json が読み込まれた時点で
     * 人物ライフラインを描き直します。
     *
     * 年表イベントの縦線を
     * ライフライン上に表示するためです。
     */
    if (
      allPeopleData.length > 0
    ) {

      displayPeopleLifeline(
        allPeopleData
      );
    }


  } catch (error) {

    console.error(
      error
    );


    const timelineList =
      document.getElementById(
        "timeline-list"
      );


    if (timelineList) {

      timelineList.innerHTML =
        "<p>年表データを読み込むことができませんでした。</p>";
    }
  }
}



// ============================================================
// 年表表示
// ============================================================

function displayTimeline(
  timelineData
) {

  /*
   * 年表の表示先を取得します。
   */
  const timelineList =
    document.getElementById(
      "timeline-list"
    );


  /*
   * HTML側に表示先がなければ終了します。
   */
  if (!timelineList) {

    return;
  }


  /*
   * 再描画に備えて、
   * いったん表示を空にします。
   */
  timelineList.innerHTML = "";


  /*
   * データがない場合。
   */
  if (
    !Array.isArray(
      timelineData
    ) ||
    timelineData.length === 0
  ) {

    timelineList.innerHTML =
      "<p>該当する年表データはありません。</p>";

    return;
  }


  /*
   * 年表を1件ずつ表示します。
   */
  timelineData.forEach(
    (item) => {


      // ======================================================
      // 年表カード本体
      // ======================================================

      const article =
        document.createElement(
          "article"
        );


      /*
       * spot / span のどちらかを取得します。
       */
      const scale =
        item.display?.scale ||
        "spot";


      article.className =
        `timeline-item ${scale}`;



      // ======================================================
      // 年
      // ======================================================

      const date =
        document.createElement(
          "p"
        );


      date.className =
        "timeline-date";


      date.textContent =
        item.display?.date_text ||
        "年代不明";



      // ======================================================
      // タイトル
      // ======================================================

      const title =
        document.createElement(
          "h3"
        );


      title.textContent =
        item.title ||
        "タイトル未登録";



      // ======================================================
      // 説明文
      // ======================================================

      const description =
        document.createElement(
          "p"
        );


      description.className =
        "timeline-description";


      description.textContent =
        item.description ||
        "";


      /*
       * 基本情報をカードへ追加します。
       */
      article.appendChild(
        date
      );

      article.appendChild(
        title
      );

      article.appendChild(
        description
      );



      // ======================================================
      // カテゴリ
      // ======================================================

      if (
        Array.isArray(
          item.categories
        ) &&
        item.categories.length > 0
      ) {

        const categoryBox =
          document.createElement(
            "div"
          );


        categoryBox.className =
          "timeline-categories";


        item.categories.forEach(
          (category) => {

            const tag =
              document.createElement(
                "span"
              );


            tag.className =
              "timeline-category-tag";


            tag.textContent =
              categoryLabels[category] ||
              category;


            categoryBox.appendChild(
              tag
            );
          }
        );


        article.appendChild(
          categoryBox
        );
      }



      // ======================================================
      // 典拠
      // ======================================================

      if (
        Array.isArray(
          item.sources
        ) &&
        item.sources.length > 0
      ) {

        /*
         * 典拠欄全体。
         */
        const sourceBox =
          document.createElement(
            "div"
          );


        sourceBox.className =
          "timeline-sources";


        /*
         * 「典拠」という見出し。
         */
        const sourceTitle =
          document.createElement(
            "p"
          );


        sourceTitle.className =
          "timeline-sources-title";


        sourceTitle.textContent =
          "典拠";


        sourceBox.appendChild(
          sourceTitle
        );


        /*
         * 登録されている資料を1件ずつ表示します。
         */
        item.sources.forEach(
          (source) => {

            const sourceItem =
              document.createElement(
                "p"
              );


            sourceItem.className =
              "timeline-source-item";


            /*
             * 空欄でない情報だけをまとめます。
             */
            const sourceParts = [];


            if (source.title) {

              sourceParts.push(
                source.title
              );
            }


            if (source.author) {

              sourceParts.push(
                source.author
              );
            }


            if (source.publisher) {

              sourceParts.push(
                source.publisher
              );
            }


            if (source.year) {

              sourceParts.push(
                String(
                  source.year
                )
              );
            }


            if (source.note) {

              sourceParts.push(
                source.note
              );
            }


            const sourceText =
              sourceParts.length > 0
                ? sourceParts.join(" / ")
                : "典拠情報未登録";


            /*
             * URLがある場合はリンクにします。
             */
            if (source.url) {

              const link =
                document.createElement(
                  "a"
                );


              link.href =
                source.url;


              link.target =
                "_blank";


              link.rel =
                "noopener noreferrer";


              link.textContent =
                sourceText;


              sourceItem.appendChild(
                link
              );


            } else {

              /*
               * URLがなければ通常の文字列として表示。
               */
              sourceItem.textContent =
                sourceText;
            }


            sourceBox.appendChild(
              sourceItem
            );
          }
        );


        article.appendChild(
          sourceBox
        );
      }


      /*
       * 完成した年表カードを追加します。
       */
      timelineList.appendChild(
        article
      );
    }
  );
}



// ============================================================
// カテゴリボタン生成
// ============================================================

function createCategoryFilters(
  timelineData
) {

  /*
   * フィルターボタンの表示先。
   */
  const filterBox =
    document.getElementById(
      "timeline-filters"
    );


  if (!filterBox) {

    return;
  }


  /*
   * 一度空にして再生成します。
   */
  filterBox.innerHTML = "";


  /*
   * 重複しないカテゴリ一覧を作るため、
   * Setを使用します。
   */
  const categorySet =
    new Set();


  timelineData.forEach(
    (item) => {

      if (
        Array.isArray(
          item.categories
        )
      ) {

        item.categories.forEach(
          (category) => {

            categorySet.add(
              category
            );
          }
        );
      }
    }
  );


  /*
   * Setから通常の配列へ変換します。
   */
  const categories =
    Array.from(
      categorySet
    );


  /*
   * 日本語表示名の順番で並べます。
   */
  categories.sort(
    (a, b) => {

      return (
        categoryLabels[a] ||
        a
      ).localeCompare(
        categoryLabels[b] ||
        b,
        "ja"
      );
    }
  );



  // ==========================================================
  // 「すべて」ボタン
  // ==========================================================

  const allButton =
    document.createElement(
      "button"
    );


  allButton.type =
    "button";


  allButton.dataset.category =
    "all";


  allButton.className =
    "active";


  allButton.textContent =
    "すべて";


  filterBox.appendChild(
    allButton
  );



  // ==========================================================
  // 各カテゴリのボタン
  // ==========================================================

  categories.forEach(
    (category) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.dataset.category =
        category;


      button.textContent =
        categoryLabels[category] ||
        category;


      filterBox.appendChild(
        button
      );
    }
  );


  /*
   * ボタンにクリックイベントを設定します。
   */
  setupCategoryFilters();
}



// ============================================================
// カテゴリ絞り込み
// ============================================================

function setupCategoryFilters() {

  const filterBox =
    document.getElementById(
      "timeline-filters"
    );


  if (!filterBox) {

    return;
  }


  const buttons =
    filterBox.querySelectorAll(
      "button"
    );


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {


          /*
           * 押されたボタンのカテゴリ。
           */
          const selectedCategory =
            button.dataset.category;


          /*
           * いったんすべてのactiveを解除します。
           */
          buttons.forEach(
            (btn) => {

              btn.classList.remove(
                "active"
              );
            }
          );


          /*
           * 押されたボタンだけactiveにします。
           */
          button.classList.add(
            "active"
          );


          /*
           * 「すべて」が選ばれた場合。
           */
          if (
            selectedCategory ===
            "all"
          ) {

            displayTimeline(
              allTimelineData
            );

            return;
          }


          /*
           * 指定されたカテゴリを含む年表だけ抽出します。
           */
          const filteredData =
            allTimelineData.filter(
              (item) => {

                return (
                  Array.isArray(
                    item.categories
                  ) &&
                  item.categories.includes(
                    selectedCategory
                  )
                );
              }
            );


          displayTimeline(
            filteredData
          );
        }
      );
    }
  );
}



// ============================================================
// 人物データを読み込む
// ============================================================

async function loadPeople() {

  try {

    /*
     * people.jsonを取得します。
     */
    const response =
      await fetch(
        "./data/people.json"
      );


    if (!response.ok) {

      throw new Error(
        "人物データを読み込めませんでした。"
      );
    }


    const peopleData =
      await response.json();


    /*
     * 全体データとして保存します。
     */
    allPeopleData =
      peopleData;


    /*
     * 人物カードを表示します。
     */
    displayPeople(
      allPeopleData
    );


    /*
     * 人物ライフラインを表示します。
     */
    displayPeopleLifeline(
      allPeopleData
    );


  } catch (error) {

    console.error(
      error
    );


    const peopleList =
      document.getElementById(
        "people-list"
      );


    if (peopleList) {

      peopleList.innerHTML =
        "<p>人物データを読み込むことができませんでした。</p>";
    }
  }
}



// ============================================================
// 人物カード表示
// ============================================================

function displayPeople(
  peopleData
) {

  /*
   * 人物一覧の表示先。
   */
  const peopleList =
    document.getElementById(
      "people-list"
    );


  if (!peopleList) {

    return;
  }


  peopleList.innerHTML = "";


  /*
   * データが存在しない場合。
   */
  if (
    !Array.isArray(
      peopleData
    ) ||
    peopleData.length === 0
  ) {

    peopleList.innerHTML =
      "<p>人物データはまだありません。</p>";

    return;
  }



  // ==========================================================
  // 人物の役割名
  // ==========================================================
  //
  // people.json 側では英語キーを使いますが、
  // 画面上は日本語で表示します。
  //
  // ==========================================================

  const roleLabels = {

    driver:
      "ドライバー",

    engineer:
      "技術者",

    designer:
      "デザイナー",

    founder:
      "創業者",

    manager:
      "監督・マネージャー",

    team_owner:
      "チームオーナー",

    businessperson:
      "実業家"

  };



  // ==========================================================
  // 人物を生年月日の古い順に並べる
  // ==========================================================
  //
  // people.json の登録順に依存せず、
  // birth の値を使って自動的に並べます。
  //
  // 生年月日が不明な人物は最後へ送ります。
  //
  // ==========================================================

  const sortedPeople =
    [...peopleData].sort(
      (a, b) => {

        const birthA =
          a.lifespan?.birth ||
          "9999-12-31";

        const birthB =
          b.lifespan?.birth ||
          "9999-12-31";


        return birthA.localeCompare(
          birthB
        );
      }
    );



  // ==========================================================
  // 人物カードを作る
  // ==========================================================

  sortedPeople.forEach(
    (person) => {


      /*
       * 1人分のカード。
       */
      const article =
        document.createElement(
          "article"
        );


      article.className =
        "person-item";



      // --------------------------------------------------------
      // 人物名
      // --------------------------------------------------------

      const name =
        document.createElement(
          "h3"
        );


      name.textContent =
        person.name ||
        "名称未登録";


      article.appendChild(
        name
      );



      // --------------------------------------------------------
      // 役割
      // --------------------------------------------------------

      if (
        Array.isArray(
          person.roles
        ) &&
        person.roles.length > 0
      ) {

        const roles =
          document.createElement(
            "p"
          );


        roles.className =
          "person-roles";


        /*
         * roleLabels に登録されていれば日本語へ変換。
         *
         * 未登録のroleは、
         * JSONに書かれた文字をそのまま表示します。
         */
        roles.textContent =
          person.roles
            .map(
              (role) =>
                roleLabels[role] ||
                role
            )
            .join(" / ");


        article.appendChild(
          roles
        );
      }



      // --------------------------------------------------------
      // 生没年月日
      // --------------------------------------------------------

      const lifespan =
        document.createElement(
          "p"
        );


      lifespan.className =
        "person-lifespan";


      lifespan.textContent =
        person.display?.lifespan_text ||
        "生没年月日：未登録";


      article.appendChild(
        lifespan
      );


      /*
       * 完成した人物カードを表示します。
       */
      peopleList.appendChild(
        article
      );
    }
  );
}



// ============================================================
// サーキットデータを読み込む
// ============================================================

async function loadCircuits() {

  try {

    /*
     * data/circuits.json を取得します。
     */
    const response =
      await fetch(
        "./data/circuits.json"
      );


    /*
     * 404などの場合。
     */
    if (!response.ok) {

      throw new Error(
        "サーキットデータを読み込めませんでした。"
      );
    }


    /*
     * JSONとして読み込みます。
     */
    const circuitData =
      await response.json();


    /*
     * 全体で利用できるように保存します。
     */
    allCircuitData =
      circuitData;


    /*
     * サーキット一覧を画面へ表示します。
     */
    displayCircuits(
      allCircuitData
    );


    /*
     * 開発中の確認用です。
     *
     * デベロッパーツールのConsoleに
     * 読み込んだデータを表示します。
     */
    console.log(
      "サーキットデータを読み込みました。",
      allCircuitData
    );


  } catch (error) {

    console.error(
      error
    );


    /*
     * サーキット表示欄がある場合は、
     * 読み込みエラーを画面にも表示します。
     */
    const circuitList =
      document.getElementById(
        "circuit-list"
      );


    if (circuitList) {

      circuitList.innerHTML =
        "<p>サーキットデータを読み込むことができませんでした。</p>";
    }
  }
}



// ============================================================
// サーキットカード表示
// ============================================================

function displayCircuits(
  circuitData
) {

  /*
   * HTML側の
   *
   * <div id="circuit-list"></div>
   *
   * を取得します。
   */
  const circuitList =
    document.getElementById(
      "circuit-list"
    );


  /*
   * 表示先がない場合は、
   * 何もしないで終了します。
   */
  if (!circuitList) {

    return;
  }


  /*
   * 再描画に備えて空にします。
   */
  circuitList.innerHTML = "";


  /*
   * データがない場合。
   */
  if (
    !Array.isArray(
      circuitData
    ) ||
    circuitData.length === 0
  ) {

    circuitList.innerHTML =
      "<p>サーキットデータはまだありません。</p>";

    return;
  }



  // ==========================================================
  // 開場順に並べる
  // ==========================================================
  //
  // circuits.json の並び順ではなく、
  // history.opened を使います。
  //
  // ==========================================================

  const sortedCircuits =
    [...circuitData].sort(
      (a, b) => {

        const openedA =
          a.history?.opened ||
          "9999";

        const openedB =
          b.history?.opened ||
          "9999";


        return openedA.localeCompare(
          openedB
        );
      }
    );



  // ==========================================================
  // サーキットを1件ずつ表示
  // ==========================================================

  sortedCircuits.forEach(
    (circuit) => {


      /*
       * 1サーキット分のカード。
       */
      const article =
        document.createElement(
          "article"
        );


      article.className =
        "circuit-item";



      // --------------------------------------------------------
      // サーキット名
      // --------------------------------------------------------

      const name =
        document.createElement(
          "h3"
        );


      name.textContent =
        circuit.name ||
        "名称未登録";


      article.appendChild(
        name
      );



      // --------------------------------------------------------
      // 所在地
      // --------------------------------------------------------

      const location =
        document.createElement(
          "p"
        );


      location.className =
        "circuit-location";


      /*
       * 所在地として表示する項目を
       * 一度配列へ入れます。
       */
      const locationParts = [];


      if (
        circuit.location?.prefecture
      ) {

        locationParts.push(
          circuit.location.prefecture
        );
      }


      if (
        circuit.location?.city
      ) {

        locationParts.push(
          circuit.location.city
        );
      }


      /*
       * 例：
       *
       * 静岡県 小山町
       * 三重県 鈴鹿市
       */
      location.textContent =
        locationParts.length > 0
          ? locationParts.join(" ")
          : "所在地未登録";


      article.appendChild(
        location
      );



      // --------------------------------------------------------
      // 開場・閉場期間
      // --------------------------------------------------------

      const history =
        document.createElement(
          "p"
        );


      history.className =
        "circuit-history";


      /*
       * circuits.json の
       *
       * display.history_text
       *
       * をそのまま使用します。
       */
      history.textContent =
        circuit.display?.history_text ||
        "開場年：未登録";


      article.appendChild(
        history
      );


      /*
       * 完成したカードを一覧へ追加します。
       */
      circuitList.appendChild(
        article
      );
    }
  );
}



// ============================================================
// 人物ライフライン比較
// ============================================================

function displayPeopleLifeline(
  peopleData
) {

  /*
   * ライフラインの表示先。
   */
  const chart =
    document.getElementById(
      "people-lifeline-chart"
    );


  if (!chart) {

    return;
  }



  // ==========================================================
  // 生年月日がある人物だけを対象にする
  // ==========================================================

  const validPeople =
    Array.isArray(
      peopleData
    )
      ? peopleData.filter(
          (person) =>
            person.lifespan?.birth
        )
      : [];


  /*
   * 対象となる人物がいない場合。
   */
  if (
    validPeople.length === 0
  ) {

    chart.innerHTML =
      "<p>生年月日が登録された人物がありません。</p>";

    return;
  }



  // ==========================================================
  // 現在年
  // ==========================================================

  const currentYear =
    new Date().getFullYear();



  // ==========================================================
  // 人物の生年・没年を数値化
  // ==========================================================

  const peopleWithYears =
    validPeople.map(
      (person) => {


        /*
         * YYYY-MM-DD の先頭4文字を
         * 生年として取得します。
         */
        const birthYear =
          parseInt(
            person.lifespan.birth
              .substring(
                0,
                4
              ),
            10
          );


        /*
         * 没年月日がある場合は没年。
         *
         * 存命の場合は現在年を使います。
         */
        const deathYear =
          person.lifespan.death
            ? parseInt(
                person.lifespan.death
                  .substring(
                    0,
                    4
                  ),
                10
              )
            : currentYear;


        /*
         * 元の人物データに、
         * birthYear と deathYear を加えます。
         */
        return {

          ...person,

          birthYear,

          deathYear

        };
      }
    );



  // ==========================================================
  // ライフラインも生年順に並べる
  // ==========================================================

  peopleWithYears.sort(
    (a, b) => {

      return (
        a.birthYear -
        b.birthYear
      );
    }
  );



  // ==========================================================
  // 年表イベント
  // ==========================================================
  //
  // timeline.json に登録された出来事を、
  // 人物ライフライン上に縦線として表示するため、
  // 開始年を取得します。
  //
  // ==========================================================

  const timelineEvents =
    allTimelineData

      /*
       * start がある出来事だけ。
       */
      .filter(
        (item) =>
          item.time_span?.start
      )

      /*
       * eventYearを追加。
       */
      .map(
        (item) => {

          return {

            ...item,

            eventYear:
              parseInt(
                item.time_span.start
                  .substring(
                    0,
                    4
                  ),
                10
              )

          };
        }
      )

      /*
       * 年へ変換できなかったデータを除外。
       */
      .filter(
        (item) =>
          !Number.isNaN(
            item.eventYear
          )
      );



  // ==========================================================
  // 時間軸の範囲
  // ==========================================================

  /*
   * 最も古い人物の生年。
   */
  const earliestPersonYear =
    Math.min(
      ...peopleWithYears.map(
        (person) =>
          person.birthYear
      )
    );


  /*
   * 最も古い年表イベント。
   */
  const earliestEventYear =
    timelineEvents.length > 0
      ? Math.min(
          ...timelineEvents.map(
            (event) =>
              event.eventYear
          )
        )
      : earliestPersonYear;


  /*
   * 人物またはイベントの
   * どちらか古い方を開始年にします。
   */
  const minYear =
    Math.min(
      earliestPersonYear,
      earliestEventYear
    );


  /*
   * 現在年または人物の没年のうち
   * 一番新しいものを終了年にします。
   */
  const maxYear =
    Math.max(

      currentYear,

      ...peopleWithYears.map(
        (person) =>
          person.deathYear
      )
    );


  /*
   * 時間軸の総年数。
   */
  const totalYears =
    maxYear -
    minYear;


  /*
   * 正常な時間幅が作れない場合。
   */
  if (
    totalYears <= 0
  ) {

    chart.innerHTML =
      "<p>ライフラインを計算できませんでした。</p>";

    return;
  }


  /*
   * 再描画に備えて空にします。
   */
  chart.innerHTML = "";



  // ==========================================================
  // 年代目盛り
  // ==========================================================

  const scaleRow =
    document.createElement(
      "div"
    );


  scaleRow.className =
    "lifeline-scale";


  /*
   * 20年単位の最初の年。
   *
   * 例：
   * minYear が1863なら、
   * 最初の表示目盛りは1880になります。
   */
  const scaleStart =
    Math.ceil(
      minYear / 20
    ) * 20;


  /*
   * 20年ごとの目盛りを作ります。
   */
  for (
    let year =
      scaleStart;

    year <=
      maxYear;

    year +=
      20
  ) {

    const marker =
      document.createElement(
        "div"
      );


    marker.className =
      "lifeline-scale-marker";


    /*
     * 横位置を百分率で求めます。
     */
    const position =
      (
        (
          year -
          minYear
        ) /
        totalYears
      ) * 100;


    marker.style.left =
      `${position}%`;


    /*
     * 年代ラベル。
     */
    const label =
      document.createElement(
        "span"
      );


    label.textContent =
      year;


    marker.appendChild(
      label
    );


    scaleRow.appendChild(
      marker
    );
  }



  // ==========================================================
  // イベント詳細表示欄
  // ==========================================================

  const eventInfo =
    document.createElement(
      "div"
    );


  eventInfo.className =
    "lifeline-event-info";


  /*
   * スクリーンリーダーにも
   * 内容変更を通知しやすくします。
   */
  eventInfo.setAttribute(
    "aria-live",
    "polite"
  );



  // ==========================================================
  // イベント年ボタン
  // ==========================================================

  timelineEvents.forEach(
    (event) => {


      /*
       * 表示範囲外のイベントは除外。
       */
      if (
        event.eventYear <
          minYear ||
        event.eventYear >
          maxYear
      ) {

        return;
      }


      const eventButton =
        document.createElement(
          "button"
        );


      eventButton.type =
        "button";


      eventButton.className =
        "lifeline-scale-event";


      /*
       * 同じイベントに対応する縦線を
       * 後で探せるようにします。
       */
      eventButton.dataset.eventId =
        event.id ||
        "";


      /*
       * イベント年の横位置。
       */
      const position =
        (
          (
            event.eventYear -
            minYear
          ) /
          totalYears
        ) * 100;


      eventButton.style.left =
        `${position}%`;


      /*
       * PCではマウスを重ねたときにも
       * 内容がわかります。
       */
      eventButton.title =
        `${event.eventYear}年 ${event.title || ""}`;


      /*
       * 表示する年。
       */
      const yearLabel =
        document.createElement(
          "span"
        );


      yearLabel.textContent =
        event.eventYear;


      eventButton.appendChild(
        yearLabel
      );



      // ======================================================
      // イベント年をタップ・クリックしたとき
      // ======================================================

      eventButton.addEventListener(
        "click",
        () => {


          /*
           * 前回表示した詳細を消します。
           */
          eventInfo.innerHTML =
            "";



          // --------------------------------------------------
          // 1行目：年＋タイトル
          // --------------------------------------------------

          const heading =
            document.createElement(
              "div"
            );


          heading.className =
            "lifeline-event-info-heading";


          const year =
            document.createElement(
              "strong"
            );


          year.textContent =
            `${event.eventYear}年`;


          const title =
            document.createElement(
              "span"
            );


          title.textContent =
            event.title ||
            "タイトル未登録";


          heading.appendChild(
            year
          );


          heading.appendChild(
            title
          );


          eventInfo.appendChild(
            heading
          );



          // --------------------------------------------------
          // 2行目：説明文
          // --------------------------------------------------

          if (
            event.description
          ) {

            const description =
              document.createElement(
                "p"
              );


            description.className =
              "lifeline-event-info-description";


            description.textContent =
              event.description;


            eventInfo.appendChild(
              description
            );
          }



          // ==================================================
          // 選択中イベント年ボタンを切り替える
          // ==================================================

          scaleRow
            .querySelectorAll(
              ".lifeline-scale-event"
            )
            .forEach(
              (button) => {

                button.classList.remove(
                  "active"
                );
              }
            );


          eventButton.classList.add(
            "active"
          );



          // ==================================================
          // すべてのイベント縦線からactiveを外す
          // ==================================================

          chart
            .querySelectorAll(
              ".lifeline-event-marker"
            )
            .forEach(
              (marker) => {

                marker.classList.remove(
                  "active"
                );
              }
            );



          // ==================================================
          // 選択したイベントの縦線だけ強調
          // ==================================================

          chart
            .querySelectorAll(
              `.lifeline-event-marker[data-event-id="${event.id || ""}"]`
            )
            .forEach(
              (marker) => {

                marker.classList.add(
                  "active"
                );
              }
            );
        }
      );


      scaleRow.appendChild(
        eventButton
      );
    }
  );



  // ==========================================================
  // 「現在」の目盛り
  // ==========================================================

  const currentMarker =
    document.createElement(
      "div"
    );


  currentMarker.className =
    "lifeline-scale-marker lifeline-scale-current";


  /*
   * 現在は時間軸の右端。
   */
  currentMarker.style.left =
    "100%";


  const currentLabel =
    document.createElement(
      "span"
    );


  currentLabel.textContent =
    "現在";


  currentMarker.appendChild(
    currentLabel
  );


  scaleRow.appendChild(
    currentMarker
  );


  /*
   * 年代目盛りを画面へ追加。
   */
  chart.appendChild(
    scaleRow
  );


  /*
   * イベント詳細欄を追加。
   */
  chart.appendChild(
    eventInfo
  );



  // ==========================================================
  // 人物ごとのライフライン
  // ==========================================================

  peopleWithYears.forEach(
    (person) => {


      /*
       * 1人分の行。
       */
      const row =
        document.createElement(
          "div"
        );


      row.className =
        "lifeline-row";



      // --------------------------------------------------------
      // 人物名
      // --------------------------------------------------------

      const label =
        document.createElement(
          "div"
        );


      label.className =
        "lifeline-label";


      label.textContent =
        person.name ||
        "名称未登録";



      // --------------------------------------------------------
      // 横方向の時間軸
      // --------------------------------------------------------

      const track =
        document.createElement(
          "div"
        );


      track.className =
        "lifeline-track";



      // ======================================================
      // 年表イベントの縦線
      // ======================================================

      timelineEvents.forEach(
        (event) => {


          /*
           * 時間軸外は表示しません。
           */
          if (
            event.eventYear <
              minYear ||
            event.eventYear >
              maxYear
          ) {

            return;
          }


          const eventMarker =
            document.createElement(
              "div"
            );


          eventMarker.className =
            "lifeline-event-marker";


          /*
           * イベントIDを保存。
           *
           * 年ラベルをクリックしたときに、
           * 同じイベントの線だけ強調するためです。
           */
          eventMarker.dataset.eventId =
            event.id ||
            "";


          /*
           * 年表イベントの横位置。
           */
          const position =
            (
              (
                event.eventYear -
                minYear
              ) /
              totalYears
            ) * 100;


          eventMarker.style.left =
            `${position}%`;


          /*
           * PC向けの補助表示。
           */
          eventMarker.title =
            `${event.eventYear}年 ${event.title || ""}`;


          track.appendChild(
            eventMarker
          );
        }
      );



      // ======================================================
      // 人物の生涯を表す帯
      // ======================================================

      const bar =
        document.createElement(
          "div"
        );


      bar.className =
        "lifeline-bar";


      /*
       * 生年の横位置。
       */
      const left =
        (
          (
            person.birthYear -
            minYear
          ) /
          totalYears
        ) * 100;


      /*
       * 生涯の長さを横幅に変換します。
       */
      const width =
        (
          (
            person.deathYear -
            person.birthYear
          ) /
          totalYears
        ) * 100;


      bar.style.left =
        `${left}%`;


      /*
       * 非常に短い期間でも
       * 最低1%は表示します。
       */
      bar.style.width =
        `${Math.max(
          width,
          1
        )}%`;



      // --------------------------------------------------------
      // 帯の中の年表示
      // --------------------------------------------------------

      const text =
        document.createElement(
          "span"
        );


      text.className =
        "lifeline-text";


      /*
       * 存命人物は「現在」と表示。
       */
      const deathText =
        person.lifespan.death
          ? person.deathYear
          : "現在";


      text.textContent =
        `${person.birthYear} - ${deathText}`;


      bar.appendChild(
        text
      );


      track.appendChild(
        bar
      );


      row.appendChild(
        label
      );


      row.appendChild(
        track
      );


      /*
       * 完成した1人分の行を表示します。
       */
      chart.appendChild(
        row
      );
    }
  );
}



// ============================================================
// 読み込み開始
// ============================================================
//
// ページを開いたときに、
// 3種類のJSONを読み込みます。
//
// それぞれ独立しているため、
// たとえば circuits.json に問題があっても、
// 年表や人物まで巻き込まない設計にしています。
//
// ============================================================


// 年表
loadTimeline();


// 人物
loadPeople();


// サーキット
loadCircuits();
