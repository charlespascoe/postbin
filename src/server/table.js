export default class Table {
  constructor(headings) {
    this.headings = headings;
    this.rows = [];
  }

  addRow(row) {
    if (row.length !== this.headings.length) throw new Error(`Row incorrect length (expected ${this.headings.length}, got ${row.length})`);

    this.rows.push(row);
  }

  toString(colSpacer = ' ') {
    let colWidths = [];

    for (let col = 0; col < this.headings.length; col++) {
      colWidths.push(this.headings[col].length);
    }

    for (let row of this.rows) {
      for (let col = 0; col < this.headings.length; col++) {
        let len = String(row[col]).length;

        if (len > colWidths[col]) colWidths[col] = len;
      }
    }

    let output = this.formatRow(this.headings, colWidths, colSpacer) + '\n';
    output += '-'.repeat(output.length - 1) + '\n';

    for (let row of this.rows) {
      output += this.formatRow(row, colWidths, colSpacer) + '\n';
    }

    return output;
  }

  sort(func) {
    this.rows.sort(func);
  }

  formatRow(row, colWidths, colSpacer) {
    let output = '';

    for (let col = 0; col < this.headings.length; col++) {
      if (col > 0) output += colSpacer;
      let padding = colWidths[col] - String(row[col]).length;
      output += row[col] + ' '.repeat(padding);
    }

    return output;
  }
}
