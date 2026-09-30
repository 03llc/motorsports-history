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
//
// ============================================================


// ============================================================
// 年表データを保持する変数
// ============================================================

let allTimelineData = [];


// ============================================================
// カテゴリ名の日本語表示
// ============================================================
//
// timeline.json 内では英語のIDを使い、
// 画面上では日本語ラベルを表示します。
//
// 新しいカテゴリを追加したい場合は、
// ここへ追加していきます。
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

    // timeline.json を取得
    const response = await fetch("./data/timeline.json");


    // ファイルが取得できなかった場合
    if (!response.ok) {
      throw new Error("年表データを読み込めませんでした。");
    }


    // JSONデータとして読み込む
    const timelineData = await response.json();


    // --------------------------------------------------------
    // 日付順に並べ替え
    // --------------------------------------------------------
    //
    // time_span.start を使って並べます。
    //
    // 日付不明（null）のデータは最後へ送ります。
    //
    // 例：
    //
    // 1936-01-01
    // 1966-01-01
    // null
    //
    // の順になります。
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


      // 両方とも日付不明
      if (!dateA && !dateB) {
        return 0;
      }


      // Aだけ不明 → Aを後ろへ
      if (!dateA) {
        return 1;
      }


      // Bだけ不明 → Bを後ろへ
      if (!dateB) {
        return -1;
      }


      // 日付文字列で比較
      return dateA.localeCompare(dateB);
    });


    // 全データを保存
    allTimelineData = timelineData;


    // 年表を表示
    displayTimeline(allTimelineData);


    // カテゴリボタンを作成
    createCategoryFilters(allTimelineData);

  } catch (error) {

    console.error(error);


    // エラー時の画面表示
    const timelineList = document.getElementById("timeline-list");

    if (timelineList) {
      timelineList.innerHTML =
        "<p>年表データを読み込むことができませんでした。</p>";
    }
  }
}


// ============================================================
// 年表を画面に表示する
// ============================================================

function displayTimeline(timelineData) {

  const timelineList =
    document.getElementById("timeline-list");


  // 表示場所が存在しない場合は終了
  if (!timelineList) {
    return;
  }


  // 一度中身を空にする
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
  // 年表データを1件ずつ表示
  // ----------------------------------------------------------

  timelineData.forEach((item) => {


    // ========================================================
    // 年表カード
    // ========================================================

    const article =
      document.createElement("article");


    // spot / span をCSSクラスとして利用
    const scale =
      item.display && item.display.scale
        ? item.display.scale
        : "spot";


    article.className =
      `timeline-item ${scale}`;


    // ========================================================
    // 日付表示
    // ========================================================

    const date =
      document.createElement("p");

    date.className = "timeline-date";


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
      item.title || "タイトル未登録";


    // ========================================================
    // 説明文
    // ========================================================

    const description =
      document.createElement("p");

    description.className =
      "timeline-description";

    description.textContent =
      item.description || "";


    // ========================================================
    // カードへ追加
    // ========================================================

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


      item.categories.forEach((category) => {

        const tag =
          document.createElement("span");

        tag.className =
          "timeline-category-tag";


        // 日本語ラベルが登録されていれば日本語表示
        // 未登録なら元のカテゴリ名を表示
        tag.textContent =
          categoryLabels[category] || category;


        categoryBox.appendChild(tag);
      });


      article.appendChild(categoryBox);
    }


    // ========================================================
    // 典拠情報
    // ========================================================
    //
    // sources が空配列の場合は、
    // 典拠欄そのものを表示しません。
    //
    // ========================================================

    if (
      Array.isArray(item.sources) &&
      item.sources.length > 0
    ) {

      const sourceBox =
        document.createElement("div");

      sourceBox.className =
        "timeline-sources";


      // ------------------------------------------------------
      // 典拠見出し
      // ------------------------------------------------------

      const sourceTitle =
        document.createElement("p");

      sourceTitle.className =
        "timeline-sources-title";

      sourceTitle.textContent =
        "典拠";

      sourceBox.appendChild(sourceTitle);


      // ------------------------------------------------------
      // 典拠を1件ずつ表示
      // ------------------------------------------------------

      item.sources.forEach((source) => {

        const sourceItem =
          document.createElement("p");

        sourceItem.className =
          "timeline-source-item";


        // 典拠情報の各項目を配列へ入れる
        const sourceParts = [];


        if (source.title) {
          sourceParts.push(source.title);
        }


        if (source.author) {
          sourceParts.push(source.author);
        }


        if (source.publisher) {
          sourceParts.push(source.publisher);
        }


        if (source.year) {
          sourceParts.push(String(source.year));
        }


        if (source.note) {
          sourceParts.push(source.note);
        }


        // 表示文字列
        const sourceText =
          sourceParts.length > 0
            ? sourceParts.join(" / ")
            : "典拠情報未登録";


        // ----------------------------------------------------
        // URLがある場合はリンク化
        // ----------------------------------------------------

        if (source.url) {

          const link =
            document.createElement("a");

          link.href = source.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = sourceText;

          sourceItem.appendChild(link);

        } else {

          sourceItem.textContent =
            sourceText;
        }


        sourceBox.appendChild(sourceItem);
      });


      // sources が存在する場合だけ
      // カードへ典拠欄を追加
      article.appendChild(sourceBox);
    }


    // ========================================================
    // 年表一覧へカードを追加
    // ========================================================

    timelineList.appendChild(article);
  });
}


// ============================================================
// カテゴリフィルターを自動生成
// ============================================================

function createCategoryFilters(timelineData) {

  const filterBox =
    document.getElementById("timeline-filters");


  if (!filterBox) {
    return;
  }


  // 一度空にする
  filterBox.innerHTML = "";


  // ==========================================================
  // JSON内に登場するカテゴリを集める
  // ==========================================================

  const categorySet =
    new Set();


  timelineData.forEach((item) => {

    if (Array.isArray(item.categories)) {

      item.categories.forEach((category) => {
        categorySet.add(category);
      });
    }
  });


  // 配列へ変換
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
    document.createElement("button");

  allButton.type = "button";
  allButton.dataset.category = "all";
  allButton.className = "active";
  allButton.textContent = "すべて";

  filterBox.appendChild(allButton);


  // ==========================================================
  // カテゴリボタン
  // ==========================================================

  categories.forEach((category) => {

    const button =
      document.createElement("button");

    button.type = "button";
    button.dataset.category =
      category;

    button.textContent =
      categoryLabels[category] ||
      category;

    filterBox.appendChild(button);
  });


  // ボタンのクリック処理を設定
  setupCategoryFilters();
}


// ============================================================
// カテゴリフィルターのクリック処理
// ============================================================

function setupCategoryFilters() {

  const filterBox =
    document.getElementById("timeline-filters");


  if (!filterBox) {
    return;
  }


  const buttons =
    filterBox.querySelectorAll("button");


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const selectedCategory =
          button.dataset.category;


        // ----------------------------------------------------
        // activeクラスを付け替える
        // ----------------------------------------------------

        buttons.forEach((btn) => {
          btn.classList.remove("active");
        });

        button.classList.add("active");


        // ----------------------------------------------------
        // 「すべて」の場合
        // ----------------------------------------------------

        if (selectedCategory === "all") {

          displayTimeline(
            allTimelineData
          );

          return;
        }


        // ----------------------------------------------------
        // 指定カテゴリで絞り込む
        // ----------------------------------------------------

        const filteredData =
          allTimelineData.filter((item) => {

            return (
              Array.isArray(item.categories) &&
              item.categories.includes(
                selectedCategory
              )
            );
          });


        displayTimeline(filteredData);
      }
    );
  });
}


// ============================================================
// 人物データの読み込み
// ============================================================
//
// data/people.json を読み込み、
// index.html の #people-list に表示します。
//
// 年表とは別ファイルにすることで、
//
// ・人物
// ・生没年月日
// ・役割
// ・関連チーム
// ・関連車両
// ・関連イベント
//
// などを独立して管理できます。
// ============================================================

async function loadPeople() {

  try {

    // people.json を取得
    const response =
      await fetch("./data/people.json");


    // ファイル取得失敗
    if (!response.ok) {

      throw new Error(
        "人物データを読み込めませんでした。"
      );
    }


    // JSONとして読み込む
    const peopleData =
      await response.json();


    // 人物を表示
    displayPeople(peopleData);

    // 人物ライフライン比較も表示
displayPeopleLifeline(peopleData);
    
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
// 人物データを画面に表示
// ============================================================

function displayPeople(peopleData) {

  const peopleList =
    document.getElementById(
      "people-list"
    );


  // 表示場所がなければ終了
  if (!peopleList) {
    return;
  }


  // 一度中身を空にする
  peopleList.innerHTML = "";


  // ==========================================================
  // 人物データが0件の場合
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

  peopleData.forEach((person) => {


    // --------------------------------------------------------
    // 人物カード
    // --------------------------------------------------------

    const article =
      document.createElement("article");

    article.className =
      "person-item";


    // --------------------------------------------------------
    // 人物名
    // --------------------------------------------------------

    const name =
      document.createElement("h3");

    name.textContent =
      person.name || "名称未登録";


    // --------------------------------------------------------
    // 生没年月日
    // --------------------------------------------------------

    const lifespan =
      document.createElement("p");

    lifespan.className =
      "person-lifespan";


    if (
      person.display &&
      person.display.lifespan_text
    ) {

      lifespan.textContent =
        person.display.lifespan_text;

    } else {

      lifespan.textContent =
        "生没年月日：未登録";
    }


    // ========================================================
    // 人物名を最初に表示
    // ========================================================

    article.appendChild(name);


    // ========================================================
    // 役割表示
    // ========================================================

    if (
      Array.isArray(person.roles) &&
      person.roles.length > 0
    ) {

      const roles =
        document.createElement("p");

      roles.className =
        "person-roles";


      // ------------------------------------------------------
      // 役割名の日本語表示
      // ------------------------------------------------------

      const roleLabels = {
        driver: "ドライバー",
        engineer: "エンジニア",
        designer: "デザイナー",
        founder: "創業者",
        manager: "監督・マネージャー"
      };


      roles.textContent =
        person.roles
          .map((role) =>
            roleLabels[role] || role
          )
          .join(" / ");


      article.appendChild(roles);
    }


    // ========================================================
    // 生没年月日を表示
    // ========================================================

    article.appendChild(lifespan);


    // ========================================================
    // 人物カードを一覧へ追加
    // ========================================================

    peopleList.appendChild(article);
  });
}


// ============================================================
// ページ読み込み開始
// ============================================================
//
// 年表と人物は、それぞれ別のJSONファイルから読み込みます。
//
// ============================================================

// ============================================================
// 人物ライフライン比較
// ============================================================
//
// people.json にある birth / death を使って、
// 複数人物の生涯を同じ時間軸上に表示します。
//
// 現時点では、人物の「生年〜没年」を
// 横棒として比較するシンプルな表示です。
//
// 存命人物は death が null なので、
// 現在年までのラインとして表示します。
// ============================================================

function displayPeopleLifeline(peopleData) {

  const chart =
    document.getElementById("people-lifeline-chart");

  // 表示エリアがなければ何もしない
  if (!chart) {
    return;
  }


  // 人物データがない場合
  if (
    !Array.isArray(peopleData) ||
    peopleData.length === 0
  ) {

    chart.innerHTML =
      "<p>人物ライフラインデータはまだありません。</p>";

    return;
  }


  // ----------------------------------------------------------
  // 生年が登録されている人物だけを対象にする
  // ----------------------------------------------------------

  const validPeople =
    peopleData.filter((person) => {

      return (
        person.lifespan &&
        person.lifespan.birth
      );
    });


  if (validPeople.length === 0) {

    chart.innerHTML =
      "<p>生年月日が登録された人物がありません。</p>";

    return;
  }


  // ----------------------------------------------------------
  // 年だけ取り出す
  // ----------------------------------------------------------

  const currentYear =
    new Date().getFullYear();


  const peopleWithYears =
    validPeople.map((person) => {

      const birthYear =
        parseInt(
          person.lifespan.birth.substring(0, 4),
          10
        );


      const deathYear =
        person.lifespan.death
          ? parseInt(
              person.lifespan.death.substring(0, 4),
              10
            )
          : currentYear;


      return {
        ...person,
        birthYear,
        deathYear
      };
    });


  // ----------------------------------------------------------
  // 全人物の中で最も早い生年と、
  // 最も遅い没年を求める
  // ----------------------------------------------------------

  const minYear =
    Math.min(
      ...peopleWithYears.map(
        (person) => person.birthYear
      )
    );


  const maxYear =
    Math.max(
      ...peopleWithYears.map(
        (person) => person.deathYear
      )
    );


  const totalYears =
    maxYear - minYear;


  // 念のため0除算を防ぐ
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
// ライフラインの上に、20年ごとの年代を表示します。
//
// 例：
// 1940 / 1960 / 1980 / 2000 / 2020
//
// ==========================================================

const scaleRow =
  document.createElement("div");

scaleRow.className =
  "lifeline-scale";


// ----------------------------------------------------------
// 目盛り開始年
// ----------------------------------------------------------
//
// minYear を20年単位で切り下げます。
//
// 例：
// 1942 → 1940
//
// ----------------------------------------------------------

const scaleStart =
  Math.floor(minYear / 20) * 20;


// ----------------------------------------------------------
// 目盛り終了年
// ----------------------------------------------------------
//
// maxYear を20年単位で切り上げます。
//
// 例：
// 2026 → 2040
//
// ----------------------------------------------------------

const scaleEnd =
  maxYear;


// ----------------------------------------------------------
// 20年ごとに目盛りを作る
// ----------------------------------------------------------

for (
  let year = scaleStart;
  year <= scaleEnd;
  year += 20
) {

  const marker =
    document.createElement("div");

  marker.className =
    "lifeline-scale-marker";


  // 全体の中での横位置を計算
  const position =
    ((year - minYear) / totalYears) * 100;


  marker.style.left =
    `${position}%`;


  // 年代文字
  const label =
    document.createElement("span");

  label.textContent =
    year;


  marker.appendChild(label);
  scaleRow.appendChild(marker);
}


// 目盛りをライフラインの上に追加
chart.appendChild(scaleRow);
  

  // ==========================================================
  // 人物ごとに1本ずつライフラインを作成
  // ==========================================================

  peopleWithYears.forEach((person) => {

    // 1人分の行
    const row =
      document.createElement("div");

    row.className =
      "lifeline-row";


    // --------------------------------------------------------
    // 人物名
    // --------------------------------------------------------

    const label =
      document.createElement("div");

    label.className =
      "lifeline-label";

    label.textContent =
      person.name || "名称未登録";


    // --------------------------------------------------------
    // ライフライン本体
    // --------------------------------------------------------

    const track =
      document.createElement("div");

    track.className =
      "lifeline-track";


    const bar =
      document.createElement("div");

    bar.className =
      "lifeline-bar";


    // --------------------------------------------------------
    // 横位置をパーセントで計算
    // --------------------------------------------------------
    //
    // 例：
    //
    // 全体が1900〜2000年
    // 人物が1940〜1980年なら
    //
    // 左位置 40%
    // 幅     40%
    //
    // という感じです。
    // --------------------------------------------------------

    const left =
      ((person.birthYear - minYear) /
        totalYears) *
      100;


    const width =
      ((person.deathYear - person.birthYear) /
        totalYears) *
      100;


    bar.style.left =
      `${left}%`;

    bar.style.width =
      `${Math.max(width, 1)}%`;


    // --------------------------------------------------------
    // 生没年を文字として表示
    // --------------------------------------------------------

    const text =
      document.createElement("span");

    text.className =
      "lifeline-text";


    const deathText =
      person.lifespan.death
        ? person.deathYear
        : "現在";


    text.textContent =
      `${person.birthYear} - ${deathText}`;


    bar.appendChild(text);
    track.appendChild(bar);

    row.appendChild(label);
    row.appendChild(track);

    chart.appendChild(row);
  });
}

loadTimeline();
loadPeople();
