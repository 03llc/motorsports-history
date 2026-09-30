// ============================================================
// モータースポーツ史
// app.js
// ============================================================
//
// 主な処理
//
// 1. 年表データの読み込み
// 2. 年表表示
// 3. カテゴリ絞り込み
// 4. 人物データの読み込み
// 5. 人物カード表示
// 6. 人物ライフライン比較
// 7. 年代目盛り
// 8. 年表上の出来事をライフラインへ重ねる
// 9. 年表イベントの年を時間軸上に表示する
//
// ============================================================


// ============================================================
// 読み込んだデータを保持
// ============================================================

let allTimelineData = [];
let allPeopleData = [];


// ============================================================
// カテゴリ名
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
    // 古い順に並べる
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


    // 年表表示
    displayTimeline(
      allTimelineData
    );


    // カテゴリボタン
    createCategoryFilters(
      allTimelineData
    );


    // --------------------------------------------------------
    // 人物データがすでに読み込まれていたら
    // ライフラインを再描画
    // --------------------------------------------------------

    if (allPeopleData.length > 0) {

      displayPeopleLifeline(
        allPeopleData
      );
    }

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
// 年表表示
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


  if (
    !Array.isArray(timelineData) ||
    timelineData.length === 0
  ) {

    timelineList.innerHTML =
      "<p>該当する年表データはありません。</p>";

    return;
  }


  timelineData.forEach((item) => {


    // ========================================================
    // 年表カード
    // ========================================================

    const article =
      document.createElement(
        "article"
      );


    const scale =
      item.display &&
      item.display.scale
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


    date.textContent =
      item.display &&
      item.display.date_text
        ? item.display.date_text
        : "年代不明";


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
    // カテゴリ
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
            document.createElement(
              "span"
            );

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
    // 典拠
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


    timelineList.appendChild(
      article
    );
  });
}


// ============================================================
// カテゴリボタン生成
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
  // 各カテゴリ
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


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const selectedCategory =
          button.dataset.category;


        buttons.forEach((btn) => {

          btn.classList.remove(
            "active"
          );
        });


        button.classList.add(
          "active"
        );


        if (
          selectedCategory ===
          "all"
        ) {

          displayTimeline(
            allTimelineData
          );

          return;
        }


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
// 人物データを読み込む
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


    // 全人物データを保持
    allPeopleData =
      peopleData;


    // 人物カード
    displayPeople(
      allPeopleData
    );


    // 人物ライフライン
    displayPeopleLifeline(
      allPeopleData
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
// 人物カード表示
// ============================================================

function displayPeople(
  peopleData
) {

  const peopleList =
    document.getElementById(
      "people-list"
    );


  if (!peopleList) {
    return;
  }


  peopleList.innerHTML = "";


  if (
    !Array.isArray(peopleData) ||
    peopleData.length === 0
  ) {

    peopleList.innerHTML =
      "<p>人物データはまだありません。</p>";

    return;
  }


  peopleData.forEach(
    (person) => {


      const article =
        document.createElement(
          "article"
        );

      article.className =
        "person-item";


      // ======================================================
      // 人物名
      // ======================================================

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


      // ======================================================
      // 生没年月日
      // ======================================================

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


      article.appendChild(
        lifespan
      );


      peopleList.appendChild(
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

  const chart =
    document.getElementById(
      "people-lifeline-chart"
    );


  if (!chart) {
    return;
  }


  // ==========================================================
  // 人物データ確認
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
  // 生年月日がある人物
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


  const currentYear =
    new Date().getFullYear();


  // ==========================================================
  // 人物の日付を年へ変換
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
  // 年表イベントから年を取り出す
  // ==========================================================

  const timelineEvents =
    allTimelineData
      .filter((item) => {

        return (
          item.time_span &&
          item.time_span.start
        );
      })
      .map((item) => {

        return {

          ...item,

          eventYear:
            parseInt(
              item.time_span.start
                .substring(0, 4),
              10
            )
        };
      })
      .filter((item) => {

        return !Number.isNaN(
          item.eventYear
        );
      });


  // ==========================================================
  // 人物の最も早い生年
  // ==========================================================

  const earliestPersonYear =
    Math.min(
      ...peopleWithYears.map(
        (person) =>
          person.birthYear
      )
    );


  // ==========================================================
  // 年表イベントの最も早い年
  // ==========================================================

  const earliestEventYear =
    timelineEvents.length > 0
      ? Math.min(
          ...timelineEvents.map(
            (item) =>
              item.eventYear
          )
        )
      : earliestPersonYear;


  // ==========================================================
  // 時間軸の開始年
  // ==========================================================

  const minYear =
    Math.min(
      earliestPersonYear,
      earliestEventYear
    );


  // ==========================================================
  // 終了年
  // ==========================================================

  const maxYear =
    Math.max(
      currentYear,

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


  const scaleStart =
    Math.ceil(
      minYear / 20
    ) * 20;


  // ==========================================================
  // 20年ごとの年代目盛り
  // ==========================================================

  for (
    let year = scaleStart;
    year <= maxYear;
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
  // 年表イベントの「年」を時間軸へ表示
  // ==========================================================
  //
  // 例：
  //
  // 1936  多摩川スピードウェイ開場
  // 1966  富士スピードウェイ開業
  //
  // ここではまず「年」だけを表示します。
  //
  // イベント名は title 属性にも入れておくので、
  // PCではマウスを重ねたときに確認できます。
  //
  // 将来はタップして詳細表示することもできます。
  // ==========================================================

  timelineEvents.forEach(
    (event) => {

      if (
        event.eventYear < minYear ||
        event.eventYear > maxYear
      ) {

        return;
      }


      const eventScaleMarker =
        document.createElement(
          "div"
        );


      eventScaleMarker.className =
        "lifeline-scale-event";


      const eventPosition =
        (
          (
            event.eventYear -
            minYear
          ) /
          totalYears
        ) * 100;


      eventScaleMarker.style.left =
        `${eventPosition}%`;


      // イベント名を補助情報として保持
      eventScaleMarker.title =
        `${event.eventYear}年 ${event.title || ""}`;


      // ------------------------------------------------------
      // 年表示
      // ------------------------------------------------------

      const eventYearLabel =
        document.createElement(
          "span"
        );


      eventYearLabel.textContent =
        event.eventYear;


      eventScaleMarker.appendChild(
        eventYearLabel
      );


      scaleRow.appendChild(
        eventScaleMarker
      );
    }
  );


  // ==========================================================
  // 現在
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


  chart.appendChild(
    scaleRow
  );


  // ==========================================================
  // 人物ごとのライフライン
  // ==========================================================

  peopleWithYears.forEach(
    (person) => {


      const row =
        document.createElement(
          "div"
        );

      row.className =
        "lifeline-row";


      // ======================================================
      // 人物名
      // ======================================================

      const label =
        document.createElement(
          "div"
        );

      label.className =
        "lifeline-label";

      label.textContent =
        person.name ||
        "名称未登録";


      // ======================================================
      // 時間軸
      // ======================================================

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

          if (
            event.eventYear < minYear ||
            event.eventYear > maxYear
          ) {

            return;
          }


          const eventMarker =
            document.createElement(
              "div"
            );

          eventMarker.className =
            "lifeline-event-marker";


          const eventPosition =
            (
              (
                event.eventYear -
                minYear
              ) /
              totalYears
            ) * 100;


          eventMarker.style.left =
            `${eventPosition}%`;


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
      // 生没年
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