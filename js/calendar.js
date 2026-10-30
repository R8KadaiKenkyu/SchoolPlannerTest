/* ==========================================
   School Planner
   calendar.js
   Complete Edition
========================================== */

(() => {

"use strict";


/* =====================================
   State
===================================== */

let currentDate = new Date();

let currentYear =
    currentDate.getFullYear();

let currentMonth =
    currentDate.getMonth();

let selectedDate = null;


/* =====================================
   Week
===================================== */

const WEEK = [

    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"

];


/* =====================================
   Date Utils
===================================== */

function pad(value){

    return String(value)
        .padStart(2,"0");

}


function formatDate(
    year,
    month,
    day
){

    return `${year}-${pad(month+1)}-${pad(day)}`;

}


function todayString(){

    const now =
        new Date();

    return formatDate(

        now.getFullYear(),

        now.getMonth(),

        now.getDate()

    );

}


function getDays(
    year,
    month
){

    return new Date(

        year,

        month+1,

        0

    ).getDate();

}


function getFirstDay(
    year,
    month
){

    return new Date(

        year,

        month,

        1

    ).getDay();

}


/* =====================================
   Schedule
===================================== */

function getSchedules(){

    if(

        window.DataAPI &&

        typeof DataAPI.getSchedules ===
        "function"

    ){

        return DataAPI.getSchedules();

    }

    return [];

}


function getSchedulesByDate(
    date
){

    return getSchedules()

        .filter(item =>

            String(item.date || "") ===
            String(date || "")

        )

        .sort((a,b) =>

            String(a.time || "")
                .localeCompare(
                    String(b.time || "")
                )

        );

}


/* =====================================
   Calendar
===================================== */

function renderCalendar(){

    const calendar =

        document.getElementById(
            "calendar"
        );


    if(!calendar){

        console.warn(
            "Calendar: #calendar が見つかりません。"
        );

        return;

    }


    const firstDay =

        getFirstDay(

            currentYear,

            currentMonth

        );


    const totalDays =

        getDays(

            currentYear,

            currentMonth

        );


    const today =

        todayString();


    let html = "";


    /* =================================
       Calendar Header
    ================================= */

    html += `

        <div class="calendarHeader">

            <button
                id="prevMonthButton"
                type="button"
                aria-label="前の月"
            >

                ◀

            </button>


            <h2>

                ${currentYear}年
                ${currentMonth + 1}月

            </h2>


            <button
                id="nextMonthButton"
                type="button"
                aria-label="次の月"
            >

                ▶

            </button>

        </div>

    `;


    /* =================================
       Calendar Grid
    ================================= */

    html += `

        <div class="calendarGrid">

    `;


    /* =================================
       Week
    ================================= */

    WEEK.forEach(day => {

        html += `

            <div class="calendarWeek">

                ${day}

            </div>

        `;

    });


    /* =================================
       Previous Empty Cells
    ================================= */

    for(
        let i = 0;
        i < firstDay;
        i++
    ){

        html += `

            <div
                class="calendarCell empty"
            ></div>

        `;

    }


    /* =================================
       Days
    ================================= */

    for(
        let day = 1;
        day <= totalDays;
        day++
    ){

        const date =

            formatDate(

                currentYear,

                currentMonth,

                day

            );


        const events =

            getSchedulesByDate(
                date
            );


        /* -----------------------------
           Today
        ----------------------------- */

        const isToday =

            date === today;


        /* -----------------------------
           Selected
        ----------------------------- */

        const isSelected =

            date === selectedDate;


        /* -----------------------------
           Classes
        ----------------------------- */

        let cellClass =

            "calendarCell";


        if(isToday){

            cellClass +=
                " today";

        }


        if(isSelected){

            cellClass +=
                " selected";

        }


        /* -----------------------------
           Cell
        ----------------------------- */

        html += `

            <div

                class="${cellClass}"

                data-date="${date}"

                role="button"

                tabindex="0"

                aria-label="${date}"

            >

                <div class="dayNumber">

                    ${day}

                </div>

        `;


        /* -----------------------------
           Event Count
        ----------------------------- */

        if(events.length){

            html += `

                <div class="eventDot">

                    ${events.length}

                </div>

            `;

        }


        html += `

            </div>

        `;

    }


    /* =================================
       Next Empty Cells
    ================================= */

    const usedCells =

        firstDay +
        totalDays;


    const totalCells =

        Math.ceil(
            usedCells / 7
        ) * 7;


    const remaining =

        totalCells -
        usedCells;


    for(
        let i = 0;
        i < remaining;
        i++
    ){

        html += `

            <div
                class="calendarCell empty"
            ></div>

        `;

    }


    html += `

        </div>

    `;


    calendar.innerHTML =
        html;


    bindCalendarEvents();

}


/* =====================================
   Schedule List
===================================== */

function renderScheduleList(
    date
){

    selectedDate =
        date;


    const list =

        document.getElementById(
            "scheduleList"
        );


    if(!list){

        return;

    }


    const schedules =

        getSchedulesByDate(
            date
        );


    if(!schedules.length){

        list.innerHTML = `

            <div class="emptyMessage">

                この日の予定はありません

            </div>

        `;

        return;

    }


    list.innerHTML =

        schedules

            .map(item => `

                <div
                    class="scheduleItem"
                >

                    <strong>

                        ${escapeHTML(
                            item.title || ""
                        )}

                    </strong>


                    <small>

                        ${escapeHTML(
                            item.time || "--:--"
                        )}

                    </small>


                    <p>

                        ${escapeHTML(
                            item.memo || ""
                        )}

                    </p>


                    <button

                        class="dangerButton
                        deleteScheduleButton"

                        data-id="${item.id}"

                    >

                        削除

                    </button>

                </div>

            `)

            .join("");


    bindScheduleDeleteButtons();

}


/* =====================================
   HTML Escape
===================================== */

function escapeHTML(value){

    return String(value ?? "")

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}


/* =====================================
   Schedule Delete Buttons
===================================== */

function bindScheduleDeleteButtons(){

    document

        .querySelectorAll(
            ".deleteScheduleButton"
        )

        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteSchedule(

                        Number(
                            button.dataset.id
                        )

                    );

                }
            );

        });

}


/* =====================================
   Calendar Events
===================================== */

function bindCalendarEvents(){

    /* =================================
       Previous Month
    ================================= */

    const prev =

        document.getElementById(
            "prevMonthButton"
        );


    if(prev){

        prev.onclick = () => {

            currentMonth--;


            if(
                currentMonth < 0
            ){

                currentMonth = 11;

                currentYear--;

            }


            renderCalendar();

        };

    }


    /* =================================
       Next Month
    ================================= */

    const next =

        document.getElementById(
            "nextMonthButton"
        );


    if(next){

        next.onclick = () => {

            currentMonth++;


            if(
                currentMonth > 11
            ){

                currentMonth = 0;

                currentYear++;

            }


            renderCalendar();

        };

    }


    /* =================================
       Date Cells
    ================================= */

    document

        .querySelectorAll(
            ".calendarCell[data-date]"
        )

        .forEach(cell => {


            const selectDate = () => {

                /* -------------------------
                   Selected Date
                ------------------------- */

                selectedDate =

                    cell.dataset.date;


                /* -------------------------
                   Schedule Date Input
                ------------------------- */

                const dateInput =

                    document.getElementById(
                        "scheduleDate"
                    );


                if(dateInput){

                    dateInput.value =
                        selectedDate;

                }


                /* -------------------------
                   Calendar Redraw
                ------------------------- */

                renderCalendar();


                /* -------------------------
                   Schedule List
                ------------------------- */

                renderScheduleList(
                    selectedDate
                );

            };


            /* -----------------------------
               Click
            ----------------------------- */

            cell.addEventListener(
                "click",
                selectDate
            );


            /* -----------------------------
               Keyboard
            ----------------------------- */

            cell.addEventListener(
                "keydown",
                event => {

                    if(

                        event.key ===
                        "Enter"

                        ||

                        event.key ===
                        " "

                    ){

                        event.preventDefault();

                        selectDate();

                    }

                }
            );

        });

}


/* =====================================
   Add Schedule
===================================== */

function addSchedule(
    schedule
){

    if(

        window.DataAPI &&

        typeof DataAPI.addSchedule ===
        "function"

    ){

        DataAPI.addSchedule(
            schedule
        );

    }


    /*
     * 追加した日付を選択状態にする
     */

    if(schedule?.date){

        selectedDate =
            schedule.date;

    }


    renderCalendar();


    if(selectedDate){

        renderScheduleList(
            selectedDate
        );

    }

}


/* =====================================
   Delete Schedule
===================================== */

function deleteSchedule(
    id
){

    if(

        window.DataAPI &&

        typeof DataAPI.deleteSchedule ===
        "function"

    ){

        DataAPI.deleteSchedule(
            id
        );

    }


    renderCalendar();


    if(selectedDate){

        renderScheduleList(
            selectedDate
        );

    }

}


/* =====================================
   Schedule Form
===================================== */

function bindScheduleForm(){

    const form =

        document.getElementById(
            "scheduleForm"
        );


    if(!form){

        return;

    }


    /*
     * 重複登録防止
     */

    if(
        form.dataset.calendarBound ===
        "true"
    ){

        return;

    }


    form.dataset.calendarBound =
        "true";


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const date =

                document.getElementById(
                    "scheduleDate"
                ).value;


            const time =

                document.getElementById(
                    "scheduleTime"
                ).value;


            const title =

                document.getElementById(
                    "scheduleTitle"
                ).value.trim();


            const memo =

                document.getElementById(
                    "scheduleMemo"
                ).value.trim();


            if(
                !date ||
                !title
            ){

                alert(
                    "日付とタイトルを入力してください"
                );

                return;

            }


            addSchedule({

                id: Date.now(),

                date,

                time,

                title,

                memo

            });


            form.reset();


            /*
             * 入力日付は
             * 選択中の日へ戻す
             */

            const dateInput =

                document.getElementById(
                    "scheduleDate"
                );


            if(dateInput){

                dateInput.value =

                    selectedDate ||
                    todayString();

            }

        }
    );

}


/* =====================================
   Today Schedule
===================================== */

function renderTodaySchedule(){

    const container =

        document.getElementById(
            "todaySchedule"
        );


    if(!container){

        return;

    }


    const today =
        todayString();


    const schedules =

        getSchedulesByDate(
            today
        );


    if(!schedules.length){

        container.innerHTML = `

            <div class="emptyMessage">

                今日の予定はありません

            </div>

        `;

        return;

    }


    container.innerHTML =

        schedules

            .map(item => `

                <div class="scheduleItem">

                    <strong>

                        ${escapeHTML(
                            item.title
                        )}

                    </strong>


                    <small>

                        ${escapeHTML(
                            item.time ||
                            "--:--"
                        )}

                    </small>


                    ${
                        item.memo
                            ? `
                                <p>
                                    ${escapeHTML(
                                        item.memo
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>

            `)

            .join("");

}


/* =====================================
   Next Schedule
===================================== */

function renderNextSchedule(){

    const container =

        document.getElementById(
            "nextSchedule"
        );


    if(!container){

        return;

    }


    const now =
        new Date();


    const schedules =

        getSchedules()

            .map(item => {

                const datetime =

                    new Date(

                        `${item.date}T${
                            item.time ||
                            "23:59"
                        }`

                    );


                return {
                    item,
                    datetime
                };

            })


            .filter(data => {

                return (

                    !Number.isNaN(
                        data.datetime.getTime()
                    )

                    &&

                    data.datetime >=
                    now

                );

            })


            .sort((a,b) => {

                return (

                    a.datetime -
                    b.datetime

                );

            });


    if(!schedules.length){

        container.innerHTML = `

            <div class="emptyMessage">

                今後の予定はありません

            </div>

        `;

        return;

    }


    const next =
        schedules[0].item;


    container.innerHTML = `

        <div
            class="scheduleItem todayCard"
        >

            <strong>

                ${escapeHTML(
                    next.title
                )}

            </strong>


            <small>

                ${escapeHTML(
                    next.date
                )}

                ${

                    next.time

                        ? ` ${
                            escapeHTML(
                                next.time
                            )
                        }`

                        : ""

                }

            </small>


            ${
                next.memo

                    ? `

                        <p>

                            ${escapeHTML(
                                next.memo
                            )}

                        </p>

                    `

                    : ""
            }

        </div>

    `;

}


/* =====================================
   Refresh
===================================== */

function refreshCalendar(){

    renderCalendar();


    if(!selectedDate){

        selectedDate =
            todayString();

    }


    renderScheduleList(
        selectedDate
    );


    /*
     * 選択日をフォームへ反映
     */

    const dateInput =

        document.getElementById(
            "scheduleDate"
        );


    if(dateInput){

        dateInput.value =
            selectedDate;

    }


    renderTodaySchedule();

    renderNextSchedule();

}


/* =====================================
   Initialize
===================================== */

function init(){

    /*
     * 初期選択日は今日
     */

    if(!selectedDate){

        selectedDate =
            todayString();

    }


    /*
     * 初期表示日
     */

    currentDate =
        new Date();


    currentYear =
        currentDate.getFullYear();


    currentMonth =
        currentDate.getMonth();


    /*
     * 日付入力
     */

    const dateInput =

        document.getElementById(
            "scheduleDate"
        );


    if(dateInput){

        dateInput.value =
            selectedDate;

    }


    /*
     * 初期描画
     */

    renderCalendar();


    renderScheduleList(
        selectedDate
    );


    bindScheduleForm();


    renderTodaySchedule();

    renderNextSchedule();

}


/* =====================================
   Public API
===================================== */

window.CalendarAPI = {

    init,

    refreshCalendar,

    renderCalendar,

    renderScheduleList,

    renderTodaySchedule,

    renderNextSchedule,

    addSchedule,

    deleteSchedule

};


/* =====================================
   Auto Initialize
===================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            if(
                document.getElementById(
                    "calendar"
                )
            ){

                init();

            }

        },
        {
            once:true
        }
    );

}
else{

    if(
        document.getElementById(
            "calendar"
        )
    ){

        init();

    }

}


/* =====================================
   End
===================================== */

})();