/* =========================================================
 * School Planner - memo.js
 *
 * メモ機能 完成版
 *
 * 機能:
 * ・メモの新規作成、編集、削除
 * ・カテゴリ分類
 * ・キーワード検索
 * ・カテゴリ別絞り込み
 * ・LocalStorageへの保存
 * ・既存StorageAPIのバックアップ連携
 * ・PC / スマートフォン対応
 * ・ダークモード対応
 * ========================================================= */

(() => {
    "use strict";

    /* =====================================================
     * 定数
     * ===================================================== */

    const MEMO_STORAGE_KEY = "schoolPlannerMemos";
    const BACKUP_STORAGE_KEY = "schoolPlannerBackup";

    const CATEGORIES = [
        "考査・成績",
        "授業",
        "提出物",
        "その他"
    ];

    const DEFAULT_CATEGORY = "その他";


    /* =====================================================
     * 状態
     * ===================================================== */

    let memos = [];
    let editingId = null;
    let searchKeyword = "";
    let selectedCategory = "すべて";

    let initialized = false;


    /* =====================================================
     * 共通処理
     * ===================================================== */

    function createId() {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 10)
        );
    }


    function nowISO() {
        return new Date().toISOString();
    }


    function safeString(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value);
    }


    function normalizeMemo(source, index = 0) {
        if (
            !source ||
            typeof source !== "object" ||
            Array.isArray(source)
        ) {
            return null;
        }

        const category = CATEGORIES.includes(source.category)
            ? source.category
            : DEFAULT_CATEGORY;

        return {
            id: safeString(source.id) || createId() + index,

            title: safeString(source.title),

            body: safeString(
                source.body ?? source.memo ?? ""
            ),

            category,

            createdAt:
                safeString(source.createdAt) || nowISO(),

            updatedAt:
                safeString(source.updatedAt) ||
                safeString(source.createdAt) ||
                nowISO()
        };
    }


    function normalizeMemos(source) {
        if (!Array.isArray(source)) {
            return [];
        }

        return source
            .map((item, index) => normalizeMemo(item, index))
            .filter(Boolean);
    }


    /* =====================================================
     * メモの読み込み・保存
     * ===================================================== */

    function loadMemos() {
        try {
            const raw = localStorage.getItem(
                MEMO_STORAGE_KEY
            );

            if (!raw) {
                memos = [];
                return memos;
            }

            memos = normalizeMemos(JSON.parse(raw));

            return memos;

        } catch (error) {
            console.error(
                "メモの読み込みに失敗しました。",
                error
            );

            memos = [];

            return memos;
        }
    }


    function saveMemos(source = memos) {
        try {
            const normalized = normalizeMemos(source);

            localStorage.setItem(
                MEMO_STORAGE_KEY,
                JSON.stringify(normalized)
            );

            memos = normalized;

            return true;

        } catch (error) {
            console.error(
                "メモの保存に失敗しました。",
                error
            );

            throw new Error(
                "メモを保存できませんでした。端末の空き容量を確認してください。"
            );
        }
    }


    /* =====================================================
     * 既存StorageAPIとの連携
     *
     * 現在のstorage.jsはメモ用データを正規化時に
     * 除外するため、メモを別キーに保存する。
     *
     * そのうえでバックアップ・JSON入出力と連携する。
     * ===================================================== */

    function connectStorageAPI() {
        const api = window.StorageAPI;

        if (!api || api.__memoCompatibilityInstalled) {
            return;
        }

        api.__memoCompatibilityInstalled = true;


        /* -----------------------------------------
         * バックアップ作成
         * ----------------------------------------- */

        if (typeof api.backup === "function") {
            const originalBackup = api.backup.bind(api);

            api.backup = function () {
                const result = originalBackup();

                const raw = localStorage.getItem(
                    BACKUP_STORAGE_KEY
                );

                if (raw) {
                    const backupData = JSON.parse(raw);

                    backupData.memos = loadMemos();

                    localStorage.setItem(
                        BACKUP_STORAGE_KEY,
                        JSON.stringify(backupData)
                    );
                }

                return result;
            };
        }


        /* -----------------------------------------
         * バックアップ復元
         * ----------------------------------------- */

        if (typeof api.restoreBackup === "function") {
            const originalRestore =
                api.restoreBackup.bind(api);

            api.restoreBackup = function () {
                const raw = localStorage.getItem(
                    BACKUP_STORAGE_KEY
                );

                const backupData = raw
                    ? JSON.parse(raw)
                    : null;

                const result = originalRestore();

                if (
                    backupData &&
                    Array.isArray(backupData.memos)
                ) {
                    saveMemos(backupData.memos);
                }

                refresh();

                return result;
            };
        }


        /* -----------------------------------------
         * JSONエクスポート
         * ----------------------------------------- */

        if (typeof api.exportJSON === "function") {
            const originalExport = api.exportJSON.bind(api);

            api.exportJSON = function () {
                const raw = originalExport();
                const data = JSON.parse(raw);

                data.memos = loadMemos();

                return JSON.stringify(data, null, 2);
            };
        }


        /* -----------------------------------------
         * JSONインポート
         * ----------------------------------------- */

        if (typeof api.importJSON === "function") {
            const originalImport = api.importJSON.bind(api);

            api.importJSON = function (file) {
                return readFileAsText(file).then(text => {
                    const importedData = JSON.parse(text);

                    return originalImport(file).then(result => {
                        if (Array.isArray(importedData.memos)) {
                            saveMemos(importedData.memos);
                            refresh();
                        }

                        return result;
                    });
                });
            };
        }


        /* -----------------------------------------
         * 初期状態へのリセット
         * ----------------------------------------- */

        if (typeof api.reset === "function") {
            const originalReset = api.reset.bind(api);

            api.reset = function (...args) {
                const result = originalReset(...args);

                localStorage.removeItem(MEMO_STORAGE_KEY);

                memos = [];
                editingId = null;

                refresh();

                return result;
            };
        }


        /* -----------------------------------------
         * 全データ削除
         * ----------------------------------------- */

        if (typeof api.clearAll === "function") {
            const originalClearAll =
                api.clearAll.bind(api);

            api.clearAll = function (...args) {
                const result = originalClearAll(...args);

                localStorage.removeItem(MEMO_STORAGE_KEY);

                memos = [];
                editingId = null;

                refresh();

                return result;
            };
        }
    }


    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            if (!(file instanceof Blob)) {
                reject(
                    new Error("JSONファイルを指定してください。")
                );
                return;
            }

            const reader = new FileReader();

            reader.onload = event => {
                resolve(safeString(event.target.result));
            };

            reader.onerror = () => {
                reject(
                    new Error("ファイルを読み込めませんでした。")
                );
            };

            reader.readAsText(file, "utf-8");
        });
    }


    /* =====================================================
     * メッセージ表示
     * ===================================================== */

    function notify(message) {
        if (
            window.AppAPI &&
            typeof window.AppAPI.notify === "function"
        ) {
            window.AppAPI.notify(message);
        } else {
            console.log(message);
        }
    }


    /* =====================================================
     * HTMLエスケープ
     * ===================================================== */

    function escapeHTML(value) {
        return safeString(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
     * 日時表示
     * ===================================================== */

    function formatDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }

    /* =====================================================
     * メモ画面の作成
     *
     * index.htmlを大きく書き換えなくても、
     * memo.jsの読み込み時に画面パーツを追加する。
     * ===================================================== */

    function ensureMemoPage() {
        let page = document.getElementById("memoPage");

        if (!page) {
            page = document.createElement("section");

            page.id = "memoPage";
            page.className = "page";

            const guidePage =
                document.getElementById("guidePage");

            const main =
                guidePage?.parentElement ||
                document.querySelector("main") ||
                document.getElementById("app");

            if (main) {
                if (guidePage && guidePage.parentElement === main) {
                    main.insertBefore(page, guidePage);
                } else {
                    main.appendChild(page);
                }
            } else {
                console.error(
                    "メモ画面を配置できる要素が見つかりません。"
                );

                return null;
            }
        }

        return page;
    }


    /* =====================================================
     * ナビゲーションに「メモ」を追加
     * ===================================================== */

    function ensureMemoNavigation() {
        const navigation =
            document.querySelector(".bottomNav");

        if (!navigation) {
            console.warn(
                "下部ナビゲーションが見つかりません。"
            );

            return;
        }

        let button = navigation.querySelector(
            '[data-page="memo"]'
        );

        if (button) {
            return;
        }

        button = document.createElement("button");

        button.type = "button";
        button.className = "navButton";
        button.dataset.page = "memo";

        button.innerHTML = `
            <span class="memoNavIcon" aria-hidden="true">📝</span>
            <span>メモ</span>
        `;

        const guideButton = navigation.querySelector(
            '[data-page="guide"]'
        );

        if (guideButton) {
            navigation.insertBefore(button, guideButton);
        } else {
            navigation.appendChild(button);
        }
    }


    /* =====================================================
     * カテゴリ選択肢
     * ===================================================== */

    function createCategoryOptions(includeAll = false) {
        const categories = includeAll
            ? ["すべて", ...CATEGORIES]
            : CATEGORIES;

        return categories
            .map(category => `
                <option value="${escapeHTML(category)}">
                    ${escapeHTML(category)}
                </option>
            `)
            .join("");
    }


    /* =====================================================
     * 画面のHTML作成
     * ===================================================== */

    function renderShell() {
        const page = ensureMemoPage();

        if (!page) {
            return;
        }

        page.innerHTML = `
            <div class="memoHeader">
                <h2>📝 メモ</h2>
                <p>
                    授業の記録、提出物、考査・成績などを
                    自由にまとめて管理できます。
                </p>
            </div>

            <section class="card memoEditorCard">
                <h3 id="memoEditorHeading">メモを作成</h3>

                <form id="memoForm">
                    <div class="memoFormField">
                        <label for="memoTitle">タイトル</label>
                        <input
                            type="text"
                            id="memoTitle"
                            name="title"
                            maxlength="120"
                            placeholder="例：2学期期末考査の結果"
                            required
                        >
                    </div>

                    <div class="memoFormField">
                        <label for="memoCategory">カテゴリ</label>
                        <select
                            id="memoCategory"
                            name="category"
                            required
                        >
                            ${createCategoryOptions()}
                        </select>
                    </div>

                    <div class="memoFormField">
                        <label for="memoBody">内容</label>
                        <textarea
                            id="memoBody"
                            name="body"
                            rows="6"
                            maxlength="20000"
                            placeholder="内容、点数、振り返り、先生からの連絡など"
                        ></textarea>
                    </div>

                    <div class="memoFormButtons">
                        <button
                            type="submit"
                            id="memoSaveButton"
                            class="primaryButton"
                        >
                            メモを保存
                        </button>

                        <button
                            type="button"
                            id="memoCancelButton"
                            class="memoSecondaryButton"
                            hidden
                        >
                            編集をキャンセル
                        </button>
                    </div>
                </form>
            </section>

            <section class="card memoListCard">
                <div class="memoListHeader">
                    <h3>保存したメモ</h3>
                    <span id="memoCount" class="memoCount">0件</span>
                </div>

                <div class="memoFilters">
                    <div class="memoFormField">
                        <label for="memoSearch">キーワード検索</label>
                        <input
                            type="search"
                            id="memoSearch"
                            placeholder="タイトルや内容から検索"
                            autocomplete="off"
                        >
                    </div>

                    <div class="memoFormField">
                        <label for="memoFilterCategory">カテゴリで絞り込み</label>
                        <select id="memoFilterCategory">
                            ${createCategoryOptions(true)}
                        </select>
                    </div>
                </div>

                <div
                    id="memoList"
                    class="memoList"
                    aria-live="polite"
                ></div>
            </section>
        `;

        bindMemoEvents(page);
        renderList();
    }


    /* =====================================================
     * 絞り込み
     * ===================================================== */

    function getFilteredMemos() {
        const keyword = searchKeyword
            .trim()
            .toLocaleLowerCase("ja");

        return memos
            .filter(memo => {
                if (
                    selectedCategory !== "すべて" &&
                    memo.category !== selectedCategory
                ) {
                    return false;
                }

                if (!keyword) {
                    return true;
                }

                const searchableText = (
                    memo.title + " " + memo.body + " " + memo.category
                ).toLocaleLowerCase("ja");

                return searchableText.includes(keyword);
            })
            .sort((a, b) => {
                return (
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                );
            });
    }


    /* =====================================================
     * メモ一覧を表示
     * ===================================================== */

    function renderList() {
        const list = document.getElementById("memoList");
        const count = document.getElementById("memoCount");

        if (!list || !count) {
            return;
        }

        const filteredMemos = getFilteredMemos();

        count.textContent = `${filteredMemos.length}件`;

        if (filteredMemos.length === 0) {
            const hasSearch =
                searchKeyword.trim() !== "" ||
                selectedCategory !== "すべて";

            list.innerHTML = hasSearch
                ? `
                    <div class="memoEmpty">
                        <div class="memoEmptyIcon">🔎</div>
                        <p>条件に一致するメモがありません。</p>
                        <p class="memoEmptySub">
                            キーワードやカテゴリを変更してください。
                        </p>
                    </div>
                `
                : `
                    <div class="memoEmpty">
                        <div class="memoEmptyIcon">🗒️</div>
                        <p>まだメモがありません。</p>
                        <p class="memoEmptySub">
                            上のフォームから最初のメモを作成しましょう。
                        </p>
                    </div>
                `;

            return;
        }

        list.innerHTML = filteredMemos
            .map(memo => {
                const isEditing = memo.id === editingId;

                return `
                    <article
                        class="memoItem${isEditing ? " memoItemEditing" : ""}"
                        data-memo-id="${escapeHTML(memo.id)}"
                    >
                        <div class="memoItemTop">
                            <span class="memoCategoryBadge">
                                ${escapeHTML(memo.category)}
                            </span>

                            <span class="memoDate">
                                更新：${escapeHTML(formatDate(memo.updatedAt))}
                            </span>
                        </div>

                        <h4 class="memoItemTitle">
                            ${escapeHTML(memo.title)}
                        </h4>

                        ${
                            memo.body.trim()
                                ? `
                                    <div class="memoItemBody">${
                                        escapeHTML(memo.body)
                                    }</div>
                                `
                                : `
                                    <p class="memoNoBody">
                                        内容は未入力です。
                                    </p>
                                `
                        }

                        <div class="memoItemFooter">
                            <span class="memoCreatedDate">
                                作成：${escapeHTML(formatDate(memo.createdAt))}
                            </span>

                            <div class="memoItemActions">
                                <button
                                    type="button"
                                    class="memoEditButton"
                                    data-memo-action="edit"
                                    data-memo-id="${escapeHTML(memo.id)}"
                                >
                                    編集
                                </button>

                                <button
                                    type="button"
                                    class="memoDeleteButton"
                                    data-memo-action="delete"
                                    data-memo-id="${escapeHTML(memo.id)}"
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");
    }


    /* =====================================================
     * 編集フォームを初期状態に戻す
     * ===================================================== */

    function resetEditor() {
        editingId = null;

        const form = document.getElementById("memoForm");
        const heading = document.getElementById("memoEditorHeading");
        const saveButton = document.getElementById("memoSaveButton");
        const cancelButton = document.getElementById("memoCancelButton");

        if (form) {
            form.reset();
        }

        if (heading) {
            heading.textContent = "メモを作成";
        }

        if (saveButton) {
            saveButton.textContent = "メモを保存";
        }

        if (cancelButton) {
            cancelButton.hidden = true;
        }
    }


    /* =====================================================
     * メモを編集フォームへ読み込む
     * ===================================================== */

    function startEditing(id) {
        const memo = memos.find(item => item.id === id);

        if (!memo) {
            notify("編集するメモが見つかりません。");
            return;
        }

        editingId = memo.id;

        document.getElementById("memoTitle").value =
            memo.title;

        document.getElementById("memoCategory").value =
            memo.category;

        document.getElementById("memoBody").value =
            memo.body;

        document.getElementById("memoEditorHeading").textContent =
            "メモを編集";

        document.getElementById("memoSaveButton").textContent =
            "変更を保存";

        document.getElementById("memoCancelButton").hidden =
            false;

        renderList();

        document.getElementById("memoTitle").focus();

        document.getElementById("memoEditorHeading").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /* =====================================================
     * イベント設定
     * ===================================================== */

    function bindMemoEvents(page) {
        if (page.dataset.memoEventsBound === "true") {
            return;
        }

        page.dataset.memoEventsBound = "true";

        const form = page.querySelector("#memoForm");
        const cancelButton =
            page.querySelector("#memoCancelButton");

        const searchInput =
            page.querySelector("#memoSearch");

        const categoryFilter =
            page.querySelector("#memoFilterCategory");

        const list =
            page.querySelector("#memoList");


        /* -----------------------------------------
         * 新規作成・編集保存
         * ----------------------------------------- */

        form.addEventListener("submit", event => {
            event.preventDefault();

            const titleInput =
                page.querySelector("#memoTitle");

            const categoryInput =
                page.querySelector("#memoCategory");

            const bodyInput =
                page.querySelector("#memoBody");

            const title = titleInput.value.trim();
            const category = categoryInput.value;
            const body = bodyInput.value;

            if (!title) {
                notify("タイトルを入力してください。");
                titleInput.focus();
                return;
            }

            if (!CATEGORIES.includes(category)) {
                notify("カテゴリを選択してください。");
                categoryInput.focus();
                return;
            }

            const timestamp = nowISO();

            let updatedMemos;

            if (editingId !== null) {
                const existingMemo = memos.find(
                    item => item.id === editingId
                );

                if (!existingMemo) {
                    notify("編集するメモが見つかりません。");
                    resetEditor();
                    renderList();
                    return;
                }

                updatedMemos = memos.map(memo => {
                    if (memo.id !== editingId) {
                        return memo;
                    }

                    return {
                        ...memo,
                        title,
                        category,
                        body,
                        updatedAt: timestamp
                    };
                });

            } else {
                const newMemo = {
                    id: createId(),
                    title,
                    category,
                    body,
                    createdAt: timestamp,
                    updatedAt: timestamp
                };

                updatedMemos = [
                    newMemo,
                    ...memos
                ];
            }

            try {
                saveMemos(updatedMemos);

                resetEditor();

                // 保存したメモが検索条件に隠れないようにする
                searchKeyword = "";
                selectedCategory = "すべて";

                searchInput.value = "";
                categoryFilter.value = "すべて";

                renderList();

                notify("メモを保存しました。");

            } catch (error) {
                notify(error.message || "メモを保存できませんでした。");
            }
        });


        /* -----------------------------------------
         * 編集キャンセル
         * ----------------------------------------- */

        cancelButton.addEventListener("click", () => {
            resetEditor();
            renderList();
        });


        /* -----------------------------------------
         * キーワード検索
         * ----------------------------------------- */

        searchInput.addEventListener("input", () => {
            searchKeyword = searchInput.value;
            renderList();
        });


        /* -----------------------------------------
         * カテゴリ絞り込み
         * ----------------------------------------- */

        categoryFilter.addEventListener("change", () => {
            selectedCategory = categoryFilter.value;
            renderList();
        });


        /* -----------------------------------------
         * メモ一覧の編集・削除
         * ----------------------------------------- */

        list.addEventListener("click", event => {
            const button = event.target.closest(
                "[data-memo-action]"
            );

            if (!button || !list.contains(button)) {
                return;
            }

            const action = button.dataset.memoAction;
            const id = button.dataset.memoId;

            if (action === "edit") {
                startEditing(id);
                return;
            }

            if (action === "delete") {
                deleteMemo(id);
            }
        });
    }


    /* =====================================================
     * メモ削除
     * ===================================================== */

    function deleteMemo(id) {
        const target = memos.find(
            memo => memo.id === id
        );

        if (!target) {
            notify("削除するメモが見つかりません。");
            return;
        }

        const confirmed = window.confirm(
            `「${target.title}」を削除しますか？\n\nこの操作は取り消せません。`
        );

        if (!confirmed) {
            return;
        }

        const updatedMemos = memos.filter(
            memo => memo.id !== id
        );

        try {
            saveMemos(updatedMemos);

            if (editingId === id) {
                resetEditor();
            }

            renderList();

            notify("メモを削除しました。");

        } catch (error) {
            notify(error.message || "メモを削除できませんでした。");
        }
    }


    /* =====================================================
     * メモ機能用CSS
     *
     * 既存の色設定やダークモードの変数を使用する。
     * ===================================================== */

    function installStyles() {
        if (document.getElementById("memoStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "memoStyles";

        style.textContent = `
            /* メモ画面 */
            #memoPage {
                padding-bottom: 12px;
                color: var(--text);
            }

            #memoPage .memoHeader {
                margin: 4px 0 18px;
            }

            #memoPage .memoHeader h2 {
                margin-bottom: 6px;
                color: var(--primary);
                font-size: 24px;
            }

            #memoPage .memoHeader p {
                color: var(--gray);
                font-size: 14px;
                line-height: 1.8;
            }

            #memoPage .memoEditorCard,
            #memoPage .memoListCard {
                color: var(--text);
            }

            #memoPage .memoFormField {
                display: flex;
                flex-direction: column;
                gap: 7px;
                margin-bottom: 16px;
                min-width: 0;
            }

            #memoPage .memoFormField label {
                font-size: 14px;
                font-weight: 700;
            }

            #memoPage input,
            #memoPage select,
            #memoPage textarea {
                width: 100%;
                min-width: 0;
                padding: 12px;
                border: 1px solid var(--border);
                border-radius: 9px;
                background: var(--card);
                color: var(--text);
                font: inherit;
                font-size: 16px;
            }

            #memoPage textarea {
                min-height: 130px;
                resize: vertical;
                line-height: 1.8;
            }

            #memoPage input:focus,
            #memoPage select:focus,
            #memoPage textarea:focus {
                outline: 2px solid var(--primary);
                outline-offset: 1px;
            }

            #memoPage .memoFormButtons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
            }

            #memoPage .memoFormButtons button {
                min-height: 44px;
            }

            #memoPage .memoSecondaryButton {
                padding: 10px 16px;
                border: 1px solid var(--border);
                border-radius: 9px;
                background: var(--card);
                color: var(--text);
                cursor: pointer;
                font: inherit;
            }

            #memoPage .memoListHeader {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            #memoPage .memoListHeader h3 {
                margin: 0;
            }

            #memoPage .memoCount {
                flex-shrink: 0;
                padding: 4px 10px;
                border-radius: 999px;
                background: var(--background);
                color: var(--gray);
                font-size: 13px;
            }

            #memoPage .memoFilters {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                gap: 14px;
                margin-bottom: 18px;
            }

            #memoPage .memoFilters .memoFormField {
                margin-bottom: 0;
            }

            #memoPage .memoList {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            #memoPage .memoItem {
                min-width: 0;
                padding: 16px;
                border: 1px solid var(--border);
                border-radius: 12px;
                background: var(--card);
                overflow-wrap: anywhere;
            }

            #memoPage .memoItemEditing {
                border-color: var(--primary);
            }

            #memoPage .memoItemTop {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }

            #memoPage .memoCategoryBadge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 7px;
                background: var(--background);
                color: var(--primary);
                font-size: 12px;
                font-weight: 700;
            }

            #memoPage .memoDate,
            #memoPage .memoCreatedDate {
                color: var(--gray);
                font-size: 11px;
            }

            #memoPage .memoItemTitle {
                margin: 0 0 12px;
                color: var(--text);
                font-size: 17px;
                line-height: 1.6;
                overflow-wrap: anywhere;
            }

            #memoPage .memoItemBody {
                color: var(--text);
                font-size: 14px;
                line-height: 1.9;
                white-space: pre-wrap;
                overflow-wrap: anywhere;
            }

            #memoPage .memoNoBody {
                color: var(--gray);
                font-size: 13px;
                font-style: italic;
            }

            #memoPage .memoItemFooter {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 16px;
                padding-top: 12px;
                border-top: 1px solid var(--border);
            }

            #memoPage .memoItemActions {
                display: flex;
                gap: 8px;
            }

            #memoPage .memoItemActions button {
                min-height: 38px;
                padding: 7px 13px;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: var(--card);
                color: var(--text);
                font: inherit;
                font-size: 13px;
                cursor: pointer;
            }

            #memoPage .memoItemActions .memoEditButton {
                border-color: var(--primary);
                color: var(--primary);
            }

            #memoPage .memoItemActions .memoDeleteButton {
                border-color: var(--danger);
                color: var(--danger);
            }

            #memoPage .memoItemActions button:hover {
                background: var(--background);
            }

            #memoPage .memoEmpty {
                padding: 32px 16px;
                border: 1px dashed var(--border);
                border-radius: 12px;
                text-align: center;
            }

            #memoPage .memoEmptyIcon {
                margin-bottom: 8px;
                font-size: 32px;
            }

            #memoPage .memoEmpty p {
                color: var(--text);
            }

            #memoPage .memoEmpty .memoEmptySub {
                margin-top: 5px;
                color: var(--gray);
                font-size: 13px;
            }

            .bottomNav .memoNavIcon {
                font-size: 18px;
                line-height: 1.2;
            }

            @media (max-width: 600px) {
                #memoPage .memoHeader h2 {
                    font-size: 21px;
                }

                #memoPage .memoFilters {
                    grid-template-columns: minmax(0, 1fr);
                    gap: 10px;
                }

                #memoPage .memoItem {
                    padding: 13px;
                }

                #memoPage .memoItemFooter {
                    align-items: flex-start;
                    flex-direction: column;
                }

                #memoPage .memoItemActions {
                    width: 100%;
                }

                #memoPage .memoItemActions button {
                    flex: 1;
                }

                .bottomNav .navButton span {
                    font-size: 11px;
                }
            }
        `;

        document.head.appendChild(style);
    }


    /* =====================================================
     * 初期化・更新
     * ===================================================== */

    function init() {
        if (initialized) {
            refresh();
            return;
        }

        connectStorageAPI();

        ensureMemoPage();
        ensureMemoNavigation();
        installStyles();

        loadMemos();
        renderShell();

        initialized = true;
    }


    function refresh() {
        if (!initialized) {
            return;
        }

        loadMemos();
        renderList();
    }


    /* =====================================================
     * API公開
     * ===================================================== */

    window.MemoAPI = {
        init,
        refresh,
        loadMemos,
        saveMemos,
        getMemos: () => [...memos],
        getCategories: () => [...CATEGORIES]
    };


    /* =====================================================
     * 起動
     * ===================================================== */

    init();

})();