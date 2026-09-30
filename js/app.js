// ============================================================
// モータースポーツ史
// app.js
// ============================================================
//
// このファイルでは、主に次の処理を行います。
//
// 1. 年表データ（timeline.json）の読み込み
// 2. 年表データの日付順ソート
// 3. 年表カードの表示
// 4. カテゴリボタンの自動生成
// 5. カテゴリによる絞り込み
// 6. 典拠情報の表示
// 7. 人物データ（people.json）の読み込み
// 8. 人物カードの表示
// 9. 人物ライフライン比較
// 10. ライフラインの年代目盛り表示
//
// ============================================================


// ============================================================
// 年表データを保持する変数
// ============================================================

let allTimelineData = [];


// ============================================================
// カテゴリ名の日本語表示
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

    const response =
      await fetch("./data/timeline.json");


    if (!response.ok) {
      throw new Error(
        "年表データを読み込めませんでした。"
      );
    }


    const timelineData =
      await response.json();


    // --------------------------------------------------------
    // 日付順に並べ替え
    // --------------------------------------------------------

    timelineData.sort((a, b) => {

      const dateA =
        a.time_span && a.time_span.start
          ? a.time_span.start
          : null;

      const dateB =
        b.time_span && b.time_span.start
          ? b.time_span.start
          : null;


      if (!dateA && !dateB) {
        return 0;
      }


      if (!dateA) {
        return 1;
      }


      if (!dateB) {
        return -1;
      }


      return dateA.localeCompare(dateB);
    });


    allTimelineData =
      timelineData;


    // 年表を表示
    displayTimeline(allTimelineData);


    // カテゴリボタンを生成
    createCategoryFilters(allTimelineData);

  } catch (error) {

    console.error(error);


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
// 年表を画面に表示
// ============================================================

function displayTimeline(timelineData) {

  const timelineList =
    document.getElementById(
      "timeline-list"
    );


  if (!timelineList) {
    return;
  }


  timelineList.innerHTML = "";


  // ----------------------------------------------------------
  // データが0件の場合
  // ----------------------------------------------------------

  if (
    !Array.isArray(timelineData) ||
    timelineData.length === 0
  ) {

    timelineList.innerHTML =
      "<p>該当する年表データはありません。</p>";

    return;
  }


  // ----------------------------------------------------------
  // 年表を1件ずつ表示
  // ----------------------------------------------------------

  timelineData.forEach((item) => {


    // ========================================================
    // 年表カード
    // ========================================================

    const article =
      document.createElement("article");


    const scale =
      item.display && item.display.scale
        ? item.display.scale
        : "spot";


    article.className =
      `timeline-item ${scale}`;


    // ========================================================
    // 日付
    // ========================================================

    const date =
      document.createElement("p");

    date.className =
      "timeline-date";


    if (
      item.display &&
      item.display.date_text
    ) {

      date.textContent =
        item.display.date_text;

    } else {

      date.textContent =
        "年代不明";
    }


    // ========================================================
    // タイトル
    // ========================================================

    const title =
      document.createElement("h3");

    title.textContent =
      item.title ||
      "タイトル未登録";


    // ========================================================
    // 説明
    // ========================================================

    const description =
      document.createElement("p");

    description.className =
      "timeline-description";

    description.textContent =
      item.description || "";


    article.appendChild(date);
    article.appendChild(title);
    article.appendChild(description);


    // ========================================================
    // カテゴリタグ
    // ========================================================

    if (
      Array.isArray(item.categories) &&
      item.categories.length > 0
    ) {

      const categoryBox =
        document.createElement("div");

      categoryBox.className =
        "timeline-categories";


      item.categories.forEach(
        (category) => {

          const tag =
            document.createElement("span");

          tag.className =
            "timeline-category-tag";


          tag.textContent =
            categoryLabels[category] ||
            category;


          categoryBox.appendChild(tag);
        }
      );


      article.appendChild(
        categoryBox
      );
    }


    // ========================================================
    // 典拠情報
    // ========================================================

    if (
      Array.isArray(item.sources) &&
      item.sources.length > 0
    ) {

      const sourceBox =
        document.createElement("div");

      sourceBox.className =
        "timeline-sources";


      const sourceTitle =
        document.createElement("p");

      sourceTitle.className =
        "timeline-sources-title";

      sourceTitle.textContent =
        "典拠";

      sourceBox.appendChild(
        sourceTitle
      );


      // ------------------------------------------------------
      // 典拠を1件ずつ表示
      // ------------------------------------------------------

      item.sources.forEach(
        (source) => {

          const sourceItem =
            document.createElement("p");

          sourceItem.className =
            "timeline-source-item";


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
              String(source.year)
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


          // URLがある場合はリンクにする
          if (source.url) {

            const link =
              document.createElement("a");

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


    // ========================================================
    // 年表一覧へ追加
    // ========================================================

    timelineList.appendChild(
      article
    );
  });
}


// ============================================================
// カテゴリフィルターを自動生成
// ============================================================

function createCategoryFilters(
  timelineData
) {

  const filterBox =
    document.getElementById(
      "timeline-filters"
    );


  if (!filterBox) {
    return;
  }


  filterBox.innerHTML = "";


  // ==========================================================
  // JSON内に登場するカテゴリを集める
  // ==========================================================

  const categorySet =
    new Set();


  timelineData.forEach((item) => {

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
  });


  const categories =
    Array.from(categorySet);


  // 日本語ラベル順に並べる
  categories.sort((a, b) => {

    const labelA =
      categoryLabels[a] || a;

    const labelB =
      categoryLabels[b] || b;


    return labelA.localeCompare(
      labelB,
      "ja"
    );
  });


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
  // カテゴリボタン
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


  setupCategoryFilters();
}


// ============================================================
// カテゴリフィルターのクリック処理
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


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const selectedCategory =
          button.dataset.category;


        // activeクラスを付け替える
        buttons.forEach(
          (btn) => {

            btn.classList.remove(
              "active"
            );
          }
        );


        button.classList.add(
          "active"
        );


        // ----------------------------------------------------
        // 「すべて」
        // ----------------------------------------------------

        if (
          selectedCategory ===
          "all"
        ) {

          displayTimeline(
            allTimelineData
          );

          return;
        }


        // ----------------------------------------------------
        // 指定カテゴリで絞り込み
        // ----------------------------------------------------

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
  });
}


// ============================================================
// 人物データの読み込み
// ============================================================

async function loadPeople() {

  try {

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


    // 人物カード表示
    displayPeople(
      peopleData
    );


    // 人物ライフライン比較表示
    displayPeopleLifeline(
      peopleData
    );

  } catch (error) {

    console.error(error);


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
// 人物カードを表示
// ============================================================

function displayPeople(peopleData) {

  const peopleList =
    document.getElementById(
      "people-list"
    );


  if (!peopleList) {
    return;
  }


  peopleList.innerHTML = "";


  // ==========================================================
  // 人物データが0件
  // ==========================================================

  if (
    !Array.isArray(peopleData) ||
    peopleData.length === 0
  ) {

    peopleList.innerHTML =
      "<p>人物データはまだありません。</p>";

    return;
  }


  // ==========================================================
  // 人物を1人ずつ表示
  // ==========================================================

  peopleData.forEach(
    (person) => {


      const article =
        document.createElement(
          "article"
        );

      article.className =
        "person-item";


      // ------------------------------------------------------
      // 人物名
      // ------------------------------------------------------

      const name =
        document.createElement(
          "h3"
        );

      name.textContent =
        person.name ||
        "名称未登録";


      // ------------------------------------------------------
      // 生没年月日
      // ------------------------------------------------------

      const lifespan =
        document.createElement(
          "p"
        );

      lifespan.className =
        "person-lifespan";


      if (
        person.display &&
        person.display.lifespan_text
      ) {

        lifespan.textContent =
          person.display
            .lifespan_text;

      } else {

        lifespan.textContent =
          "生没年月日：未登録";
      }


      // 人物名
      article.appendChild(
        name
      );


      // ======================================================
      // 役割
      // ======================================================

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


        const roleLabels = {
          driver:
            "ドライバー",

          engineer:
            "エンジニア",

          designer:
            "デザイナー",

          founder:
            "創業者",

          manager:
            "監督・マネージャー"
        };


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


      // 生没年月日
      article.appendChild(
        lifespan
      );


      // 人物一覧へ追加
      peopleList.appendChild(
        article
      );
    }
  );
}


// ============================================================
// 人物ライフライン比較
// ============================================================
//
// people.json の birth / death を使って、
// 複数人物の生涯を同じ時間軸で比較します。
//
// 存命人物は death が null なので、
// 現在年まで帯を伸ばします。
// ============================================================

function displayPeopleLifeline(
  peopleData
) {

  const chart =
    document.getElementById(
      "people-lifeline-chart"
    );


  if (!chart) {
    return;
  }


  // ==========================================================
  // 人物データがない場合
  // ==========================================================

  if (
    !Array.isArray(peopleData) ||
    peopleData.length === 0
  ) {

    chart.innerHTML =
      "<p>人物ライフラインデータはまだありません。</p>";

    return;
  }


  // ==========================================================
  // 生年月日がある人物だけを対象
  // ==========================================================

  const validPeople =
    peopleData.filter(
      (person) => {

        return (
          person.lifespan &&
          person.lifespan.birth
        );
      }
    );


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
  // 各人物の生年・没年を数値化
  // ==========================================================

  const peopleWithYears =
    validPeople.map(
      (person) => {

        const birthYear =
          parseInt(
            person.lifespan.birth
              .substring(0, 4),
            10
          );


        const deathYear =
          person.lifespan.death
            ? parseInt(
                person.lifespan.death
                  .substring(0, 4),
                10
              )
            : currentYear;


        return {
          ...person,
          birthYear,
          deathYear
        };
      }
    );


  // ==========================================================
  // 時間軸の開始年・終了年
  // ==========================================================

  const minYear =
    Math.min(
      ...peopleWithYears.map(
        (person) =>
          person.birthYear
      )
    );


  const maxYear =
    Math.max(
      ...peopleWithYears.map(
        (person) =>
          person.deathYear
      )
    );


  const totalYears =
    maxYear - minYear;


  if (totalYears <= 0) {

    chart.innerHTML =
      "<p>ライフラインを計算できませんでした。</p>";

    return;
  }


  // 一度中身を空にする
  chart.innerHTML = "";


  // ==========================================================
  // 年代目盛り
  // ==========================================================
  //
  // 20年ごとの年代を表示します。
  //
  // 例：
  // 1940 / 1960 / 1980 / 2000 / 2020
  //
  // ==========================================================

  const scaleRow =
    document.createElement(
      "div"
    );

  scaleRow.className =
    "lifeline-scale";


  // ----------------------------------------------------------
  // 目盛り開始年
  // ----------------------------------------------------------
  //
  // 例：
  // 1942 → 1940
  //
  // ----------------------------------------------------------

  const scaleStart =
    Math.floor(
      minYear / 20
    ) * 20;


  // ----------------------------------------------------------
  // 目盛り終了年
  // ----------------------------------------------------------
  //
  // 現在登録されている人物の最大年。
  // 存命人物がいる場合は現在年になります。
  //
  // ----------------------------------------------------------

  const scaleEnd =
    maxYear;


  // ==========================================================
  // 20年ごとの目盛りを作成
  // ==========================================================

  for (
    let year = scaleStart;
    year <= scaleEnd;
    year += 20
  ) {

    const marker =
      document.createElement(
        "div"
      );

    marker.className =
      "lifeline-scale-marker";


    const position =
      (
        (year - minYear) /
        totalYears
      ) * 100;


    marker.style.left =
      `${position}%`;


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
  // 右端に「現在」を表示
  // ==========================================================
  //
  // 20年刻みだけだと現在年そのものが
  // 表示されない場合があるので、
  // 時間軸の右端を明示します。
  //
  // ==========================================================

  const currentMarker =
    document.createElement(
      "div"
    );

  currentMarker.className =
    "lifeline-scale-marker lifeline-scale-current";


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


  // 年代目盛りを表示
  chart.appendChild(
    scaleRow
  );


  // ==========================================================
  // 人物ごとのライフライン
  // ==========================================================

  peopleWithYears.forEach(
    (person) => {


      // ------------------------------------------------------
      // 1人分の行
      // ------------------------------------------------------

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "lifeline-row";


      // ------------------------------------------------------
      // 人物名
      // ------------------------------------------------------

      const label =
        document.createElement(
          "div"
        );

      label.className =
        "lifeline-label";

      label.textContent =
        person.name ||
        "名称未登録";


      // ------------------------------------------------------
      // 時間軸
      // ------------------------------------------------------

      const track =
        document.createElement(
          "div"
        );

      track.className =
        "lifeline-track";


      // ------------------------------------------------------
      // 人物の生涯を表す帯
      // ------------------------------------------------------

      const bar =
        document.createElement(
          "div"
        );

      bar.className =
        "lifeline-bar";


      // ======================================================
      // 横位置をパーセントで計算
      // ======================================================

      const left =
        (
          (
            person.birthYear -
            minYear
          ) /
          totalYears
        ) * 100;


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


      bar.style.width =
        `${Math.max(
          width,
          1
        )}%`;


      // ======================================================
      // 生没年文字
      // ======================================================

      const text =
        document.createElement(
          "span"
        );

      text.className =
        "lifeline-text";


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

      chart.appendChild(
        row
      );
    }
  );
}


// ============================================================
// ページ読み込み開始
// ============================================================

loadTimeline();
loadPeople();