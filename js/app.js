/*
==========================================
 School Planner
 app.js
 完成版 / 5画面対応
 スマホ入力対応版
==========================================
*/

(() => {

    "use strict";


    /* =====================================
       ページ一覧
    ===================================== */

    const PAGES = [

        "home",
        "calendar",
        "timetable",
	"memo",
        "guide",
        "settings"

    ];


    /* =====================================
       現在ページ
    ===================================== */

    let currentPage = "home";


    /* =====================================
       ページ取得
    ===================================== */

    function getCurrentPage() {

        return currentPage;

    }


    /* =====================================
       全ページ非表示
    ===================================== */

    function hideAllPages() {

        PAGES.forEach(page => {

            const element =
                document.getElementById(
                    page + "Page"
                );

            if (element) {

                element.style.display = "none";

            }

        });

    }


    /* =====================================
       ページ表示
    ===================================== */

    function showPage(page) {

        /* ---------------------------------
           存在しないページは無視
        --------------------------------- */

        if (!PAGES.includes(page)) {

            console.warn(
                "存在しないページ:",
                page
            );

            return;

        }


        /* ---------------------------------
           全ページ非表示
        --------------------------------- */

        hideAllPages();


        /* ---------------------------------
           対象ページ表示
        --------------------------------- */

        const element =
            document.getElementById(
                page + "Page"
            );


        if (element) {

            element.style.display = "block";

        }


        /* ---------------------------------
           現在ページ更新
        --------------------------------- */

        currentPage = page;


        /* ---------------------------------
           ナビゲーション更新
        --------------------------------- */

        updateNavigation();


        /* ---------------------------------
           現在ページ更新
        --------------------------------- */

        refreshCurrentPage();

    }


    /* =====================================
       ナビゲーション更新
    ===================================== */

    function updateNavigation() {

        document
            .querySelectorAll("[data-page]")
            .forEach(button => {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.page ===
                    currentPage
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            });

    }


    /* =====================================
       現在ページ更新
    ===================================== */

    function refreshCurrentPage() {

        switch (currentPage) {


            /* =============================
               HOME
            ============================= */

            case "home":

                if (window.HomeAPI) {

                    if (
                        typeof HomeAPI.updateHome ===
                        "function"
                    ) {

                        HomeAPI.updateHome();

                    }

                    else if (
                        typeof HomeAPI.refresh ===
                        "function"
                    ) {

                        HomeAPI.refresh();

                    }

                }

                break;


            /* =============================
               CALENDAR
            ============================= */

            case "calendar":

                if (window.CalendarAPI) {

                    if (
                        typeof CalendarAPI.init ===
                        "function"
                    ) {

                        CalendarAPI.init();

                    }

                    else if (
                        typeof CalendarAPI.refresh ===
                        "function"
                    ) {

                        CalendarAPI.refresh();

                    }

                }

                break;


            /* =============================
               TIMETABLE
            ============================= */

            case "timetable":

                if (window.TimetableAPI) {

                    if (
                        typeof TimetableAPI.init ===
                        "function"
                    ) {

                        TimetableAPI.init();

                    }

                    else if (
                        typeof TimetableAPI.refresh ===
                        "function"
                    ) {

                        TimetableAPI.refresh();

                    }

                }

                break;

	
	            /* =============================
                       MEMO
         	    =============================*/

            case "memo":

                if (window.MemoAPI) {

                    if (
                        typeof MemoAPI.refresh ===
                        "function"
                    ) {

                        MemoAPI.refresh();

                    }

                    else if (
                        typeof MemoAPI.init ===
                        "function"
                    ) {

                        MemoAPI.init();

                    }

                }

                break;


            /* =============================
               GUIDE
            ============================= */

            case "guide":

                if (window.GuideAPI) {

                    if (
                        typeof GuideAPI.refresh ===
                        "function"
                    ) {

                        GuideAPI.refresh();

                    }

                    else if (
                        typeof GuideAPI.init ===
                        "function"
                    ) {

                        GuideAPI.init();

                    }

                }

                break;


            /* =============================
               SETTINGS
            ============================= */

            case "settings":

                if (window.SettingsAPI) {

                    if (
                        typeof SettingsAPI.refreshSettings ===
                        "function"
                    ) {

                        SettingsAPI.refreshSettings();

                    }

                    else if (
                        typeof SettingsAPI.refresh ===
                        "function"
                    ) {

                        SettingsAPI.refresh();

                    }

                }

                break;

        }

    }


    /* =====================================
       ページ切替イベント
    ===================================== */

    function bindNavigation() {

        document
            .querySelectorAll("[data-page]")
            .forEach(button => {


                /* ---------------------------------
                   重複登録防止
                --------------------------------- */

                if (
                    button.dataset.appNavigationBound ===
                    "true"
                ) {

                    return;

                }


                button.dataset.appNavigationBound =
                    "true";


                /* ---------------------------------
                   クリックイベント
                --------------------------------- */

                button.addEventListener(
                    "click",
                    () => {

                        const page =
                            button.dataset.page;

                        showPage(page);

                    }
                );

            });

    }


    /* =====================================
       通知表示
    ===================================== */

    function notify(
        message,
        duration = 2500
    ) {

        let toast =
            document.getElementById(
                "appToast"
            );


        /* ---------------------------------
           Toastがなければ作成
        --------------------------------- */

        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id =
                "appToast";

            toast.className =
                "toast";

            document.body.appendChild(
                toast
            );

        }


        /* ---------------------------------
           メッセージ表示
        --------------------------------- */

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );


        /* ---------------------------------
           前回タイマー解除
        --------------------------------- */

        clearTimeout(
            toast._timer
        );


        /* ---------------------------------
           自動非表示
        --------------------------------- */

        toast._timer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                duration
            );

    }


    /* =====================================
       ローディング表示
    ===================================== */

    function showLoading(
        text = "読み込み中..."
    ) {

        let loading =
            document.getElementById(
                "loadingOverlay"
            );


        /* ---------------------------------
           なければ作成
        --------------------------------- */

        if (!loading) {

            loading =
                document.createElement(
                    "div"
                );

            loading.id =
                "loadingOverlay";

            loading.className =
                "loadingOverlay";

            loading.innerHTML = `

                <div class="loadingBox">

                    <div class="loadingSpinner"></div>

                    <p id="loadingText">
                        ${text}
                    </p>

                </div>

            `;

            document.body.appendChild(
                loading
            );

        }

        else {

            loading.style.display =
                "flex";


            const label =
                document.getElementById(
                    "loadingText"
                );


            if (label) {

                label.textContent =
                    text;

            }

        }

    }


    /* =====================================
       ローディング非表示
    ===================================== */

    function hideLoading() {

        const loading =
            document.getElementById(
                "loadingOverlay"
            );


        if (!loading) {

            return;

        }


        loading.style.display =
            "none";

    }


    /* =====================================
       全画面更新
    ===================================== */

    function refreshAll() {


        /* =============================
           Home
        ============================= */

        if (window.HomeAPI) {

            if (
                typeof HomeAPI.updateHome ===
                "function"
            ) {

                HomeAPI.updateHome();

            }

            else if (
                typeof HomeAPI.refresh ===
                "function"
            ) {

                HomeAPI.refresh();

            }

        }


        /* =============================
           Calendar
        ============================= */

        if (window.CalendarAPI) {

            if (
                typeof CalendarAPI.init ===
                "function"
            ) {

                CalendarAPI.init();

            }

            else if (
                typeof CalendarAPI.refresh ===
                "function"
            ) {

                CalendarAPI.refresh();

            }

        }


        /* =============================
           Timetable
        ============================= */

        if (window.TimetableAPI) {

            if (
                typeof TimetableAPI.init ===
                "function"
            ) {

                TimetableAPI.init();

            }

            else if (
                typeof TimetableAPI.refresh ===
                "function"
            ) {

                TimetableAPI.refresh();

            }

        }


            /* =============================
               Memo
            ============================= */

            if (window.MemoAPI) {

                if (
                    typeof MemoAPI.init ===
                    "function"
                ) {

                    MemoAPI.init();

                }

            }


        /* =============================
           Guide
        ============================= */

        if (window.GuideAPI) {

            if (
                typeof GuideAPI.refresh ===
                "function"
            ) {

                GuideAPI.refresh();

            }

            else if (
                typeof GuideAPI.init ===
                "function"
            ) {

                GuideAPI.init();

            }

        }


        /* =============================
           Settings
        ============================= */

        if (window.SettingsAPI) {

            if (
                typeof SettingsAPI.refreshSettings ===
                "function"
            ) {

                SettingsAPI.refreshSettings();

            }

            else if (
                typeof SettingsAPI.refresh ===
                "function"
            ) {

                SettingsAPI.refresh();

            }

        }

    }


    /*
    ========================================================
       ★ スマホ対応

       resizeイベントでは画面を更新しない。

       スマートフォンではキーボードの表示・非表示、
       ブラウザUIの変化などでもresizeが発生するため、

           resize
              ↓
           refreshCurrentPage
              ↓
           timetable.js
              ↓
           input再生成

       という問題が起きる。

       そのためresize監視は行わない。
    ========================================================
    */


    /* =====================================
       キーボードショートカット
    ===================================== */

    document.addEventListener(
        "keydown",
        event => {


            /* ---------------------------------
               入力中はショートカット無効
            --------------------------------- */

            const target =
                event.target;


            if (
                target &&
                (
                    target.tagName ===
                    "INPUT" ||

                    target.tagName ===
                    "TEXTAREA" ||

                    target.tagName ===
                    "SELECT"
                )
            ) {

                return;

            }


            /* ---------------------------------
               Ctrl + 1
               ホーム
            --------------------------------- */

            if (
                event.ctrlKey &&
                event.key === "1"
            ) {

                event.preventDefault();

                showPage(
                    "home"
                );

                return;

            }


            /* ---------------------------------
               Ctrl + 2
               予定
            --------------------------------- */

            if (
                event.ctrlKey &&
                event.key === "2"
            ) {

                event.preventDefault();

                showPage(
                    "calendar"
                );

                return;

            }


            /* ---------------------------------
               Ctrl + 3
               時間割
            --------------------------------- */

            if (
                event.ctrlKey &&
                event.key === "3"
            ) {

                event.preventDefault();

                showPage(
                    "timetable"
                );

                return;

            }


            /* ---------------------------------
               Ctrl + 4
               使い方
            --------------------------------- */

            if (
                event.ctrlKey &&
                event.key === "4"
            ) {

                event.preventDefault();

                showPage(
                    "guide"
                );

                return;

            }


            /* ---------------------------------
               Ctrl + 5
               設定
            --------------------------------- */

            if (
                event.ctrlKey &&
                event.key === "5"
            ) {

                event.preventDefault();

                showPage(
                    "settings"
                );

                return;

            }

        }
    );


    /* =====================================
       API
    ===================================== */

    window.AppAPI = {

        showPage,

        getCurrentPage,

        refreshCurrentPage,

        bindNavigation,

        notify,

        showLoading,

        hideLoading,

        refreshAll

    };


    /* =====================================
       初期化
    ===================================== */

    function init() {


        /* ---------------------------------
           起動ローディング
        --------------------------------- */

        showLoading(
            "School Planner を起動しています..."
        );


        try {


            /* =============================
               Settings
            ============================= */

            if (window.SettingsAPI) {

                if (
                    typeof SettingsAPI.init ===
                    "function"
                ) {

                    SettingsAPI.init();

                }

            }


            /* =============================
               Home
            ============================= */

            if (window.HomeAPI) {

                if (
                    typeof HomeAPI.init ===
                    "function"
                ) {

                    HomeAPI.init();

                }

            }


            /* =============================
               Timetable
            ============================= */

            if (window.TimetableAPI) {

                if (
                    typeof TimetableAPI.init ===
                    "function"
                ) {

                    TimetableAPI.init();

                }

            }


            /* =============================
               Calendar
            ============================= */

            if (window.CalendarAPI) {

                if (
                    typeof CalendarAPI.init ===
                    "function"
                ) {

                    CalendarAPI.init();

                }

            }


            /* =============================
               Guide
            ============================= */

            if (window.GuideAPI) {

                if (
                    typeof GuideAPI.init ===
                    "function"
                ) {

                    GuideAPI.init();

                }

            }


            /* =============================
               ナビゲーション
            ============================= */

            bindNavigation();


            /* =============================
               初期画面
            ============================= */

            showPage(
                "home"
            );


            /* =============================
               全体更新
            ============================= */

            refreshAll();


        }

        catch (error) {

            console.error(
                error
            );

            notify(
                "初期化中にエラーが発生しました。"
            );

        }

        finally {

            hideLoading();

        }

    }


    /* =====================================
       ページ復帰
    ===================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            /*
             * ページを離れて戻ってきた場合のみ更新。
             *
             * キーボード表示によるresizeでは
             * ここは実行されないため、
             * 時間割入力を邪魔しない。
             */

            if (
                !document.hidden
            ) {

                refreshCurrentPage();

            }

        }
    );


    /* =====================================
       オンライン復帰
    ===================================== */

    window.addEventListener(
        "online",
        () => {

            notify(
                "オンラインに接続しました"
            );

            refreshAll();

        }
    );


    /* =====================================
       オフライン
    ===================================== */

    window.addEventListener(
        "offline",
        () => {

            notify(
                "オフラインです"
            );

        }
    );


    /* =====================================
       初期化API追加
    ===================================== */

    Object.assign(
        window.AppAPI,
        {
            init
        }
    );


    /* =====================================
       DOM読込後
    ===================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            init();

        }
    );


})();
