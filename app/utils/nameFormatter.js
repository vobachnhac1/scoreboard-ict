export function formatMatchName(name, t) {
    if (!name || typeof name !== "string") return name;
    if (name === "Miễn đấu") {
        return t("bracket_merge.bye_name") || "Miễn đấu";
    }
    if (name.startsWith("win.")) {
        return name.replace("win.", t("bracket_merge.win_prefix") + " ");
    }
    return name;
}
