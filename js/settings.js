/* =====================================================
   School Planner
   settings.js
   Complete Edition - 4 Screen Version
   ===================================================== */

(() => {
    "use strict";


    /* =====================================================
       Utility
    ===================================================== */

    function showMessage(message) {

        if (
            window.AppAPI &&
            typeof AppAPI.notify === "function"
        ) {
            AppAPI.notify(message);
            return;
        }

        console.log(message);
    }


    /* =====================================================
       Settings
    ===================================================== */

    function getSettings() {

        if (
            !window.DataAPI ||
            typeof DataAPI.getSettings !== "function"
        ) {
            return {
                theme: "light"
            };
        }

        return DataAPI.getSettings();
    }


    function getTheme() {

        const settings =
            getSettings();

        return settings.theme === "dark"
            ? "dark"
            : "light";
    }


    function setTheme(theme) {

        const nextTheme =
            theme === "dark"
                ? "dark"
                : "light";


        if (
            window.DataAPI &&
            typeof DataAPI.setSetting ===
                "function"
        ) {

            DataAPI.setSetting(
                "theme",
                nextTheme
            );

        } else if (
            window.DataAPI &&
            typeof DataAPI.setTheme ===
                "function"
        ) {

            DataAPI.setTheme(
                nextTheme
            );
        }


        applyTheme(
            nextTheme
        );


        updateThemeButton();


        /*
         * 他の画面にも変更を通知
         */
        try {

            window.dispatchEvent(
                new CustomEvent(
                    "schoolPlanner:settingsChanged"
                )
            );

            window.dispatchEvent(
                new CustomEvent(
                    "schoolPlanner:dataChanged"
                )
            );

        } catch (error) {

            console.warn(
                "Theme event error:",
                error
            );
        }
    }


    /* =====================================================
       Theme
    ===================================================== */

    function applyTheme(theme) {

        const body =
            document.body;


        if (!body) {
            return;
        }


        /*
         * 重要:
         * style.css は body.dark を使用している
         */
        body.classList.remove(
            "light",
            "dark"
        );


        body.classList.add(
            theme === "dark"
                ? "dark"
                : "light"
        );
    }


    function toggleTheme() {

        const current =
            getTheme();


        const next =
            current === "light"
                ? "dark"
                : "light";


        setTheme(
            next
        );
    }


    function updateThemeButton() {

        const button =
            document.getElementById(
                "themeButton"
            );


        if (!button) {
            return;
        }


        const theme =
            getTheme();


        if (theme === "dark") {

            button.textContent =
                "☀️ ライトモード";

        } else {

            button.textContent =
                "🌙 ダークモード";
        }
    }


    function loadSettings() {

        const theme =
            getTheme();


        applyTheme(
            theme
        );


        updateThemeButton();
    }


    function refreshSettings() {

        loadSettings();
    }


    /* =====================================================
       Backup
    ===================================================== */

    function createBackup() {

        if (
            !window.StorageAPI ||
            typeof StorageAPI.backup !==
                "function"
        ) {

            showMessage(
                "バックアップ機能を利用できません。"
            );

            return false;
        }


        try {

            StorageAPI.backup();


            showMessage(
                "バックアップを作成しました。"
            );


            return true;

        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "バックアップの作成に失敗しました。"
            );


            return false;
        }
    }


    /* =====================================================
       Restore Backup
    ===================================================== */

    function restoreBackup() {

        if (
            !window.StorageAPI ||
            typeof StorageAPI.restoreBackup !==
                "function"
        ) {

            showMessage(
                "バックアップ機能を利用できません。"
            );

            return false;
        }


        try {

            const result =
                StorageAPI.restoreBackup();


            if (!result) {

                showMessage(
                    "バックアップがありません。"
                );

                return false;
            }


            showMessage(
                "バックアップを復元しました。"
            );


            window.location.reload();


            return true;

        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "バックアップの復元に失敗しました。"
            );


            return false;
        }
    }


    /* =====================================================
       Export
    ===================================================== */

    function exportData() {

        if (
            !window.StorageAPI ||
            typeof StorageAPI.exportJSON !==
                "function"
        ) {

            showMessage(
                "エクスポート機能を利用できません。"
            );

            return false;
        }


        try {

            const json =
                StorageAPI.exportJSON();


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            const now =
                new Date();


            const filename =
                `school-planner-${now.getFullYear()}-${
                    String(
                        now.getMonth() + 1
                    ).padStart(2, "0")
                }-${
                    String(
                        now.getDate()
                    ).padStart(2, "0")
                }.json`;


            link.href =
                url;


            link.download =
                filename;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );


            showMessage(
                "JSONを書き出しました。"
            );


            return true;

        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "JSONの書き出しに失敗しました。"
            );


            return false;
        }
    }


    /* =====================================================
       Import
    ===================================================== */

    async function importData(
        file
    ) {

        if (!file) {
            return false;
        }


        if (
            !window.StorageAPI ||
            typeof StorageAPI.importJSON !==
                "function"
        ) {

            showMessage(
                "インポート機能を利用できません。"
            );

            return false;
        }


        try {

            await StorageAPI.importJSON(
                file
            );


            showMessage(
                "インポートが完了しました。"
            );


            window.location.reload();


            return true;

        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "インポートに失敗しました。"
            );


            return false;
        }
    }


    /* =====================================================
       Import Dialog
    ===================================================== */

    function openImportDialog() {

        const input =
            document.createElement(
                "input"
            );


        input.type =
            "file";


        input.accept =
            ".json,application/json";


        input.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];


                if (file) {

                    importData(
                        file
                    );
                }
            }
        );


        input.click();
    }


    /* =====================================================
       Reset
    ===================================================== */

    function resetData() {

        const confirmed =
            window.confirm(
                "すべてのデータを削除しますか？"
            );


        if (!confirmed) {
            return false;
        }


        if (
            !window.StorageAPI ||
            typeof StorageAPI.reset !==
                "function"
        ) {

            showMessage(
                "初期化機能を利用できません。"
            );

            return false;
        }


        try {

            StorageAPI.reset();


            showMessage(
                "初期化しました。"
            );


            window.location.reload();


            return true;

        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "初期化に失敗しました。"
            );


            return false;
        }
    }


    /* =====================================================
       Event Binding
    ===================================================== */

    function bindEvents() {

        /* -------------------------------------
           Theme
        ------------------------------------- */

        const themeButton =
            document.getElementById(
                "themeButton"
            );


        if (
            themeButton &&
            themeButton.dataset.settingsBound !==
                "true"
        ) {

            themeButton.dataset.settingsBound =
                "true";


            themeButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    toggleTheme();
                }
            );
        }


        /* -------------------------------------
           Backup
        ------------------------------------- */

        const backupButton =
            document.getElementById(
                "backupButton"
            );


        if (
            backupButton &&
            backupButton.dataset.settingsBound !==
                "true"
        ) {

            backupButton.dataset.settingsBound =
                "true";


            backupButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    createBackup();
                }
            );
        }


        /* -------------------------------------
           Restore
        ------------------------------------- */

        const restoreButton =
            document.getElementById(
                "restoreButton"
            );


        if (
            restoreButton &&
            restoreButton.dataset.settingsBound !==
                "true"
        ) {

            restoreButton.dataset.settingsBound =
                "true";


            restoreButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    restoreBackup();
                }
            );
        }


        /* -------------------------------------
           Export
        ------------------------------------- */

        const exportButton =
            document.getElementById(
                "exportButton"
            );


        if (
            exportButton &&
            exportButton.dataset.settingsBound !==
                "true"
        ) {

            exportButton.dataset.settingsBound =
                "true";


            exportButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    exportData();
                }
            );
        }


        /* -------------------------------------
           Import
        ------------------------------------- */

        const importButton =
            document.getElementById(
                "importButton"
            );


        if (
            importButton &&
            importButton.dataset.settingsBound !==
                "true"
        ) {

            importButton.dataset.settingsBound =
                "true";


            importButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openImportDialog();
                }
            );
        }


        /* -------------------------------------
           Reset
        ------------------------------------- */

        const resetButton =
            document.getElementById(
                "resetButton"
            );


        if (
            resetButton &&
            resetButton.dataset.settingsBound !==
                "true"
        ) {

            resetButton.dataset.settingsBound =
                "true";


            resetButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    resetData();
                }
            );
        }
    }


    /* =====================================================
       Initialize
    ===================================================== */

    function init() {

        if (!window.DataAPI) {

            console.error(
                "Settings: DataAPI が読み込まれていません。"
            );

            return;
        }


        loadSettings();

        bindEvents();


        console.log(
            "School Planner: Settings initialized."
        );
    }


    /* =====================================================
       Public API
    ===================================================== */

    window.SettingsAPI = {

        getSettings,
        getTheme,
        setTheme,

        applyTheme,
        toggleTheme,
        updateThemeButton,

        loadSettings,
        refreshSettings,

        createBackup,
        restoreBackup,

        exportData,
        importData,
        openImportDialog,

        resetData,

        bindEvents,
        init
    };


    /* =====================================================
       DOM Ready
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();