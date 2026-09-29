/*
 * ============================================================
 * モータースポーツ史
 * timeline.json 読み込み処理
 * ============================================================
 *
 * このファイルでは、data/timeline.json に保存した歴史データを
 * JavaScriptから読み込みます。
 *
 * 今回は最初のテストとして、
 * 読み込んだデータをブラウザのコンソールに表示するだけです。
 *
 * 画面への年表表示は、次のステップで追加します。
 * ============================================================
 */


/*
 * JSONデータを読み込む関数
 */
async function loadTimeline() {

  try {

    /*
     * data/timeline.json を読み込みます。
     *
     * GitHub Pagesでは、
     *
     *   index.html
     *   data/timeline.json
     *
     * という位置関係なので、
     * "./data/timeline.json" で読み込めます。
     */
    const response = await fetch("./data/timeline.json");


    /*
     * HTTPエラーが発生していないか確認します。
     */
    if (!response.ok) {
      throw new Error(
        `timeline.json の読み込みに失敗しました: ${response.status}`
      );
    }


    /*
     * 読み込んだJSONをJavaScriptのデータに変換します。
     */
    const timelineData = await response.json();


    /*
     * まずは開発者ツールのConsoleで確認します。
     */
    console.log("モータースポーツ史データを読み込みました。");
    console.log(timelineData);

  } catch (error) {

    /*
     * JSONが見つからない場合や、
     * JSONの書式に問題がある場合などは
     * ここにエラーが表示されます。
     */
    console.error("年表データの読み込みエラー:", error);

  }

}


/*
 * ページが読み込まれたら、
 * 年表データの読み込みを開始します。
 */
loadTimeline();
