/**
 * Hàm sinh chuỗi hạt giống dựa trên số vị trí trống (slots).
 * Chia cặp sao cho hạt giống đầu và cuối gặp nhau (ví dụ: 1 vs 16, 2 vs 15)
 * @param {number} numSlots - Số vị trí trống trên bracket, phải là luỹ thừa của 2
 * @returns {Array<number>} - Mảng danh sách hạt giống đã xếp cặp
 */
export function generateBracketOrder(numSlots) {
    if (numSlots <= 1) return [1];
    let bracket = [1, 2];
    for (let roundSize = 4; roundSize <= numSlots; roundSize *= 2) {
        let nextBracket = [];
        for (let i = 0; i < bracket.length; i++) {
            nextBracket.push(bracket[i]);
            nextBracket.push(roundSize + 1 - bracket[i]);
        }
        bracket = nextBracket;
    }
    return bracket;
}

// Hàm tính toán ưu tiên phân bổ Bye theo quy tắc Bracket chuẩn quốc tế (Seed S, S-1, S-2...)
function getStandardByePriority(numPairs, position) {
    if (numPairs <= 1) return [0];
    const bracket = generateBracketOrder(numPairs * 2);
    const pairsKeys = [];
    for (let i = 0; i < numPairs; i++) {
        // Ưu tiên các cặp chứa seed lớn nhất (ví dụ S=16 thì seed 16 nhận Bye đầu tiên)
        pairsKeys.push({ pairIndex: i, seed: bracket[i * 2 + 1] });
    }
    // Sắp xếp ưu tiên theo seed lớn nhất
    pairsKeys.sort((a, b) => b.seed - a.seed);

    const seq = pairsKeys.map((p) => p.pairIndex);

    if (position === "bottom") {
        // Ưu tiên nhánh dưới: ánh xạ đối xứng (Pair đầu thành Pair cuối)
        return seq.map((p) => numPairs - 1 - p);
    }
    return seq;
}

/**
 * Hàm tạo các trận đấu theo thể thức loại trực tiếp (Knockout) với tính năng xếp Bye.
 * @param {Array} athletes - Danh sách vận động viên. Mỗi vđv là 1 object có thuộc tính { name, weight, unit, country, ... }
 * @returns {Array} - Danh sách các trận đấu
 */
export function generateKnockoutMatches(athletes, byePosition = "bottom") {
    let sortedAthletes = [...athletes];

    const hasExplicitSeeds = sortedAthletes.some(
        (a) => a.seed !== null && a.seed !== undefined && !isNaN(a.seed),
    );

    // Nếu có dữ liệu seed (Thứ tự ưu tiên), tiến hành sắp xếp
    if (hasExplicitSeeds) {
        sortedAthletes.sort((a, b) => {
            const seedA = a.seed !== null && !isNaN(a.seed) ? Number(a.seed) : 9999;
            const seedB = b.seed !== null && !isNaN(b.seed) ? Number(b.seed) : 9999;
            return seedA - seedB;
        });
    }

    let targetSlots = sortedAthletes.length;
    if (targetSlots <= 1) return [];

    let S = 1;
    while (S < targetSlots) {
        S *= 2;
    }
    const bracketRounds = Math.log2(S);

    const N_athletes = sortedAthletes.length;
    const numPairs = S / 2;
    const numByes = S - N_athletes;

    // Chọn ra các cặp (Pair) sẽ nhận được Bye theo nguyên lý Bracket Seed
    const prioritySeq = getStandardByePriority(numPairs, byePosition);
    const byePairs = new Set(prioritySeq.slice(0, numByes));

    let currentRoundNodes = [];
    let athleteIdx = 0;

    for (let p = 0; p < numPairs; p++) {
        if (byePairs.has(p)) {
            // Pair này có 1 Bye. Xếp Athlete trước, Bye sau
            currentRoundNodes.push({
                type: "athlete",
                data: sortedAthletes[athleteIdx++],
            });
            currentRoundNodes.push({ type: "bye" });
        } else {
            // Pair này không có Bye (đấu thật Round 1)
            currentRoundNodes.push({
                type: "athlete",
                data: sortedAthletes[athleteIdx++],
            });
            currentRoundNodes.push({
                type: "athlete",
                data: sortedAthletes[athleteIdx++],
            });
        }
    }

    const matches = [];
    let matchCounter = 1;

    // Lặp qua từ vòng 1 đến vòng cuối (trung bình log2(S) vòng)
    for (let currentRound = 1; currentRound <= bracketRounds; currentRound++) {
        let nextRoundNodes = [];

        for (let i = 0; i < currentRoundNodes.length; i += 2) {
            const left = currentRoundNodes[i];
            const right = currentRoundNodes[i + 1];

            if (left.type === "bye" && right.type === "bye") {
                matches.push({
                    matchNo: `virtual_${currentRound}_${i / 2}`,
                    isVirtual: true,
                    roundIndex: currentRound,
                    roundName: `Vòng ${currentRound}`,
                    red_name: "Miễn đấu",
                    blue_name: "Miễn đấu",
                });
                nextRoundNodes.push({ type: "bye" });
            } else if (left.type === "bye" || right.type === "bye") {
                const activeNode = left.type === "bye" ? right : left;
                const activeName =
                    activeNode.type === "athlete"
                        ? activeNode.data.name || activeNode.data["Họ và tên"]
                        : `win.${activeNode.matchNo}`;

                matches.push({
                    matchNo: `virtual_${currentRound}_${i / 2}`,
                    isVirtual: true,
                    roundIndex: currentRound,
                    roundName: `Vòng ${currentRound}`,
                    red_name: left.type === "bye" ? "Miễn đấu" : activeName,
                    blue_name: right.type === "bye" ? "Miễn đấu" : activeName,
                });

                nextRoundNodes.push(activeNode);
            } else {
                // Cả hai đều đấu, thiết lập lưu thông tin Match thi đấu
                const redName =
                    left.type === "athlete"
                        ? left.data.name || left.data["Họ và tên"]
                        : `win.${left.matchNo}`;
                const redUnit =
                    left.type === "athlete"
                        ? left.data.unit || left.data.club || left.data["Đơn vị"] || ""
                        : "";
                const redCountry =
                    left.type === "athlete" ? left.data.country || "Việt Nam" : "";

                const blueName =
                    right.type === "athlete"
                        ? right.data.name || right.data["Họ và tên"]
                        : `win.${right.matchNo}`;
                const blueUnit =
                    right.type === "athlete"
                        ? right.data.unit || right.data.club || right.data["Đơn vị"] || ""
                        : "";
                const blueCountry =
                    right.type === "athlete" ? right.data.country || "Việt Nam" : "";

                // Trích chọn dữ liệu hạng cân nếu có từ 1 trong 2 VĐV
                const weightItem =
                    left.type === "athlete"
                        ? left.data
                        : right.type === "athlete"
                            ? right.data
                            : null;
                const weight = weightItem
                    ? weightItem.weight ||
                    weightItem.hang_can ||
                    weightItem["Hạng cân"] ||
                    ""
                    : "";

                // Gán thành trận đấu và đẩy vào Queue
                const match = {
                    matchNo: matchCounter,
                    roundIndex: currentRound,
                    roundName: `Vòng ${currentRound}`,
                    weight: weight,
                    red_name: redName,
                    red_unit: redUnit,
                    red_country: redCountry,
                    blue_name: blueName,
                    blue_unit: blueUnit,
                    blue_country: blueCountry,
                };

                matches.push(match);
                // Thiết lập trạng thái người thắng chờ đấu tại ID của trận vừa sinh ra
                nextRoundNodes.push({ type: "win", matchNo: matchCounter });
                matchCounter++;
            }
        }

        currentRoundNodes = nextRoundNodes;
    }

    // Chỉnh sửa tên Vòng thành thân thiện hơn (Ví dụ: Vòng Bán Kết, Vòng Tứ Kết)
    const totalMatches = matches.length;
    if (totalMatches > 0) {
        const finalRoundIndex = matches[totalMatches - 1].roundIndex;
        matches.forEach((m) => {
            const distanceFromFinal = finalRoundIndex - m.roundIndex;
            if (distanceFromFinal === 0) {
                m.roundName = "Chung kết";
                m.roundType = "CK";
            } else if (distanceFromFinal === 1) {
                m.roundName = "Bán kết";
                m.roundType = "BK";
            } else if (distanceFromFinal === 2) {
                m.roundName = `Vòng loại ${m.roundIndex}`;
                m.roundType = `VL${m.roundIndex}`;
            } else {
                m.roundName = `Vòng loại ${m.roundIndex}`;
                m.roundType = `VL${m.roundIndex}`;
            }
            // Đảm bảo sắp xếp Vòng loại -> TK -> BK -> CK bất kể số vòng của từng hạng cân khác nhau
            // Càng xa Chung kết (distance cao) thì roundWeight càng nhỏ để được xếp đá trước
            m.roundWeight = 100 - distanceFromFinal;
        });
    }

    return matches;
}

/**
 * Hàm đồng bộ và tính toán lại tham chiếu chuỗi ID 'win.X' sau khi mảng các trận đấu bị xáo trộn vị trí (qua Drag & Drop)
 * @param {Array} mixedMatches - Dàn danh sách mảng các Match đã được gộp lại và sắp xếp thủ công trên giao diện Kéo/Thả
 * @returns {Array} - Array Clone đã được làm mới lại matchNo chạy tịnh tiến, tính toàn vẹn phụ thuộc được giữ gốc
 */
export function reindexMatches(mixedMatches) {
    if (!mixedMatches || mixedMatches.length === 0) return [];

    // Clone mảng để không ảnh hưởng dữ liệu cũ
    const updatedMatches = JSON.parse(JSON.stringify(mixedMatches));

    // Bước 1: Lập Map ánh xạ ID cũ -> ID mới
    const mappingDict = {};

    updatedMatches.forEach((match, index) => {
        const oldMatchNo = match.matchNo;
        const newMatchNo = index + 1;

        mappingDict[oldMatchNo] = newMatchNo;
        match.matchNo = newMatchNo; // Reset thứ tự mới
    });

    // Helper sửa tham chiếu win.
    const updateWinReference = (name) => {
        if (name && typeof name === "string" && name.startsWith("win.")) {
            const parts = name.split(".");
            if (parts.length === 2) {
                const waitingForMatchNo = Number(parts[1]);
                if (mappingDict[waitingForMatchNo]) {
                    return `win.${mappingDict[waitingForMatchNo]}`;
                }
            }
        }
        return name;
    };

    // Bước 2: Quét sửa reference để vòng đời trọn vẹn
    updatedMatches.forEach((match) => {
        match.red_name = updateWinReference(match.red_name);
        match.blue_name = updateWinReference(match.blue_name);
    });

    return updatedMatches;
}
