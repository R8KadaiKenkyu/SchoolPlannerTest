/* =========================================================
 * School Planner - storage.js
 * ---------------------------------------------------------
 * LocalStorage を一元管理するストレージモジュール
 *
 * 主な機能
 *  - 初期データ生成
 *  - 保存 / 読み込み
 *  - データ更新
 *  - バックアップ / 復元
 *  - JSONエクスポート / インポート
 *  - データリセット
 *  - LocalStorage使用量取得
 *
 * 4画面版では以下を削除
 *  - studyLogs
 *  - 学習時間関連データ
 *  - ストリーク関連データ
 *  - 統計関連データ
 * ========================================================= */

(() => {
    "use strict";

    /* =========================================================
     * 定数
     * ========================================================= */

    const STORAGE_KEY = "schoolPlannerData";
    const BACKUP_KEY = "schoolPlannerBackup";

    // 4画面版のデータ形式
    const VERSION = 2;


    /* =========================================================
     * 共通ユーティリティ
     * ========================================================= */

    function deepClone(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            console.error("deepClone failed:", error);
            return null;
        }
    }


    function isObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }


    function nowISO() {
        return new Date().toISOString();
    }


    function safeString(value, fallback = "") {
        if (value === null || value === undefined) {
            return fallback;
        }

        return String(value);
    }


    function safeBoolean(value, fallback = false) {
        if (typeof value === "boolean") {
            return value;
        }

        return fallback;
    }


    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }


    /* =========================================================
     * 初期データ
     * ========================================================= */

    function createInitialData() {
        const now = nowISO();

        return {
            version: VERSION,

            profile: {
                class: "",
                name: ""
            },

            /*
             * timetable
             *
             * 例:
             * {
             *   mon: ["国語", "数学", "英語"],
             *   tue: ["数学", "理科", "体育"]
             * }
             */
            timetable: {
                sun: [],
                mon: [],
                tue: [],
                wed: [],
                thu: [],
                fri: [],
                sat: []
            },

            /*
             * schedules
             *
             * 例:
             * {
             *   id: 1720000000000,
             *   date: "2026-09-05",
             *   time: "16:30",
             *   title: "数学テスト",
             *   memo: "教科書P20〜30"
             * }
             */
            schedules: [],

            settings: {
                theme: "light",
                notification: true
            },

            createdAt: now,
            updatedAt: now
        };
    }


    /* =========================================================
     * timetable 正規化
     * ========================================================= */

    function normalizeTimetable(source) {
        const result = {
            sun: [],
            mon: [],
            tue: [],
            wed: [],
            thu: [],
            fri: [],
            sat: []
        };

        if (!isObject(source)) {
            return result;
        }

        const weekKeys = [
            "sun",
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
            "sat"
        ];

        weekKeys.forEach(day => {
            const value = source[day];

            if (!Array.isArray(value)) {
                result[day] = [];
                return;
            }

            result[day] = value.map(item => {
                if (isObject(item)) {
                    return {
                        id: item.id ?? Date.now(),
                        subject: safeString(
                            item.subject ?? item.name ?? "",
                            ""
                        ),
                        teacher: safeString(item.teacher ?? "", ""),
                        room: safeString(item.room ?? "", ""),
                        memo: safeString(item.memo ?? "", "")
                    };
                }

                return safeString(item, "");
            });
        });

        return result;
    }


    /* =========================================================
     * schedule 正規化
     * ========================================================= */

    function normalizeSchedule(schedule, index = 0) {
        if (!isObject(schedule)) {
            return null;
        }

        let id = schedule.id;

        if (
            id === undefined ||
            id === null ||
            id === ""
        ) {
            id = Date.now() + index;
        }

        return {
            id: id,

            date: safeString(
                schedule.date ??
                schedule.day ??
                "",
                ""
            ),

            time: safeString(
                schedule.time ?? "",
                ""
            ),

            title: safeString(
                schedule.title ??
                schedule.name ??
                schedule.subject ??
                "",
                ""
            ),

            memo: safeString(
                schedule.memo ??
                schedule.description ??
                "",
                ""
            )
        };
    }


    function normalizeSchedules(source) {
        if (!Array.isArray(source)) {
            return [];
        }

        return source
            .map((schedule, index) => normalizeSchedule(schedule, index))
            .filter(Boolean);
    }


    /* =========================================================
     * settings 正規化
     * ========================================================= */

    function normalizeSettings(source) {
        const result = {
            theme: "light",
            notification: true
        };

        if (!isObject(source)) {
            return result;
        }

        const theme = safeString(source.theme, "light");

        if (
            theme === "light" ||
            theme === "dark" ||
            theme === "system"
        ) {
            result.theme = theme;
        } else {
            result.theme = "light";
        }

        result.notification = safeBoolean(
            source.notification,
            true
        );

        return result;
    }


    /* =========================================================
     * データ正規化
     *
     * 古いバージョンに studyLogs が存在していても、
     * 4画面版では自動的に除外する。
     * ========================================================= */

    function normalizeData(source) {
        const initial = createInitialData();

        if (!isObject(source)) {
            return initial;
        }

        const result = {
            version: VERSION,

            profile: {
                class: "",
                name: ""
            },

            timetable: normalizeTimetable(
                source.timetable
            ),

            schedules: normalizeSchedules(
                source.schedules
            ),

            settings: normalizeSettings(
                source.settings
            ),

            createdAt: safeString(
                source.createdAt,
                initial.createdAt
            ),

            updatedAt: nowISO()
        };


        /* -----------------------------------------
         * profile
         * ----------------------------------------- */

        if (isObject(source.profile)) {
            result.profile.class = safeString(
                source.profile.class ?? "",
                ""
            );

            result.profile.name = safeString(
                source.profile.name ?? "",
                ""
            );
        }


        /* -----------------------------------------
         * 日付が不正な場合
         * ----------------------------------------- */

        if (result.createdAt === "") {
            result.createdAt = initial.createdAt;
        }


        return result;
    }


    /* =========================================================
     * 保存
     * ========================================================= */

    function save(data) {
        const normalized = normalizeData(data);

        normalized.updatedAt = nowISO();

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(normalized)
            );

            return true;
        } catch (error) {
            console.error(
                "School Planner: データ保存に失敗しました。",
                error
            );

            throw new Error(
                "データを保存できませんでした。LocalStorageの容量を確認してください。"
            );
        }
    }


    /* =========================================================
     * 読み込み
     * ========================================================= */

    function load() {
        const raw = localStorage.getItem(STORAGE_KEY);

        /*
         * データが存在しない場合
         */
        if (!raw) {
            const initialData = createInitialData();

            save(initialData);

            return initialData;
        }


        try {
            const parsed = JSON.parse(raw);

            const normalized = normalizeData(parsed);

            /*
             * 古いデータを読み込んだ場合も、
             * 新しい形式に更新しておく
             */
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(normalized)
            );

            return normalized;

        } catch (error) {
            console.error(
                "School Planner: データ読み込みに失敗しました。",
                error
            );

            /*
             * 壊れたデータの場合は
             * 初期データへ復旧
             */
            const initialData = createInitialData();

            save(initialData);

            return initialData;
        }
    }


    /* =========================================================
     * getData
     * ========================================================= */

    function getData() {
        return load();
    }


    /* =========================================================
     * setData
     * ========================================================= */

    function setData(data) {
        if (!isObject(data)) {
            throw new Error(
                "setData: オブジェクト形式のデータが必要です。"
            );
        }

        return save(data);
    }


    /* =========================================================
     * update
     *
     * callback に現在のデータを渡し、
     * 変更後のデータを保存する。
     *
     * 例:
     *
     * StorageAPI.update(data => {
     *     data.profile.name = "太郎";
     *     return data;
     * });
     * ========================================================= */

    function update(callback) {
        if (typeof callback !== "function") {
            throw new Error(
                "StorageAPI.update: callback が必要です。"
            );
        }

        const currentData = load();

        const clonedData = deepClone(currentData);

        if (!clonedData) {
            throw new Error(
                "データの複製に失敗しました。"
            );
        }

        const updatedData = callback(clonedData);

        /*
         * callback が何も返さない場合は
         * 変更された clonedData をそのまま使用
         */
        const finalData =
            updatedData === undefined
                ? clonedData
                : updatedData;

        return save(finalData);
    }


    /* =========================================================
     * バックアップ
     * ========================================================= */

    function backup() {
        const data = load();

        try {
            localStorage.setItem(
                BACKUP_KEY,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {
            console.error(
                "School Planner: バックアップ作成に失敗しました。",
                error
            );

            throw new Error(
                "バックアップの作成に失敗しました。"
            );
        }
    }


    /* =========================================================
     * バックアップ存在確認
     * ========================================================= */

    function hasBackup() {
        return localStorage.getItem(BACKUP_KEY) !== null;
    }


    /* =========================================================
     * バックアップ復元
     * ========================================================= */

    function restoreBackup() {
        const raw = localStorage.getItem(BACKUP_KEY);

        if (!raw) {
            throw new Error(
                "バックアップデータが存在しません。"
            );
        }


        try {
            const parsed = JSON.parse(raw);

            const normalized = normalizeData(parsed);

            normalized.updatedAt = nowISO();

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(normalized)
            );

            return normalized;

        } catch (error) {
            console.error(
                "School Planner: バックアップ復元に失敗しました。",
                error
            );

            throw new Error(
                "バックアップデータを復元できませんでした。"
            );
        }
    }


    /* =========================================================
     * 初期状態へリセット
     * ========================================================= */

    function reset() {
        const initialData = createInitialData();

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(initialData)
            );

            return initialData;

        } catch (error) {
            console.error(
                "School Planner: リセットに失敗しました。",
                error
            );

            throw new Error(
                "データを初期状態へ戻せませんでした。"
            );
        }
    }


    /* =========================================================
     * JSONエクスポート
     *
     * JSON文字列を返す。
     * settings.js 側で Blob / download を行う。
     * ========================================================= */

    function exportJSON() {
        const data = load();

        return JSON.stringify(
            data,
            null,
            2
        );
    }


    /* =========================================================
     * JSONインポート
     *
     * File オブジェクトを受け取り、
     * 正規化してLocalStorageへ保存する。
     *
     * Promiseを返すので、
     *
     * await StorageAPI.importJSON(file)
     *
     * の形で利用できる。
     * ========================================================= */

    function importJSON(file) {
        return new Promise((resolve, reject) => {

            if (!(file instanceof Blob)) {
                reject(
                    new Error(
                        "JSONファイルを指定してください。"
                    )
                );
                return;
            }


            const reader = new FileReader();


            reader.onload = event => {
                try {
                    const text = event.target.result;

                    const parsed = JSON.parse(text);

                    if (!isObject(parsed)) {
                        throw new Error(
                            "JSONデータの形式が正しくありません。"
                        );
                    }

                    const normalized =
                        normalizeData(parsed);

                    save(normalized);

                    resolve(normalized);

                } catch (error) {
                    console.error(
                        "School Planner: JSONインポートに失敗しました。",
                        error
                    );

                    reject(
                        new Error(
                            "JSONデータを読み込めませんでした。"
                        )
                    );
                }
            };


            reader.onerror = () => {
                reject(
                    new Error(
                        "ファイルの読み込みに失敗しました。"
                    )
                );
            };


            reader.readAsText(
                file,
                "utf-8"
            );
        });
    }


    /* =========================================================
     * LocalStorageからメインデータを削除
     * ========================================================= */

    function clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);

            return true;

        } catch (error) {
            console.error(
                "School Planner: データ削除に失敗しました。",
                error
            );

            throw new Error(
                "データを削除できませんでした。"
            );
        }
    }


    /* =========================================================
     * データ存在確認
     * ========================================================= */

    function exists() {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }


    /* =========================================================
     * LocalStorage使用サイズ
     *
     * 返り値: bytes
     * ========================================================= */

    function size() {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return 0;
        }

        /*
         * Blob が使える環境ではUTF-8サイズを取得
         */
        try {
            return new Blob([
                raw
            ]).size;

        } catch (error) {
            /*
             * fallback
             */
            return raw.length * 2;
        }
    }


    /* =========================================================
     * バージョン取得
     * ========================================================= */

    function getVersion() {
        return VERSION;
    }


    /* =========================================================
     * 全削除
     *
     * メインデータ + バックアップ
     * ========================================================= */

    function clearAll() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(BACKUP_KEY);

            return true;

        } catch (error) {
            console.error(
                "School Planner: 全データ削除に失敗しました。",
                error
            );

            throw new Error(
                "データを完全に削除できませんでした。"
            );
        }
    }


    /* =========================================================
     * API公開
     * ========================================================= */

    window.StorageAPI = {

        // 初期データ
        createInitialData,

        // 基本操作
        save,
        load,
        getData,
        setData,
        update,

        // バックアップ
        backup,
        hasBackup,
        restoreBackup,

        // リセット / 削除
        reset,
        clear,
        clearAll,

        // JSON
        exportJSON,
        importJSON,

        // 情報
        exists,
        size,
        getVersion
    };


    /* =========================================================
     * 初期化
     * ========================================================= */

    try {
        /*
         * StorageAPI読み込み時点で
         * データが存在しなければ自動生成
         */
        if (!exists()) {
            save(createInitialData());
        }

    } catch (error) {
        console.error(
            "School Planner: Storage初期化に失敗しました。",
            error
        );
    }

})();
