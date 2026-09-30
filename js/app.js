// ============================================================
// モータースポーツ史
// app.js
// ============================================================
//
// ・timeline.json から年表を表示
// ・カテゴリ絞り込み
// ・people.json から人物を表示
// ・人物ライフラインを表示
// ・年表イベントをライフラインへ重ねる
// ・イベント年をタップするとタイトル＋説明文を表示
// ・選択中イベントの縦線も強調
//
// ============================================================


// ============================================================
// 読み込んだデータを保持
// ============================================================

let allTimelineData = [];
let allPeopleData = [];
let allCircuitData = [];

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


    // 古い順に並べる
    timelineData.sort((a, b) => {

      const dateA =
        a.time_span?.start || "";

      const dateB =
        b.time_span?.start || "";

      return dateA.localeCompare(dateB);
    });


    allTimelineData =
      timelineData;


    displayTimeline(
      allTimelineData
    );


    createCategoryFilters(
      allTimelineData
    );


    // 人物データが先に読み込まれていた場合は
    // ライフラインを再描画
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

function displayTimeline(
  timelineData
) {

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


  timelineData.forEach(
    (item) => {


      const article =
        document.createElement(
          "article"
        );


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
      // 説明
      // ======================================================

      const description =
        document.createElement(
          "p"
        );


      description.className =
        "timeline-description";


      description.textContent =
        item.description || "";


      article.appendChild(date);
      article.appendChild(title);
      article.appendChild(description);


      // ======================================================
      // カテゴリ
      // ======================================================

      if (
        Array.isArray(item.categories) &&
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
        Array.isArray(item.sources) &&
        item.sources.length > 0
      ) {

        const sourceBox =
          document.createElement(
            "div"
          );


        sourceBox.className =
          "timeline-sources";


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


        item.sources.forEach(
          (source) => {

            const sourceItem =
              document.createElement(
                "p"
              );


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
    }
  );
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


  const categories =
    Array.from(
      categorySet
    );


  categories.sort(
    (a, b) => {

      return (
        categoryLabels[a] || a
      ).localeCompare(
        categoryLabels[b] || b,
        "ja"
      );
    }
  );


  // 「すべて」ボタン
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


  // 各カテゴリ
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


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {


          const selectedCategory =
            button.dataset.category;


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
    }
  );
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


    allPeopleData =
      peopleData;


    displayPeople(
      allPeopleData
    );


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
     * 404などで正常に取得できなかった場合は、
     * エラーとして扱います。
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
     * 読み込んだデータを
     * 全体で使える変数へ保存します。
     */
    allCircuitData =
      circuitData;


    /*
     * この段階ではまだ画面には表示しません。
     *
     * 次のステップで、
     * displayCircuits() を作る予定です。
     */
    console.log(
      "サーキットデータを読み込みました。",
      allCircuitData
    );


  } catch (error) {

    /*
     * 読み込みに失敗した場合は
     * ブラウザのコンソールにエラーを表示します。
     *
     * 既存の年表や人物表示は壊さないように、
     * 今は画面側には何も出しません。
     */
    console.error(
      error
    );
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


/*
 * 人物を生年月日の古い順に並べます。
 *
 * people.json の並び順に依存せず、
 * 表示するときに自動で年代順にします。
 */
const sortedPeople =
  [...peopleData].sort(
    (a, b) => {

      const birthA =
        a.lifespan?.birth || "9999-12-31";

      const birthB =
        b.lifespan?.birth || "9999-12-31";

      return birthA.localeCompare(
        birthB
      );
    }
  );


sortedPeople.forEach(
  (person) => {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "person-item";


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
  // 生年月日がある人物
  // ==========================================================

  const validPeople =
    Array.isArray(peopleData)
      ? peopleData.filter(
          (person) =>
            person.lifespan?.birth
        )
      : [];


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
  // 人物の生年・没年
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

/*
 * ライフラインも生年順に並べます。
 */
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

  const timelineEvents =
    allTimelineData
      .filter(
        (item) =>
          item.time_span?.start
      )
      .map(
        (item) => {

          return {
            ...item,

            eventYear:
              parseInt(
                item.time_span.start
                  .substring(0, 4),
                10
              )
          };
        }
      )
      .filter(
        (item) =>
          !Number.isNaN(
            item.eventYear
          )
      );


  // ==========================================================
  // 時間軸の範囲
  // ==========================================================

  const earliestPersonYear =
    Math.min(
      ...peopleWithYears.map(
        (person) =>
          person.birthYear
      )
    );


  const earliestEventYear =
    timelineEvents.length > 0
      ? Math.min(
          ...timelineEvents.map(
            (event) =>
              event.eventYear
          )
        )
      : earliestPersonYear;


  const minYear =
    Math.min(
      earliestPersonYear,
      earliestEventYear
    );


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


  if (
    totalYears <= 0
  ) {

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
  // イベント詳細表示欄
  // ==========================================================

  const eventInfo =
    document.createElement(
      "div"
    );


  eventInfo.className =
    "lifeline-event-info";


  eventInfo.setAttribute(
    "aria-live",
    "polite"
  );


  // ==========================================================
  // イベント年ボタン
  // ==========================================================

  timelineEvents.forEach(
    (event) => {


      if (
        event.eventYear < minYear ||
        event.eventYear > maxYear
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


      // ------------------------------------------------------
      // イベントIDを持たせます。
      //
      // 同じイベントに対応する縦線を探すために使います。
      // ------------------------------------------------------

      eventButton.dataset.eventId =
        event.id || "";


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


      eventButton.title =
        `${event.eventYear}年 ${event.title || ""}`;


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
      // タップしたとき
      // ======================================================

      eventButton.addEventListener(
        "click",
        () => {


          eventInfo.innerHTML = "";


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

          if (event.description) {

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
          // すべてのイベント縦線から active を外す
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
          // タップしたイベントと同じIDの縦線だけ強調
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


  chart.appendChild(
    eventInfo
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


      const label =
        document.createElement(
          "div"
        );


      label.className =
        "lifeline-label";


      label.textContent =
        person.name ||
        "名称未登録";


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


          // --------------------------------------------------
          // この縦線がどのイベントか分かるように
          // data-event-id を付けます。
          // --------------------------------------------------

          eventMarker.dataset.eventId =
            event.id || "";


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
// 読み込み開始
// ============================================================

loadTimeline();
loadPeople();
loadCircuits();
