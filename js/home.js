/* =========================================================
 * School Planner - home.js
 * ---------------------------------------------------------
 * ホーム画面管理
 *
 * 機能
 *  - 挨拶表示
 *  - クラス / 名前表示・編集
 *  - 今日の日付表示
 *  - 今日の時間割表示
 *  - 今日の予定表示
 *  - 次の予定表示
 *  - ホーム画面全体更新
 *
 * 4画面版
 *  - Home
 *  - Calendar
 *  - Timetable
 *  - Settings
 *
 * 削除
 *  - 学習時間
 *  - ストリーク
 *  - 学習統計
 * ========================================================= */

(() => {
    "use strict";


    /* =========================================================
     * 初期状態
     * ========================================================= */

    let initialized = false;


    /* =========================================================
     * DOMユーティリティ
     * ========================================================= */

    function getElement(id) {
        return document.getElementById(id);
    }


    function query(selector, parent = document) {
        return parent.querySelector(selector);
    }


    function queryAll(selector, parent = document) {
        return Array.from(
            parent.querySelectorAll(selector)
        );
    }


    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================================
     * 日付
     * ========================================================= */

    function pad(value) {
        return String(value).padStart(2, "0");
    }


    function getToday() {
        return new Date();
    }


    function getTodayString() {
        const today = getToday();

        return [
            today.getFullYear(),
            pad(today.getMonth() + 1),
            pad(today.getDate())
        ].join("-");
    }


    function getTodayLabel() {
        const today =
            getToday();

        const weekdays = [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];

        return `${today.getFullYear()}年 ${
            today.getMonth() + 1
        }月 ${
            today.getDate()
        }日（${
            weekdays[today.getDay()]
        }）`;
    }


    /* =========================================================
     * 曜日
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


    const WEEK_LABELS = {
        sun: "日",
        mon: "月",
        tue: "火",
        wed: "水",
        thu: "木",
        fri: "金",
        sat: "土"
    };


    function getTodayWeekKey() {
        return WEEK_KEYS[
            getToday().getDay()
        ];
    }


    /* =========================================================
     * DataAPI確認
     * ========================================================= */

    function hasDataAPI() {
        if (!window.DataAPI) {
            console.error(
                "Home: DataAPI が見つかりません。"
            );

            return false;
        }

        return true;
    }


    /* =========================================================
     * プロフィール
     * ========================================================= */

    function getProfile() {
        if (!hasDataAPI()) {
            return {
                class: "",
                name: ""
            };
        }

        return DataAPI.getProfile();
    }


    function getClassName() {
        const profile =
            getProfile();

        return profile.class || "";
    }


    function getUserName() {
        const profile =
            getProfile();

        return profile.name || "";
    }


    /* =========================================================
     * 名前表示
     * ========================================================= */

    function renderUserName() {
        const name =
            getUserName();


        const elements = [
            getElement("userName"),
            getElement("homeUserName"),
            getElement("profileName"),
            getElement("greetingName")
        ].filter(Boolean);


        elements.forEach(element => {

            element.textContent =
                name || "さん";
        });
    }


    /* =========================================================
     * クラス表示
     * ========================================================= */

    function renderClassName() {
        const className =
            getClassName();


        const elements = [
            getElement("className"),
            getElement("homeClassName"),
            getElement("profileClass")
        ].filter(Boolean);


        elements.forEach(element => {

            element.textContent =
                className || "クラス未設定";
        });
    }


    /* =========================================================
     * プロフィール入力欄
     * ========================================================= */

    function loadProfileForm() {
        const profile =
            getProfile();


        const nameInputs = [
            getElement("nameInput"),
            getElement("profileNameInput"),
            getElement("userNameInput")
        ].filter(Boolean);


        nameInputs.forEach(input => {
            input.value =
                profile.name || "";
        });


        const classInputs = [
            getElement("classInput"),
            getElement("profileClassInput"),
            getElement("userClassInput")
        ].filter(Boolean);


        classInputs.forEach(input => {
            input.value =
                profile.class || "";
        });
    }


    /* =========================================================
     * プロフィール保存
     * ========================================================= */

    function saveProfileFromForm() {
        if (!hasDataAPI()) {
            return false;
        }


        const nameInput =
            getElement("nameInput") ||
            getElement("profileNameInput") ||
            getElement("userNameInput");


        const classInput =
            getElement("classInput") ||
            getElement("profileClassInput") ||
            getElement("userClassInput");


        const name =
            nameInput
                ? nameInput.value.trim()
                : getUserName();


        const className =
            classInput
                ? classInput.value.trim()
                : getClassName();


        try {

            DataAPI.setProfile({
                name,
                class: className
            });


            renderUserName();
            renderClassName();


            showMessage(
                "プロフィールを保存しました。",
                "success"
            );


            return true;

        } catch (error) {

            console.error(
                "プロフィール保存エラー:",
                error
            );


            showMessage(
                "プロフィールの保存に失敗しました。",
                "error"
            );


            return false;
        }
    }


    /* =========================================================
     * 挨拶
     * ========================================================= */

    function getGreeting() {
        const hour =
            getToday().getHours();


        if (hour < 5) {
            return "こんばんは";
        }

        if (hour < 11) {
            return "おはようございます";
        }

        if (hour < 18) {
            return "こんにちは";
        }

        return "こんばんは";
    }


    function renderGreeting() {
        const greeting =
            getGreeting();


        const elements = [
            getElement("greeting"),
            getElement("homeGreeting"),
            getElement("greetingText")
        ].filter(Boolean);


        elements.forEach(element => {

            element.textContent =
                greeting;
        });


        const greetingElements = [
            getElement("greetingMessage"),
            getElement("homeGreetingMessage")
        ].filter(Boolean);


        greetingElements.forEach(element => {

            const name =
                getUserName();

            element.textContent =
                name
                    ? `${greeting}、${name}さん`
                    : greeting;
        });
    }


    /* =========================================================
     * 今日の日付
     * ========================================================= */

    function renderTodayDate() {
        const label =
            getTodayLabel();


        const elements = [
            getElement("todayDate"),
            getElement("homeDate"),
            getElement("currentDate"),
            getElement("homeTodayDate")
        ].filter(Boolean);


        elements.forEach(element => {

            element.textContent =
                label;
        });
    }


    /* =========================================================
     * 今日の時間割
     * ========================================================= */

    function renderTodayTimetable() {
        const containers = [
            getElement("todayTimetable"),
            getElement("homeTimetable"),
            getElement("todayClass"),
            getElement("todayClassList")
        ].filter(Boolean);


        /*
         * 重複しているDOM要素がある場合でも
         * 同じ要素を2回描画しない
         */
        const uniqueContainers =
            Array.from(
                new Set(containers)
            );


        if (
            window.TimetableAPI &&
            typeof TimetableAPI.renderTodayClass ===
                "function"
        ) {

            /*
             * TimetableAPI が専用DOMを見つけて
             * 描画できる場合は優先する。
             */
            TimetableAPI.renderTodayClass();


            /*
             * 専用DOM以外のホーム用コンテナについては
             * Home側で描画する。
             */
            uniqueContainers.forEach(container => {

                if (
                    container.id ===
                    "todayTimetable"
                ) {
                    return;
                }


                renderTimetableInto(
                    container
                );
            });


            return;
        }


        uniqueContainers.forEach(
            container => {
                renderTimetableInto(
                    container
                );
            }
        );
    }


    function renderTimetableInto(
        container
    ) {
        if (!container) {
            return;
        }


        let lessons = [];


        if (window.DataAPI) {

            const day =
                getTodayWeekKey();


            lessons =
                DataAPI.getDayTimetable(
                    day
                );
        }


        if (!Array.isArray(lessons)) {
            lessons = [];
        }


        const visibleLessons =
            lessons
                .map((lesson, index) => {

                    return {
                        lesson,
                        index
                    };
                })
                .filter(item => {

                    const text =
                        getLessonText(
                            item.lesson
                        ).trim();

                    return text !== "";
                });


        if (
            visibleLessons.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    今日の授業はありません。
                </div>
            `;

            return;
        }


        container.innerHTML =
            visibleLessons
                .map(item => {

                    const subject =
                        getLessonText(
                            item.lesson
                        );


                    const detail =
                        getLessonDetail(
                            item.lesson
                        );


                    return `
                        <div class="home-timetable-item">
                            <div class="home-timetable-period">
                                ${item.index + 1}
                            </div>

                            <div class="home-timetable-content">
                                <div class="home-timetable-subject">
                                    ${escapeHTML(subject)}
                                </div>

                                ${
                                    detail
                                        ? `
                                            <div class="home-timetable-detail">
                                                ${escapeHTML(detail)}
                                            </div>
                                        `
                                        : ""
                                }
                            </div>
                        </div>
                    `;
                })
                .join("");
    }


    /* =========================================================
     * 授業名取得
     * ========================================================= */

    function getLessonText(lesson) {
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
            return String(lesson);
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


    /* =========================================================
     * 授業詳細
     * ========================================================= */

    function getLessonDetail(lesson) {
        if (
            !lesson ||
            typeof lesson !==
                "object"
        ) {
            return "";
        }


        const details = [];


        if (lesson.teacher) {
            details.push(
                `先生: ${lesson.teacher}`
            );
        }


        if (lesson.room) {
            details.push(
                `教室: ${lesson.room}`
            );
        }


        if (lesson.memo) {
            details.push(
                lesson.memo
            );
        }


        return details.join(
            " / "
        );
    }


    /* =========================================================
     * 今日の予定
     * ========================================================= */

    function renderTodaySchedule() {
        if (
            window.CalendarAPI &&
            typeof CalendarAPI.renderTodaySchedule ===
                "function"
        ) {

            CalendarAPI.renderTodaySchedule();

            /*
             * CalendarAPI 側で対応している場合は
             * そちらを利用。
             */
            return;
        }


        const containers = [
            getElement("todaySchedule"),
            getElement("homeSchedule"),
            getElement("todayScheduleList"),
            getElement("homeScheduleList")
        ].filter(Boolean);


        const uniqueContainers =
            Array.from(
                new Set(containers)
            );


        if (uniqueContainers.length === 0) {
            return;
        }


        const schedules =
            hasDataAPI()
                ? DataAPI.getTodaySchedules()
                : [];


        uniqueContainers.forEach(container => {

            renderScheduleList(
                container,
                schedules
            );
        });
    }


    /* =========================================================
     * 予定一覧表示
     * ========================================================= */

    function renderScheduleList(
        container,
        schedules
    ) {
        if (!container) {
            return;
        }


        if (
            !Array.isArray(schedules) ||
            schedules.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    今日の予定はありません。
                </div>
            `;

            return;
        }


        container.innerHTML =
            schedules
                .map(schedule => {

                    return renderScheduleCard(
                        schedule
                    );
                })
                .join("");
    }


    /* =========================================================
     * 予定カード
     * ========================================================= */

    function renderScheduleCard(
        schedule
    ) {
        const time =
            escapeHTML(
                schedule.time || ""
            );


        const title =
            escapeHTML(
                schedule.title ||
                "無題の予定"
            );


        const memo =
            escapeHTML(
                schedule.memo || ""
            );


        return `
            <div class="home-schedule-item">

                ${
                    time
                        ? `
                            <div class="home-schedule-time">
                                ${time}
                            </div>
                        `
                        : ""
                }

                <div class="home-schedule-content">

                    <div class="home-schedule-title">
                        ${title}
                    </div>

                    ${
                        memo
                            ? `
                                <div class="home-schedule-memo">
                                    ${memo}
                                </div>
                            `
                            : ""
                    }

                </div>

            </div>
        `;
    }


    /* =========================================================
     * 次の予定
     * ========================================================= */

    function renderNextSchedule() {
        const containers = [
            getElement("nextSchedule"),
            getElement("homeNextSchedule"),
            getElement("nextScheduleItem")
        ].filter(Boolean);


        const uniqueContainers =
            Array.from(
                new Set(containers)
            );


        if (
            uniqueContainers.length === 0
        ) {
            return;
        }


        if (
            window.CalendarAPI &&
            typeof CalendarAPI.renderNextSchedule ===
                "function"
        ) {

            CalendarAPI.renderNextSchedule();

            /*
             * CalendarAPI 側が対応している
             * nextSchedule を使用する。
             */
            return;
        }


        let nextSchedule =
            null;


        if (hasDataAPI()) {
            nextSchedule =
                DataAPI.getNextSchedule(
                    new Date()
                );
        }


        uniqueContainers.forEach(
            container => {

                if (!nextSchedule) {

                    container.innerHTML = `
                        <div class="empty-state">
                            次の予定はありません。
                        </div>
                    `;

                    return;
                }


                container.innerHTML =
                    renderNextScheduleCard(
                        nextSchedule
                    );
            }
        );
    }


    /* =========================================================
     * 次の予定カード
     * ========================================================= */

    function renderNextScheduleCard(
        schedule
    ) {
        let dateLabel =
            schedule.date || "";


        if (schedule.date) {

            const parts =
                String(
                    schedule.date
                ).split("-");


            if (
                parts.length === 3
            ) {
                dateLabel =
                    `${Number(parts[1])}/${Number(parts[2])}`;
            }
        }


        const time =
            escapeHTML(
                schedule.time || ""
            );


        const title =
            escapeHTML(
                schedule.title ||
                "無題の予定"
            );


        const memo =
            escapeHTML(
                schedule.memo || ""
            );


        return `
            <div class="home-next-schedule">

                <div class="home-next-schedule-date">
                    ${escapeHTML(dateLabel)}
                    ${
                        time
                            ? ` ${time}`
                            : ""
                    }
                </div>

                <div class="home-next-schedule-title">
                    ${title}
                </div>

                ${
                    memo
                        ? `
                            <div class="home-next-schedule-memo">
                                ${memo}
                            </div>
                        `
                        : ""
                }

            </div>
        `;
    }


    /* =========================================================
     * 空状態
     * ========================================================= */

    function renderEmptyState(
        container,
        message
    ) {
        if (!container) {
            return;
        }


        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(message)}
            </div>
        `;
    }


    /* =========================================================
     * プロフィール編集ボタン
     * ========================================================= */

    function bindProfileButtons() {
        const buttons = [
            getElement("saveProfileButton"),
            getElement("profileSaveButton"),
            getElement("saveUserButton")
        ].filter(Boolean);


        buttons.forEach(button => {

            if (
                button.dataset.homeProfileBound ===
                "true"
            ) {
                return;
            }


            button.dataset.homeProfileBound =
                "true";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    saveProfileFromForm();
                }
            );
        });


        const forms = [
            getElement("profileForm"),
            getElement("homeProfileForm")
        ].filter(Boolean);


        forms.forEach(form => {

            if (
                form.dataset.homeProfileBound ===
                "true"
            ) {
                return;
            }


            form.dataset.homeProfileBound =
                "true";


            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    saveProfileFromForm();
                }
            );
        });
    }


    /* =========================================================
     * ページ内リンク
     * ========================================================= */

    function bindHomeNavigation() {
        const calendarButtons = [
            getElement("homeCalendarButton"),
            getElement("viewCalendarButton"),
            getElement("seeScheduleButton")
        ].filter(Boolean);


        calendarButtons.forEach(button => {

            if (
                button.dataset.homeNavBound ===
                "true"
            ) {
                return;
            }


            button.dataset.homeNavBound =
                "true";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    navigateTo(
                        "calendar"
                    );
                }
            );
        });


        const timetableButtons = [
            getElement("homeTimetableButton"),
            getElement("viewTimetableButton"),
            getElement("seeTimetableButton")
        ].filter(Boolean);


        timetableButtons.forEach(button => {

            if (
                button.dataset.homeNavBound ===
                "true"
            ) {
                return;
            }


            button.dataset.homeNavBound =
                "true";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    navigateTo(
                        "timetable"
                    );
                }
            );
        });


        const settingsButtons = [
            getElement("homeSettingsButton"),
            getElement("profileSettingsButton")
        ].filter(Boolean);


        settingsButtons.forEach(button => {

            if (
                button.dataset.homeNavBound ===
                "true"
            ) {
                return;
            }


            button.dataset.homeNavBound =
                "true";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    navigateTo(
                        "settings"
                    );
                }
            );
        });
    }


    /* =========================================================
     * ページ移動
     * ========================================================= */

    function navigateTo(
        page
    ) {
        /*
         * app.js の API がある場合
         */
        if (
            window.AppAPI &&
            typeof AppAPI.navigate ===
                "function"
        ) {

            AppAPI.navigate(
                page
            );

            return;
        }


        /*
         * 一般的な showPage API
         */
        if (
            window.AppAPI &&
            typeof AppAPI.showPage ===
                "function"
        ) {

            AppAPI.showPage(
                page
            );

            return;
        }


        /*
         * 直接 page 切り替え
         */
        const pages = [
            "home",
            "calendar",
            "timetable",
            "settings"
        ];


        pages.forEach(
            pageName => {

                const pageElement =
                    getElement(
                        `${pageName}Page`
                    );


                if (!pageElement) {
                    return;
                }


                if (
                    pageName ===
                    page
                ) {

                    pageElement.classList.add(
                        "active"
                    );

                    pageElement.classList.remove(
                        "hidden"
                    );

                } else {

                    pageElement.classList.remove(
                        "active"
                    );

                    pageElement.classList.add(
                        "hidden"
                    );
                }
            }
        );
    }


    /* =========================================================
     * 更新
     * ========================================================= */

    function refreshHome() {
        renderGreeting();

        renderUserName();

        renderClassName();

        renderTodayDate();

        loadProfileForm();

        renderTodayTimetable();

        renderTodaySchedule();

        renderNextSchedule();
    }


    /* =========================================================
     * プロフィールだけ更新
     * ========================================================= */

    function refreshProfile() {
        renderGreeting();

        renderUserName();

        renderClassName();

        loadProfileForm();
    }


    /* =========================================================
     * 時間割だけ更新
     * ========================================================= */

    function refreshTimetable() {
        renderTodayTimetable();
    }


    /* =========================================================
     * 予定だけ更新
     * ========================================================= */

    function refreshSchedules() {
        renderTodaySchedule();

        renderNextSchedule();
    }


    /* =========================================================
     * メッセージ
     * ========================================================= */

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
            window.showToast &&
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
            `[Home:${type}] ${message}`
        );
    }


    /* =========================================================
     * ページが表示されたときの更新
     * ========================================================= */

    function handlePageVisible() {
        refreshHome();
    }


    /* =========================================================
     * イベント監視
     * ========================================================= */

    function bindStorageEvent() {
        window.addEventListener(
            "storage",
            event => {

                if (
                    event.key ===
                    "schoolPlannerData"
                ) {
                    refreshHome();
                }
            }
        );
    }


    /* =========================================================
     * カスタムイベント
     * ========================================================= */

    function bindCustomEvents() {
        const events = [
            "schoolPlanner:dataChanged",
            "schoolPlanner:timetableChanged",
            "schoolPlanner:scheduleChanged",
            "schoolPlanner:profileChanged"
        ];


        events.forEach(
            eventName => {

                window.addEventListener(
                    eventName,
                    () => {
                        refreshHome();
                    }
                );
            }
        );
    }


    /* =========================================================
     * 初期化
     * ========================================================= */

    function init() {
        if (initialized) {
            return;
        }


        initialized = true;


        if (!hasDataAPI()) {
            return;
        }


        bindProfileButtons();

        bindHomeNavigation();

        bindStorageEvent();

        bindCustomEvents();

        refreshHome();


        console.log(
            "School Planner: Home initialized."
        );
    }


    /* =========================================================
     * 公開API
     * ========================================================= */

    window.HomeAPI = {

        /* -----------------------------------------
         * 基本
         * ----------------------------------------- */

        getToday,
        getTodayString,
        getTodayLabel,
        getGreeting,


        /* -----------------------------------------
         * Profile
         * ----------------------------------------- */

        getProfile,
        getClassName,
        getUserName,

        renderUserName,
        renderClassName,
        loadProfileForm,

        saveProfileFromForm,


        /* -----------------------------------------
         * Home表示
         * ----------------------------------------- */

        renderGreeting,
        renderTodayDate,

        renderTodayTimetable,
        renderTodaySchedule,
        renderNextSchedule,

        renderTimetableInto,
        renderScheduleList,
        renderScheduleCard,
        renderNextScheduleCard,

        renderEmptyState,


        /* -----------------------------------------
         * 更新
         * ----------------------------------------- */

        refreshProfile,
        refreshTimetable,
        refreshSchedules,
        refreshHome,


        /* -----------------------------------------
         * 初期化
         * ----------------------------------------- */

        init
    };


    /* =========================================================
     * DOMContentLoaded
     * ========================================================= */

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