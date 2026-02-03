export const getCellName = (num: number) => {
    let name = "";
    const labels = ["A", "B", "C", "D", "E"];
    const index = Math.floor(num / 5);

    name = labels[index] || "";
    name += (num % 5) + 1;
    return name;
};