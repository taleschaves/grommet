import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';

import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow } from '../';
import { Text } from '../Text';
import { Grommet } from '../Grommet';
import { grommet } from '../../themes';

// Always should store amount in cents to avoid precision errors
const DATA = [
  {
    id: 1, name: 'Eric Lastname', email: 'eric@local', amount: 3775,
  },
  {
    id: 2, name: 'Chris Lastname', email: 'chris@local', amount: 5825,
  },
  {
    id: 3, name: 'Alan Lastname', email: 'alan@local', amount: 4300,
  },
];

let TOTAL = 0;
DATA.forEach((datum) => { TOTAL += datum.amount; });

const amountFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const COLUMNS = [
  {
    property: 'name',
    label: 'Name',
    dataScope: 'row',
    colSpan: 2,
    format: datum => <strong>{datum.name}</strong>,
  },
  {
    property: 'email',
    label: 'Email',
  },
  {
    property: 'amount',
    label: 'Amount',
    align: 'end',
    footer: amountFormatter.format(TOTAL / 100),
    format: datum => amountFormatter.format(datum.amount / 100),
  },
];

class SimpleTable extends Component {
  render() {
    return (
      <Grommet theme={grommet}>
        <Table caption='Simple Table'>
          <TableHeader>
            <TableRow>
              {COLUMNS.map(c => (
                <TableCell
                  colSpan={c.colSpan}
                  key={c.property}
                  scope='col'
                  border='bottom'
                  align={c.align}
                >
                  <Text>{c.label}</Text>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {DATA.map(datum => (
              <TableRow key={datum.id}>
                {COLUMNS.map(c => (
                  <TableCell
                    colSpan={c.colSpan}
                    key={c.property}
                    scope={c.dataScope}
                    align={c.align}
                  >
                    <Text>
                      {c.format ? c.format(datum) : datum[c.property]}
                    </Text>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              {COLUMNS.map(c => (
                <TableCell
                  colSpan={c.colSpan}
                  key={c.property}
                  border='top'
                  align={c.align}
                >
                  <Text>{c.footer}</Text>
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </Grommet>
    );
  }
}

storiesOf('Table', module)
  .add('Simple Table', () => <SimpleTable />);
