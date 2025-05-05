const fs = require("fs");

function checkByeNeeded(players){
    const targetCount = nextPowerOfTwo(Number(players));
    const numByesNeeded = targetCount - Number(players);
    return numByesNeeded
}

function nextPowerOfTwo(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

function generateKnockoutBracket(players, byeList = []) {
    const log = [];
    const n = players.length + byeList.length;
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(n)));
    const totalByesNeeded = totalSlots - players?.length;

    // Tự động thêm BYE nếu chưa đủ
    const allByes = [...byeList];
    while (allByes.length < totalByesNeeded) {
        allByes.push("BYE");
    }

    // Phân nhánh xen kẽ
    const left = [];
    const right = [];
    players.forEach((p, i) => {
        if (i % 2 === 0) left.push(p);
        else right.push(p);
    });

    // Chia đều số BYE cho 2 nhánh
    const byeLeftCount = Math.floor(allByes.length / 2);
    const byeRightCount = allByes.length - byeLeftCount;
    const byeLeft = allByes.slice(0, byeLeftCount);
    const byeRight = allByes.slice(byeLeftCount);

    // 🧩 Chèn BYE vào left nhánh theo quy tắc
    insertByesSmart(left, byeLeft);
    // 🧩 Chèn BYE vào right nhánh theo quy tắc
    insertByesSmart(right, byeRight);


    // Tạo cặp vòng 1 cho từng nhánh
    const round1Left = createPairs(left);
    const round1Right = createPairs(right);

    log.push({ round: 1, right: round1Right, left: round1Left });
    // console.log('log round 1: ', log);

    // Gom cặp thắng cho vòng tiếp theo
    let currentPlayers = [ ...round1Right, ...round1Left].map((ele,ind)=> simulateMatch(ele, ind+1, 1));
    // console.log('currentPlayers: ', currentPlayers);
    let round = 2;
    while (currentPlayers.length > 1) {
        const matches = createPairs(currentPlayers);
        log.push({ round, matches });
        currentPlayers = matches.map((ele,ind)=> simulateMatch(ele, ind+1, round));
        round++;
    }
    // exportBracketToHtml(log)
    return log;
}


// tạo đối tượng ảo phù hợp với miễn thi đấu
function insertByesSmart(branch, byeList) {
    if (byeList.length === 1) {
        branch.splice(0, 0, byeList[0]); // Thêm vào đầu
    } else if (byeList.length >= 2) {
        branch.splice(0, 0, byeList[0]); // Đầu
        branch.splice(branch.length, 0, byeList[1]); // Cuối
        // Thêm phần còn lại (nếu có) vào giữa
        for (let i = 2; i < byeList.length; i++) {
            const mid = Math.floor(branch.length / 2);
            branch.splice(mid, 0, byeList[i]);
        }
    }
}

function createPairs(array) {
    const pairs = [];
    for (let i = 0; i < array.length; i += 2) {
        const p1 = array[i] || "BYE";
        const p2 = array[i + 1] || "BYE";
        // tạo cặp đấu
        // pairs.push([p1, p2]);    
        const ID = 'M'+ generateShortUniqueId().toUpperCase();
        pairs.push({
            match_id: ID,
            ath_red:  p1,
            ath_blue:  p2,
            value:  [p1, p2]
        })
    }
    return pairs;
}

function simulateMatch(match, ind, round) {
    const {value, ath_red, ath_blue, match_id }=match
    const [p1, p2] = value;
    if (p1 === "BYE") return p2;
    if (p2 === "BYE") return p1;
    // return `Winner(${p1} vs ${p2})`;
    return match_id;
}


// xuất HTML
function exportBracketToHtml(log, filename = "knockout_bracket.html") {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Knockout Bracket</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        margin: 0;
        padding: 20px;
        text-align: center;
    }
    .bracket {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 60px;
        overflow-x: auto;
        padding: 20px;
    }
    .round {
        display: flex;
        flex-direction: column;
        gap: 30px;
        min-width: 150px;
        position: relative;
    }
    .round h2 {
        margin-bottom: 10px;
    }
    .match {
        position: relative;
        background: white;
        border: 2px solid #4caf50;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
        text-align: center;
    }
    .arrow {
        position: absolute;
        width: 60px;
        height: 2px;
        background: #555;
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
    }
    .arrow::after {
        content: "";
        position: absolute;
        right: 0;
        top: -5px;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 8px solid #555;
    }
</style>
</head>
<body>
    <h1>Knockout Bracket</h1>
    <div class="bracket">
        ${log.map((roundData, roundIndex) => `
            <div class="round">
                <h2>Round ${roundData.round}</h2>
                ${[
                    ...(roundData.left || []),
                    ...(roundData.right || []),
                    ...(roundData.matches || [])
                ]
                .filter(match => !(match[0] === "BYE" || match[1] === "BYE"))
                .map((match, matchIndex) => `
                    <div class="match">
                        <div>${match[0]}</div>
                        <div>vs</div>
                        <div>${match[1]}</div>
                        ${roundIndex < log.length - 1 ? '<div class="arrow"></div>' : ''}
                    </div>
                `).join("")}
            </div>
        `).join("")}
    </div>
</body>
</html>
`;
    fs.writeFileSync(filename, html, "utf-8");
    console.log(`✅ Đã xuất sơ đồ knockout có mũi tên vào: ${filename}`);
}

// tạo mã 
function generateShortUniqueId() {
    return `${Math.random().toString(36).substr(2, 5)}`;
}

module.exports = {
    checkByeNeeded: checkByeNeeded,
    generateKnockoutBracket: generateKnockoutBracket,
    generateShortUniqueId: generateShortUniqueId
}