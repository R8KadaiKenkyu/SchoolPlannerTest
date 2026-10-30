/*
=========================================================
 School Planner
 timetable.js
 Complete Edition
 Smartphone Input Fixed Version

 対応HTML
   #todayClass
   #weekTimetable
   #timetableEditor
   #saveTimetableButton
   #clearTimetableButton

 対応CSS
   .weekCard
   .lessonItem
   .lessonNumber
   .lessonName
   .editCard
   .lessonEdit
   .timetableEmpty
=========================================================
*/

(() => {

    "use strict";


    /* =====================================================
       Constants
    ===================================================== */

    const WEEK_KEYS = [

        "sun",
        "mon",
        "tue",
        "wed",
        "thu",
        "fri",
        "sat"

    ];


    const WEEK_NAMES = [

        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"

    ];


    const LESSON_COUNT = 7;


    /* =====================================================
       State
    ===================================================== */

    let initialized = false;


    /* =====================================================
       Utility
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function getElement(id) {

        return document.getElementById(
            id
        );

    }


    /* =====================================================
       DataAPI
    ===================================================== */

    function getLessons(dayKey) {

        if (
            !window.DataAPI ||
            typeof DataAPI.getDayTimetable !==
                "function"
        ) {

            return [];

        }


        const lessons =
            DataAPI.getDayTimetable(
                dayKey
            );


        return Array.isArray(lessons)
            ? lessons
            : [];

    }


    function getLessonName(
        lesson
    ) {

        if (
            lesson === null ||
            lesson === undefined
        ) {

            return "";

        }


        if (
            typeof lesson ===
            "string"
        ) {

            return lesson;

        }


        if (
            typeof lesson ===
            "number"
        ) {

            return String(
                lesson
            );

        }


        if (
            typeof lesson ===
            "object"
        ) {

            return String(
                lesson.subject ??
                lesson.name ??
                lesson.title ??
                ""
            );

        }


        return String(
            lesson
        );

    }


    function getLessonDetail(
        lesson
    ) {

        if (
            !lesson ||
            typeof lesson !==
                "object"
        ) {

            return "";

        }


        const parts = [];


        if (lesson.teacher) {

            parts.push(
                `先生: ${lesson.teacher}`
            );

        }


        if (lesson.room) {

            parts.push(
                `教室: ${lesson.room}`
            );

        }


        if (lesson.memo) {

            parts.push(
                String(
                    lesson.memo
                )
            );

        }


        return parts.join(
            " / "
        );

    }


    /* =====================================================
       Today's Key
    ===================================================== */

    function getTodayKey() {

        const day =
            new Date().getDay();


        return (
            WEEK_KEYS[day] ||
            "sun"
        );

    }


    function getTodayName() {

        const day =
            new Date().getDay();


        return (
            WEEK_NAMES[day] ||
            "日"
        );

    }


    /* =====================================================
       Today's Lessons
    ===================================================== */

    function getTodayLessons() {

        return getLessons(
            getTodayKey()
        );

    }


    function lessonCountToday() {

        return getTodayLessons()
            .filter(
                lesson => {

                    return (
                        getLessonName(
                            lesson
                        ).trim() !== ""
                    );

                }
            )
            .length;

    }


    function lessonNamesToday() {

        return getTodayLessons()
            .map(
                getLessonName
            )
            .filter(
                name =>
                    name.trim() !== ""
            );

    }


    /* =====================================================
       Home - Today's Timetable
    ===================================================== */

    function renderTodayClass() {

        const container =
            getElement(
                "todayClass"
            );


        if (!container) {

            return;

        }


        const lessons =
            getTodayLessons();


        const visibleLessons =
            lessons
                .map(
                    (lesson, index) => ({

                        lesson,
                        index

                    })
                )
                .filter(
                    item => {

                        return (
                            getLessonName(
                                item.lesson
                            ).trim() !== ""
                        );

                    }
                );


        if (
            visibleLessons.length ===
            0
        ) {

            container.innerHTML = `

                <div class="timetableEmpty">

                    今日の授業はありません

                </div>

            `;

            return;

        }


        container.innerHTML =
            visibleLessons
                .map(
                    item => {

                        const name =
                            getLessonName(
                                item.lesson
                            );


                        const detail =
                            getLessonDetail(
                                item.lesson
                            );


                        return `

                            <div class="lessonItem">

                                <div class="lessonNumber">

                                    ${item.index + 1}限

                                </div>


                                <div class="lessonName">

                                    ${escapeHTML(
                                        name
                                    )}

                                    ${
                                        detail
                                            ? `

                                                <div class="lessonDetail">

                                                    ${escapeHTML(
                                                        detail
                                                    )}

                                                </div>

                                            `
                                            : ""
                                    }

                                </div>

                            </div>

                        `;

                    }
                )
                .join(
                    ""
                );

    }


    /* =====================================================
       Weekly Timetable
    ===================================================== */

    function renderWeekTable() {

        const target =
            getElement(
                "weekTimetable"
            );


        if (!target) {

            return;

        }


        let html = "";


        WEEK_KEYS.forEach(
            (
                key,
                dayIndex
            ) => {

                const lessons =
                    getLessons(
                        key
                    );


                const hasLessons =
                    lessons.some(
                        lesson =>
                            getLessonName(
                                lesson
                            ).trim() !== ""
                    );


                html += `

                    <div class="weekCard">

                        <h3>

                            ${WEEK_NAMES[dayIndex]}曜日

                        </h3>

                `;


                if (!hasLessons) {

                    html += `

                        <div class="timetableEmpty">

                            授業が登録されていません

                        </div>

                    `;

                }

                else {

                    for (
                        let i = 0;
                        i < LESSON_COUNT;
                        i++
                    ) {

                        const lesson =
                            lessons[i] ??
                            "";


                        const name =
                            getLessonName(
                                lesson
                            );


                        const detail =
                            getLessonDetail(
                                lesson
                            );


                        html += `

                            <div class="lessonItem">

                                <div class="lessonNumber">

                                    ${i + 1}限

                                </div>


                                <div class="lessonName">

                                    ${
                                        name
                                            ? escapeHTML(
                                                name
                                            )
                                            : "---"
                                    }

                                    ${
                                        detail
                                            ? `

                                                <div class="lessonDetail">

                                                    ${escapeHTML(
                                                        detail
                                                    )}

                                                </div>

                                            `
                                            : ""
                                    }

                                </div>

                            </div>

                        `;

                    }

                }


                html += `

                    </div>

                `;

            }
        );


        target.innerHTML =
            html;

    }


    /* =====================================================
       ★ Editor Focus Check

       入力中のinputを再生成すると、
       スマートフォンではキーボードが閉じたり
       入力できなくなる。

       そのため、現在入力中なら
       renderEditor()を実行しない。
    ===================================================== */

    function isEditorFocused() {

        const active =
            document.activeElement;


        if (!active) {

            return false;

        }


        if (
            active.tagName !==
            "INPUT"
        ) {

            return false;

        }


        const editor =
            getElement(
                "timetableEditor"
            );


        if (!editor) {

            return false;

        }


        return editor.contains(
            active
        );

    }


    /* =====================================================
       Editor
    ===================================================== */

    function renderEditor(
        targetId = "timetableEditor"
    ) {

        const target =
            getElement(
                targetId
            );


        if (!target) {

            return;

        }


        /*
         * 入力中なら再生成しない
         */

        if (
            isEditorFocused()
        ) {

            return;

        }


        let html = "";


        WEEK_KEYS.forEach(
            (
                key,
                dayIndex
            ) => {

                const lessons =
                    getLessons(
                        key
                    );


                html += `

                    <div class="editCard">

                        <h3>

                            ${WEEK_NAMES[dayIndex]}曜日

                        </h3>

                `;


                for (
                    let i = 0;
                    i < LESSON_COUNT;
                    i++
                ) {

                    const lesson =
                        lessons[i] ??
                        "";


                    const name =
                        getLessonName(
                            lesson
                        );


                    html += `

                        <div class="lessonEdit">

                            <label
                                for="${key}_${i}"
                            >

                                ${i + 1}限

                            </label>


                            <input

                                type="text"

                                id="${key}_${i}"

                                value="${escapeHTML(
                                    name
                                )}"

                                placeholder="教科名"

                                autocomplete="off"

                                inputmode="text"

                            >

                        </div>

                    `;

                }


                html += `

                    </div>

                `;

            }
        );


        target.innerHTML =
            html;

    }


    /* =====================================================
       Load Editor
    ===================================================== */

    function loadEditor() {

        WEEK_KEYS.forEach(
            key => {

                const lessons =
                    getLessons(
                        key
                    );


                for (
                    let i = 0;
                    i < LESSON_COUNT;
                    i++
                ) {

                    const input =
                        getElement(
                            `${key}_${i}`
                        );


                    if (!input) {

                        continue;

                    }


                    input.value =
                        getLessonName(
                            lessons[i] ??
                            ""
                        );

                }

            }
        );

    }


    /* =====================================================
       Read One Day
    ===================================================== */

    function readDayEditor(
        dayKey
    ) {

        const lessons = [];


        for (
            let i = 0;
            i < LESSON_COUNT;
            i++
        ) {

            const input =
                getElement(
                    `${dayKey}_${i}`
                );


            if (!input) {

                lessons.push(
                    ""
                );

                continue;

            }


            lessons.push(
                input.value.trim()
            );

        }


        /*
         * 末尾の空欄を削除
         */

        while (
            lessons.length > 0 &&
            lessons[
                lessons.length - 1
            ] === ""
        ) {

            lessons.pop();

        }


        return lessons;

    }


    /* =====================================================
       Save Editor
    ===================================================== */

    function saveEditor() {

        if (
            !window.DataAPI ||
            typeof DataAPI.setDayTimetable !==
                "function"
        ) {

            showMessage(
                "DataAPIが見つかりません。",
                "error"
            );

            return false;

        }


        try {

            WEEK_KEYS.forEach(
                dayKey => {

                    const lessons =
                        readDayEditor(
                            dayKey
                        );


                    DataAPI.setDayTimetable(
                        dayKey,
                        lessons
                    );

                }
            );


            /*
             * 保存後は
             * 入力欄を再生成してよい。
             *
             * ここではすでに
             * データ保存が完了しているため安全。
             */

            renderTodayClass();

            renderWeekTable();

            renderEditor();

            bindButtons();


            showMessage(
                "時間割を保存しました。",
                "success"
            );


            notifyDataChanged();


            return true;

        }

        catch (error) {

            console.error(
                "Timetable: 保存エラー",
                error
            );


            showMessage(
                "時間割の保存に失敗しました。",
                "error"
            );


            return false;

        }

    }


    /* =====================================================
       Update One Day
    ===================================================== */

    function updateDay(
        dayKey
    ) {

        if (
            !WEEK_KEYS.includes(
                dayKey
            )
        ) {

            return false;

        }


        if (
            !window.DataAPI ||
            typeof DataAPI.setDayTimetable !==
                "function"
        ) {

            return false;

        }


        try {

            const lessons =
                readDayEditor(
                    dayKey
                );


            DataAPI.setDayTimetable(
                dayKey,
                lessons
            );


            renderTodayClass();

            renderWeekTable();


            notifyDataChanged();


            return true;

        }

        catch (error) {

            console.error(
                "Timetable: 曜日更新エラー",
                error
            );


            return false;

        }

    }


    /* =====================================================
       Clear Editor
    ===================================================== */

    function clearEditor() {

        WEEK_KEYS.forEach(
            key => {

                for (
                    let i = 0;
                    i < LESSON_COUNT;
                    i++
                ) {

                    const input =
                        getElement(
                            `${key}_${i}`
                        );


                    if (input) {

                        input.value = "";

                    }

                }

            }
        );

    }


    /* =====================================================
       Clear Timetable
    ===================================================== */

    function clearTimetable() {

        if (
            !window.DataAPI ||
            typeof DataAPI.clearTimetable !==
                "function"
        ) {

            showMessage(
                "DataAPIが見つかりません。",
                "error"
            );

            return false;

        }


        const confirmed =
            window.confirm(
                "週間時間割をすべて削除しますか？\nこの操作は取り消せません。"
            );


        if (!confirmed) {

            return false;

        }


        try {

            DataAPI.clearTimetable();


            clearEditor();


            renderTodayClass();

            renderWeekTable();


            showMessage(
                "時間割をすべて削除しました。",
                "success"
            );


            notifyDataChanged();


            return true;

        }

        catch (error) {

            console.error(
                "Timetable: 全削除エラー",
                error
            );


            showMessage(
                "時間割の削除に失敗しました。",
                "error"
            );


            return false;

        }

    }


    /* =====================================================
       Button Events
    ===================================================== */

    function bindButtons() {

        const saveButton =
            getElement(
                "saveTimetableButton"
            );


        if (
            saveButton &&
            saveButton.dataset.timetableBound !==
                "true"
        ) {

            saveButton.dataset.timetableBound =
                "true";


            saveButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    saveEditor();

                }
            );

        }


        const clearButton =
            getElement(
                "clearTimetableButton"
            );


        if (
            clearButton &&
            clearButton.dataset.timetableBound !==
                "true"
        ) {

            clearButton.dataset.timetableBound =
                "true";


            clearButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    clearTimetable();

                }
            );

        }

    }


    /* =====================================================
       Refresh
    ===================================================== */

    function refresh() {

        /*
         * 今日の授業と週間一覧は更新してOK
         */

        renderTodayClass();

        renderWeekTable();


        /*
         * ★入力中の場合は
         * エディタを再生成しない。
         */

        if (
            !isEditorFocused()
        ) {

            renderEditor();

        }


        bindButtons();

    }


    /* =====================================================
       Notifications
    ===================================================== */

    function notifyDataChanged() {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "schoolPlanner:timetableChanged"
                )
            );


            window.dispatchEvent(
                new CustomEvent(
                    "schoolPlanner:dataChanged"
                )
            );

        }

        catch (error) {

            console.warn(
                "Timetable: event dispatch failed.",
                error
            );

        }

    }


    /* =====================================================
       Message
    ===================================================== */

    function showMessage(
        message,
        type = "info"
    ) {

        if (
            window.AppAPI &&
            typeof AppAPI.showToast ===
                "function"
        ) {

            AppAPI.showToast(
                message,
                type
            );

            return;

        }


        if (
            window.AppAPI &&
            typeof AppAPI.notify ===
                "function"
        ) {

            AppAPI.notify(
                message
            );

            return;

        }


        if (
            typeof window.showToast ===
                "function"
        ) {

            window.showToast(
                message,
                type
            );

            return;

        }


        console.log(
            `[Timetable:${type}] ${message}`
        );

    }


    /* =====================================================
       Initialize
    ===================================================== */

    function init() {

        if (initialized) {

            /*
             * 何度initされても
             * ボタンイベントは重複登録しない
             */

            bindButtons();

            refresh();

            return;

        }


        initialized =
            true;


        bindButtons();

        refresh();


        console.log(
            "School Planner: Timetable initialized."
        );

    }


    /* =====================================================
       Public API
    ===================================================== */

    window.TimetableAPI = {

        init,

        refresh,

        getTodayKey,

        getTodayName,

        getTodayLessons,

        getLessons,

        lessonCountToday,

        lessonNamesToday,

        renderTodayClass,

        renderWeekTable,

        renderEditor,

        saveEditor,

        updateDay,

        clearEditor,

        loadEditor,

        clearTimetable

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

    }

    else {

        init();

    }


})();
