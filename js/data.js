/* =========================================================
 * School Planner - data.js
 * ---------------------------------------------------------
 * アプリ全体からデータへアクセスするためのAPI
 *
 * 4画面版:
 *  - Home
 *  - Calendar / Schedule
 *  - Timetable
 *  - Settings
 *
 * 削除:
 *  - Study Logs
 *  - Study Time
 *  - Streak
 *  - Statistics
 * ========================================================= */

(() => {
    "use strict";

    /* =========================================================
     * Storage API確認
     * ========================================================= */

    if (!window.StorageAPI) {
        console.error(
            "School Planner: StorageAPI が見つかりません。"
        );
        return;
    }


    /* =========================================================
     * 定数
     * ========================================================= */

    const WEEK_KEYS = [
        "sun",
        "mon",
        "tue",
        "wed",
        "thu",
        "fri",
        "sat"
    ];

    const DAY_LABELS = {
        sun: "日",
        mon: "月",
        tue: "火",
        wed: "水",
        thu: "木",
        fri: "金",
        sat: "土"
    };


    /* =========================================================
     * 共通ユーティリティ
     * ========================================================= */

    function getData() {
        return StorageAPI.getData();
    }


    function saveData(data) {
        return StorageAPI.setData(data);
    }


    function updateData(callback) {
        return StorageAPI.update(callback);
    }


    function clone(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            console.error(
                "DataAPI: データ複製に失敗しました。",
                error
            );

            return null;
        }
    }


    function createId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }


    function normalizeDay(day) {
        if (!day) {
            return null;
        }

        const value = String(day).toLowerCase();

        if (WEEK_KEYS.includes(value)) {
            return value;
        }

        return null;
    }


    /* =========================================================
     * Profile
     * ========================================================= */

    function getProfile() {
        const data = getData();

        return {
            class: data.profile?.class || "",
            name: data.profile?.name || ""
        };
    }


    function setProfile(profile = {}) {
        return updateData(data => {

            if (!data.profile) {
                data.profile = {};
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    profile,
                    "class"
                )
            ) {
                data.profile.class =
                    String(profile.class ?? "");
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    profile,
                    "name"
                )
            ) {
                data.profile.name =
                    String(profile.name ?? "");
            }

            return data;
        });
    }


    function getClassName() {
        return getProfile().class;
    }


    function setClassName(className) {
        return updateData(data => {

            if (!data.profile) {
                data.profile = {};
            }

            data.profile.class =
                String(className ?? "");

            return data;
        });
    }


    function getUserName() {
        return getProfile().name;
    }


    function setUserName(name) {
        return updateData(data => {

            if (!data.profile) {
                data.profile = {};
            }

            data.profile.name =
                String(name ?? "");

            return data;
        });
    }


    /* =========================================================
     * Timetable
     * ========================================================= */

    function getTimetable() {
        const data = getData();

        if (!data.timetable) {
            data.timetable = {};
        }

        const result = {};

        WEEK_KEYS.forEach(day => {
            result[day] = Array.isArray(
                data.timetable[day]
            )
                ? clone(data.timetable[day])
                : [];
        });

        return result;
    }


    function getDayTimetable(day) {
        const normalizedDay = normalizeDay(day);

        if (!normalizedDay) {
            return [];
        }

        const timetable = getTimetable();

        return Array.isArray(
            timetable[normalizedDay]
        )
            ? timetable[normalizedDay]
            : [];
    }


    function setTimetable(timetable) {
        if (!timetable || typeof timetable !== "object") {
            throw new Error(
                "DataAPI.setTimetable: timetable が必要です。"
            );
        }

        return updateData(data => {

            if (!data.timetable) {
                data.timetable = {};
            }

            WEEK_KEYS.forEach(day => {

                if (Array.isArray(timetable[day])) {
                    data.timetable[day] =
                        clone(timetable[day]) || [];
                } else {
                    data.timetable[day] = [];
                }

            });

            return data;
        });
    }


    function setDayTimetable(day, lessons) {
        const normalizedDay = normalizeDay(day);

        if (!normalizedDay) {
            throw new Error(
                "DataAPI.setDayTimetable: 曜日が正しくありません。"
            );
        }

        if (!Array.isArray(lessons)) {
            lessons = [];
        }

        return updateData(data => {

            if (!data.timetable) {
                data.timetable = {};
            }

            data.timetable[normalizedDay] =
                clone(lessons) || [];

            return data;
        });
    }


    function addTimetableLesson(day, lesson) {
        const normalizedDay = normalizeDay(day);

        if (!normalizedDay) {
            throw new Error(
                "DataAPI.addTimetableLesson: 曜日が正しくありません。"
            );
        }

        const newLesson =
            typeof lesson === "object" &&
            lesson !== null
                ? clone(lesson)
                : lesson;

        return updateData(data => {

            if (!data.timetable) {
                data.timetable = {};
            }

            if (
                !Array.isArray(
                    data.timetable[normalizedDay]
                )
            ) {
                data.timetable[normalizedDay] = [];
            }

            data.timetable[normalizedDay].push(
                newLesson
            );

            return data;
        });
    }


    function updateTimetableLesson(
        day,
        index,
        lesson
    ) {
        const normalizedDay = normalizeDay(day);

        if (!normalizedDay) {
            throw new Error(
                "DataAPI.updateTimetableLesson: 曜日が正しくありません。"
            );
        }

        if (!Number.isInteger(index)) {
            return false;
        }

        return updateData(data => {

            if (!data.timetable) {
                data.timetable = {};
            }

            if (
                !Array.isArray(
                    data.timetable[normalizedDay]
                )
            ) {
                data.timetable[normalizedDay] = [];
            }

            if (
                index < 0 ||
                index >=
                    data.timetable[normalizedDay].length
            ) {
                return data;
            }

            data.timetable[normalizedDay][index] =
                clone(lesson);

            return data;
        });
    }


    function deleteTimetableLesson(day, index) {
        const normalizedDay = normalizeDay(day);

        if (!normalizedDay) {
            return false;
        }

        if (!Number.isInteger(index)) {
            return false;
        }

        return updateData(data => {

            if (
                !data.timetable ||
                !Array.isArray(
                    data.timetable[normalizedDay]
                )
            ) {
                return data;
            }

            if (
                index >= 0 &&
                index <
                    data.timetable[normalizedDay].length
            ) {
                data.timetable[normalizedDay].splice(
                    index,
                    1
                );
            }

            return data;
        });
    }


    function clearDayTimetable(day) {
        const normalizedDay = normalizeDay(day);

        if (!normalizedDay) {
            return false;
        }

        return updateData(data => {

            if (!data.timetable) {
                data.timetable = {};
            }

            data.timetable[normalizedDay] = [];

            return data;
        });
    }


    function clearTimetable() {
        return updateData(data => {

            data.timetable = {
                sun: [],
                mon: [],
                tue: [],
                wed: [],
                thu: [],
                fri: [],
                sat: []
            };

            return data;
        });
    }


    /* =========================================================
     * Schedule
     * ========================================================= */

    function getSchedules() {
        const data = getData();

        if (!Array.isArray(data.schedules)) {
            return [];
        }

        return clone(data.schedules) || [];
    }


    function getSchedule(id) {
        const schedules = getSchedules();

        return (
            schedules.find(
                schedule =>
                    String(schedule.id) ===
                    String(id)
            ) || null
        );
    }


    function getSchedulesByDate(date) {
        const targetDate = String(date ?? "");

        if (!targetDate) {
            return [];
        }

        return getSchedules()
            .filter(schedule => {
                return String(schedule.date) ===
                    targetDate;
            })
            .sort((a, b) => {

                const timeA =
                    String(a.time || "");

                const timeB =
                    String(b.time || "");

                return timeA.localeCompare(
                    timeB,
                    "ja"
                );
            });
    }


    function addSchedule(schedule = {}) {
        const newSchedule = {
            id: schedule.id ??
                createId(),

            date: String(
                schedule.date ?? ""
            ),

            time: String(
                schedule.time ?? ""
            ),

            title: String(
                schedule.title ??
                schedule.name ??
                "",

            ),

            memo: String(
                schedule.memo ??
                schedule.description ??
                ""
            )
        };

        return updateData(data => {

            if (!Array.isArray(data.schedules)) {
                data.schedules = [];
            }

            data.schedules.push(
                newSchedule
            );

            return data;
        });
    }


    function updateSchedule(id, updates = {}) {
        return updateData(data => {

            if (!Array.isArray(data.schedules)) {
                data.schedules = [];
            }

            const target = data.schedules.find(
                schedule =>
                    String(schedule.id) ===
                    String(id)
            );

            if (!target) {
                return data;
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    updates,
                    "date"
                )
            ) {
                target.date =
                    String(updates.date ?? "");
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    updates,
                    "time"
                )
            ) {
                target.time =
                    String(updates.time ?? "");
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    updates,
                    "title"
                )
            ) {
                target.title =
                    String(updates.title ?? "");
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    updates,
                    "memo"
                )
            ) {
                target.memo =
                    String(updates.memo ?? "");
            }

            return data;
        });
    }


    function deleteSchedule(id) {
        return updateData(data => {

            if (!Array.isArray(data.schedules)) {
                data.schedules = [];
            }

            data.schedules =
                data.schedules.filter(
                    schedule =>
                        String(schedule.id) !==
                        String(id)
                );

            return data;
        });
    }


    function clearSchedules() {
        return updateData(data => {

            data.schedules = [];

            return data;
        });
    }


    /* =========================================================
     * 今日の予定
     * ========================================================= */

    function getTodayString() {
        const date = new Date();

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function getTodaySchedules() {
        return getSchedulesByDate(
            getTodayString()
        );
    }


    /* =========================================================
     * 次の予定
     * ========================================================= */

    function getNextSchedule(
        fromDate = new Date()
    ) {
        const current =
            fromDate instanceof Date
                ? fromDate
                : new Date(fromDate);

        if (Number.isNaN(current.getTime())) {
            return null;
        }

        const schedules = getSchedules();

        const candidates = schedules
            .map(schedule => {

                if (!schedule.date) {
                    return null;
                }

                let dateTime;

                if (schedule.time) {
                    dateTime = new Date(
                        `${schedule.date}T${schedule.time}`
                    );
                } else {
                    dateTime = new Date(
                        `${schedule.date}T00:00:00`
                    );
                }

                if (
                    Number.isNaN(
                        dateTime.getTime()
                    )
                ) {
                    return null;
                }

                return {
                    ...schedule,
                    _dateTime: dateTime
                };
            })
            .filter(Boolean)
            .filter(item => {
                return (
                    item._dateTime.getTime() >=
                    current.getTime()
                );
            })
            .sort((a, b) => {
                return (
                    a._dateTime.getTime() -
                    b._dateTime.getTime()
                );
            });

        if (candidates.length === 0) {
            return null;
        }

        const result = {
            ...candidates[0]
        };

        delete result._dateTime;

        return result;
    }


    /* =========================================================
     * Settings
     * ========================================================= */

    function getSettings() {
        const data = getData();

        return {
            theme:
                data.settings?.theme ||
                "light",

            notification:
                typeof data.settings?.notification ===
                "boolean"
                    ? data.settings.notification
                    : true
        };
    }


    function setSettings(settings = {}) {
        return updateData(data => {

            if (!data.settings) {
                data.settings = {};
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    settings,
                    "theme"
                )
            ) {
                const theme =
                    String(settings.theme);

                if (
                    theme === "light" ||
                    theme === "dark" ||
                    theme === "system"
                ) {
                    data.settings.theme = theme;
                }
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    settings,
                    "notification"
                )
            ) {
                data.settings.notification =
                    Boolean(
                        settings.notification
                    );
            }

            return data;
        });
    }


    function getTheme() {
        return getSettings().theme;
    }


    function setTheme(theme) {
        return setSettings({
            theme
        });
    }


    function getNotificationEnabled() {
        return getSettings()
            .notification;
    }


    function setNotificationEnabled(
        enabled
    ) {
        return setSettings({
            notification: Boolean(enabled)
        });
    }


    /* =========================================================
     * Backup / Import / Export
     * ========================================================= */

    function backup() {
        return StorageAPI.backup();
    }


    function hasBackup() {
        return StorageAPI.hasBackup();
    }


    function restoreBackup() {
        return StorageAPI.restoreBackup();
    }


    function exportJSON() {
        return StorageAPI.exportJSON();
    }


    function importJSON(file) {
        return StorageAPI.importJSON(file);
    }


    /* =========================================================
     * データ全体
     * ========================================================= */

    function getAllData() {
        return getData();
    }


    function setAllData(data) {
        return saveData(data);
    }


    function resetData() {
        return StorageAPI.reset();
    }


    function clearAllData() {
        return StorageAPI.clearAll();
    }


    function hasData() {
        return StorageAPI.exists();
    }


    function getStorageSize() {
        return StorageAPI.size();
    }


    function getDataVersion() {
        return StorageAPI.getVersion();
    }


    /* =========================================================
     * 曜日情報
     * ========================================================= */

    function getWeekKeys() {
        return [...WEEK_KEYS];
    }


    function getDayLabel(day) {
        const normalizedDay =
            normalizeDay(day);

        if (!normalizedDay) {
            return "";
        }

        return DAY_LABELS[normalizedDay] || "";
    }


    function getDayLabels() {
        return {
            ...DAY_LABELS
        };
    }


    /* =========================================================
     * API公開
     * ========================================================= */

    window.DataAPI = {

        /* -----------------------------------------
         * Profile
         * ----------------------------------------- */

        getProfile,
        setProfile,

        getClassName,
        setClassName,

        getUserName,
        setUserName,


        /* -----------------------------------------
         * Timetable
         * ----------------------------------------- */

        getTimetable,
        getDayTimetable,

        setTimetable,
        setDayTimetable,

        addTimetableLesson,
        updateTimetableLesson,
        deleteTimetableLesson,

        clearDayTimetable,
        clearTimetable,


        /* -----------------------------------------
         * Schedule
         * ----------------------------------------- */

        getSchedules,
        getSchedule,
        getSchedulesByDate,

        addSchedule,
        updateSchedule,
        deleteSchedule,
        clearSchedules,

        getTodayString,
        getTodaySchedules,
        getNextSchedule,


        /* -----------------------------------------
         * Settings
         * ----------------------------------------- */

        getSettings,
        setSettings,

        getTheme,
        setTheme,

        getNotificationEnabled,
        setNotificationEnabled,


        /* -----------------------------------------
         * Backup / Import / Export
         * ----------------------------------------- */

        backup,
        hasBackup,
        restoreBackup,

        exportJSON,
        importJSON,


        /* -----------------------------------------
         * Data
         * ----------------------------------------- */

        getAllData,
        setAllData,

        resetData,
        clearAllData,

        hasData,
        getStorageSize,
        getDataVersion,


        /* -----------------------------------------
         * Week
         * ----------------------------------------- */

        getWeekKeys,
        getDayLabel,
        getDayLabels
    };


    /* =========================================================
     * 初期確認
     * ========================================================= */

    try {
        /*
         * StorageAPI がデータを初期化しているため、
         * ここでは取得確認だけ行う。
         */
        getData();

        console.log(
            "School Planner: DataAPI initialized."
        );

    } catch (error) {
        console.error(
            "School Planner: DataAPI 初期化エラー",
            error
        );
    }

})();