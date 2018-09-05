import { describe, PropTypes } from 'react-desc';

export const doc = (TableCell) => {
  const DocumentedTableCell = describe(TableCell)
    .description('A cell of data in a table.'
    ).usage(
      `import { TableCell } from 'grommet';
<TableCell />`
    );

  DocumentedTableCell.propTypes = {
    colSpan: PropTypes.string
      .description('The colSpan that should be applied to the cell.'),
    plain: PropTypes.bool
      .description('Whether default styling context should be removed.'),
    scope: PropTypes.oneOf(['col', 'row'])
      .description(`For header cells, what scope the header is for.
        Typically, the cells in a TableHeader have 'col' scope and
        the primary cell in each row in the TableBody has 'row' scope.`),
    size: PropTypes.oneOf(
      ['xxsmall', 'xsmall', 'small', 'medium', 'large', 'xlarge',
        '1/2', '1/3', '2/3', '1/4', '3/4']
    ).description(`What size the cell should be. Typically, this is not needed
      unless you are trying to align multiple tables.`),
    verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom'])
      .description('How to align the contents vertically.'),
  };

  return DocumentedTableCell;
};
