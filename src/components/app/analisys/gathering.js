const AVERAGE_NIGHT = 0;
const AVERAGE_MORNING = 8;

window.addEventListener("load", () => {
    setTimeout(() => {

        controller.canvas.addEventListener("click", () => {
            controller.lastSession.inSleep = !controller.lastSession.inSleep;
            dataDrawer.render();
        });

    }, 1000);
});

window.exportData = () => {
    console.log("Generating raw sessions...");
    const sessions = generateRawSessions();
    console.log("Done!");

    //Input
    console.log("Generating input matrix...");
    let input = [];
    for (const user of users) {
        const days = Object.values(user.days);
        const userDensity = days.reduce((a, day) => {
            return a + day.sessions.reduce((a, session) => {
                return a + session.length;
            }, 0);
        }, 0) / (days.length * 60 * 60 * 24) || 0;

        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            let longestBreak = 0;
            if (day.sessions.length > 0) {
                day.sessions.reduce((a, b) => {
                    const breakTime = timeDistance(a.to, b.from, true);
                    if (breakTime > longestBreak) {
                        longestBreak = breakTime;
                    }
                    return b;
                });
                //Manually check cross-day
                const a = day.sessions[day.sessions.length - 1].to;
                const b = (days[i+1] && days[i+1].sessions.length > 0)? days[i+1].sessions[0].from : a;

                const breakTime = timeDistance(a, b, true);
                if (breakTime > longestBreak) {
                    longestBreak = breakTime;
                }
            }

            for (let j = 0; j < day.sessions.length; j++) {
                const session = day.sessions[j];
                const beforeSession = day.sessions[j - 2] || (days[i - 1] ? days[i - 1].sessions[days[i - 1].sessions.length - 2] : {}) || {};
                const prevSession = day.sessions[j - 1] || (days[i - 1] ? days[i - 1].sessions[days[i - 1].sessions.length - 1] : {}) || {};
                const nextSession = day.sessions[j + 1] || (days[i + 1] ? days[i + 1].sessions[0] : {}) || {};
                const afterSession = day.sessions[j + 2] || (days[i + 1] ? days[i + 1].sessions[1] : {}) || {};

                const sessionData = [
                    //Distance from the night time
                    (1 - timeDistance(session.from, AVERAGE_NIGHT)),
                    (1 - timeDistance(session.to, AVERAGE_MORNING)),
                    //Duration
                    session.length / (60 * 60 * 12),
                    //Device
                    (["ipad", "windows", "web"].indexOf(session.device) != -1) ? 0 : 1,
                    //Distance from the before session to the prev session
                    timeDistance(beforeSession.to, prevSession.from, true) || 0,
                    //Prev session duration
                    prevSession.length / (60 * 60 * 12) || 0,
                    //Break from prev session
                    timeDistance(prevSession.to, session.from, true) || 0,
                    //Distance to the next session
                    timeDistance(session.to, nextSession.from, true) || 0,
                    //Next session duartion
                    nextSession.length / (60 * 60 * 12) || 0,
                    //Distance from the next session to the after session
                    timeDistance(nextSession.to, afterSession.from, true) || 0,
                    //The longest day break
                    longestBreak,
                    //User online density
                    userDensity
                ];
                input.push(sessionData);
            }
        }
    }
    console.log("Done!");
    console.log("Saving...");
    download(input, "input");

    //Answers
    console.log("Generating answers array...");
    let answers = [];
    for (const session of sessions) {
        answers.push((session.inSleep) ? 1 : 0);
    }
    console.log("Done!");
    console.log("Saving...");
    download(answers, "answers");
}


///TEMP
var time = 0;
window.importData = () => {
    upload((answers) => {
        let index = 0;

        for (const user of users) {
            for (const day of Object.values(user.days)) {
                for (const session of day.sessions) {
                    ///session.inSleep = (answers[index] == 1) ? true : false;
                    if (time == 0) {
                        session.inSleep = +answers[index];
                    } else if (answers[index] == 1) {
                        if (session.inSleep === 1) {
                            session.inSleep = 2;
                        } else {
                            session.inSleep = 3;
                        }
                    }
                    index++;
                }
            }
        }
        dataDrawer.render();
        time++;
    });
}

function timeDistance(time1, time2, ordered = false) {
    let nextDay = false;
    if (time1 == undefined || time2 == undefined) {
        return 0;
    }
    if (time1 instanceof Date && time2 instanceof Date) {
        if (time2.getDate() > time1.getDate()) {
            nextDay = true;
        }
    }

    if (time1 instanceof Date) {
        time1 = time1.getHours() + (time1.getMinutes() / 60);
    }
    if (time2 instanceof Date) {
        time2 = time2.getHours() + (time2.getMinutes() / 60);
    }

    if (!ordered) {
        return (Math.min(Math.abs(time1 - time2), Math.abs(time1 - (24 + time2))) / 12);
    } else {
        if (time2 < time1 || nextDay) time2 += 24;
        return (Math.abs(time2 - time1) / 12);
    }
}

function generateRawSessions() {
    let rawSessions = Object.values(users).map((user) => {
        const sessionArray = Object.values(user.days).map(day => day.sessions)
            .reduce(function (a, b) {
                return a.concat(b);
            }, []);

        return sessionArray;
    }).reduce(function (a, b) {
        return a.concat(b);
    }, []);

    console.log(rawSessions);
    return rawSessions;
}

function download(object, name) {
    var blob = new Blob([JSON.stringify(object)], {
        type: "application/json"
    });
    const a = document.createElement("a");
    a.setAttribute("href", URL.createObjectURL(blob));
    a.setAttribute("download", name + ".json");
    a.click();
}

function upload(callback) {
    let input = document.createElement("input");
    input.setAttribute("type", "file");
    input.click();

    console.log(input);
    input.addEventListener("change", () => {
        let reader = new FileReader();
        reader.onload = (e) => {
            callback(JSON.parse(e.target.result));
        };
        reader.readAsText(input.files[0]);
    });
}