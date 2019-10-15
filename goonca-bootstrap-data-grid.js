/*
* Bootstrap DataGrid
* by @goonca (https://github.com/goonca)
*/

window.$goonca = (window.$goonca || {});

$goonca.dataGrid = function(props) {

  const HEADER_SELECTOR = '.goonca-datagrid-header';
  const TABLE_SELECTOR = '.goonca-bootstrap-data-grid';
  const ARROW_CLASSNAME = 'goonca-bootstrap-datagrid-arrow';
  const ARROW_DOWN_CLASSNAME = 'goonca-bootstrap-datagrid-arrow-down';
  const ARROW_UP_CLASSNAME = 'goonca-bootstrap-datagrid-arrow-reverse';

  //it will be assigned when _apply()
  let _headerColumns;

  /**
  * _syncronize()
  * set the columns width from the header table the same of the main table
  * @param  (none)
  * @return undefined
  */
  const _syncronize = () => {

    //the selector needs to be executed every time and
    //its result cant be stored once the table content is changeble
    $(`${TABLE_SELECTOR} tr:first`, this.wrapper).children()
      .each((i, cur) => $(_headerColumns.get(i)).css('width', $(cur).outerWidth()));
  }

  /**
  * _sort()
  * sort the main table respecting the data-type defined
  * @param  colPosition: index the the column to be sorted
  * @return undefined
  */
  const _sort = colPosition => {

    //map containing the sort operations
    const sortBy = new Map([
        ['text', (a, b) => (a < b ? -1 : a > b ? 1 : 0)],
        ['number', (a, b) => (a - b)],
        ['date', (a, b) => (new Date(a) - new Date(b))]
        //customs types can be added here
    ]);

    const getCellValue = cell => ($($(cell).children().get(colPosition)).text().toUpperCase());

    //remove the arrow down from all columns and rotate in case the columns to sort is already sorted
    _headerColumns.removeClass(`${ARROW_DOWN_CLASSNAME} ${this.sortedIndex != colPosition ? ARROW_UP_CLASSNAME : ''}`);

    //show the arrow in the right column and return its data-type
    const colType = $(_headerColumns.get(colPosition))
      .addClass(ARROW_DOWN_CLASSNAME)
      .toggleClass(this.sortedIndex == colPosition ? ARROW_UP_CLASSNAME : '')
      .data('type');

    //sort or reverse the columns array
    //** the result of the selector can't be stored once the table content is changeble
    $.fn.reverse = [].reverse;
    const sorted = $(`${TABLE_SELECTOR} tr`, this.wrapper)[this.sortedIndex == colPosition ? 'reverse' : 'sort']
      ((cur, next) => (sortBy.get(colType)(getCellValue(cur), getCellValue(next))));

    $(TABLE_SELECTOR, this.wrapper).empty().append(sorted);

    this.sortedIndex = colPosition;
  }

  /**
  * _apply()
  * apply the datagrid into the target defined in the properties
  * @param (none)
  * @return undefined
  */
  const _apply = () => {

    //re-apply param table to a jQuery object. Just in case it's not
    const table = $(props.target);

    //create wrapper container and append the table inside it
    const wrapper = this.wrapper = $('<div/>').insertBefore(table).append(table);

    //create the stick header container then clone the original table and
    //append the original header in the cloned table
    const header = $('<div/>')
      .addClass(`${HEADER_SELECTOR.substring(1)} sticky-top bg-white`)
      .append(
        $(table.get(0).cloneNode())
          .css('margin-bottom', '-1px')
          .removeClass(TABLE_SELECTOR.substring(1))
          .append(table.find('thead'))
      );

    //append the stick header in the wrapper container
    wrapper.prepend(header);

    (_headerColumns = $(`${HEADER_SELECTOR} .table tr:first`, this.wrapper).children())
      .addClass(`${ARROW_CLASSNAME} position-relative`)
      .each((i, cur) => ($(cur).off('.sort').on('click.sort', _sort.bind(this, i))));

    _syncronize();

    $(window).on('resize', _syncronize);

  }

  //public methods
  return {
    apply : _apply,
    getSortedIndex : () => (this.sortedIndex)
  }

}

//run time applying datagrid stylesheet
//@TODO : stylesheet file?
$('<style/>').prop('type', 'text/css')
  .html(
    '.goonca-bootstrap-datagrid-arrow:after{position:absolute;right:10px;display:none}' +
    '.goonca-bootstrap-datagrid-arrow-down:after{display:unset;}' +
    '.goonca-bootstrap-datagrid-arrow-reverse:after{transform:rotate(180deg);}}'
  ).appendTo('head');

$(document).ready(() => {

  $('.goonca-bootstrap-data-grid')
    .each((i, obj) => (new $goonca.dataGrid({target : $(obj)})).apply());
});

