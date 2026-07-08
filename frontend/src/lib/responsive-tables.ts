/** Labels table cells for stacked mobile card layout (matches drinsight-responsive). */
export function labelResponsiveTables(root: ParentNode = document) {
  const tables = root.querySelectorAll("table");

  for (const tbl of tables) {
    if (tbl.getAttribute("data-rtbl")) continue;

    const head = tbl.querySelector("thead tr");
    let headerCells: NodeListOf<Element> | undefined;
    let hideFirstRow = false;

    if (head) {
      headerCells = head.querySelectorAll("th,td");
    } else {
      const firstRow = tbl.querySelector("tr");
      if (!firstRow) continue;
      headerCells = firstRow.querySelectorAll("th");
      if (!headerCells.length) continue;
      hideFirstRow = true;
    }

    const labels = Array.from(headerCells).map((cell) => cell.textContent?.trim() ?? "");
    if (!labels.length) continue;

    let rows = tbl.querySelectorAll("tbody tr");
    if (!rows.length) rows = tbl.querySelectorAll("tr");

    rows.forEach((row, rowIndex) => {
      if (hideFirstRow && rowIndex === 0) return;
      const cells = row.querySelectorAll("td");
      cells.forEach((cell, cellIndex) => {
        const label = labels[cellIndex];
        if (label && !cell.hasAttribute("data-label")) {
          cell.setAttribute("data-label", label);
        }
      });
    });

    tbl.classList.add("rtbl");
    tbl.setAttribute("data-rtbl", "1");
  }
}
